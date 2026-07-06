const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { initDatabase, getDb, saveDatabase } = require('./database');
const { scanDirectory } = require('./scanner');
const { writeTagsToFile } = require('./tag-writer');
const { renamePhysicalFolder, deletePhysicalFolder } = require('./folder-engine');
const { buildRestructurePlan, executeRestructurePlan, cleanupEmptyFolders } = require('./restructure-engine');
const { getFingerprint } = require('./acoustic-fingerprint');
const { lookupAcoustID, getRecordingMetadata, getCoverArtUrl } = require('./musicbrainz-client');
const { runAutotagBatch } = require('./autotagger');

let mainWindow;

async function createWindow() {
  await initDatabase();

  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 1024,
    minHeight: 600,
    backgroundColor: '#0d0d12',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const indexPath = path.join(__dirname, 'dist', 'lomusic-interfaz-demo', 'browser', 'index.html');
  mainWindow.loadFile(indexPath);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function execToObjects(query, params = []) {
  const db = getDb();
  if (!db) return [];
  try {
    const stmt = db.prepare(query);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  } catch (err) {
    console.error('❌ Error ejecutando consulta WASM:', err.message);
    return [];
  }
}

// =========================================================================
// MOTOR DE LIMPIEZA ATÓMICA (Cero Canciones Fantasma)
// =========================================================================
function wipeDatabase() {
  const db = getDb();
  if (!db) return;
  
  // Borramos tabla por tabla en bloques try/catch individuales para que ningún error aborte la limpieza
  const tables = ['songs', 'albums', 'artists', 'genres'];
  tables.forEach(table => {
    try { 
      db.exec(`DELETE FROM ${table};`); 
    } catch (e) {}
  });

  saveDatabase(); // Persistencia inmediata en lomusic.db
  console.log("🧹 Catálogo musical reseteado y limpio al 100%.");
}

// Canal para limpiar manualmente al cambiar de carpeta o al salir
ipcMain.handle('clean-database', () => {
  wipeDatabase();
  return { success: true };
});

// =========================================================================
// CANALES IPC DE AUDITORÍA Y NAVEGACIÓN
// =========================================================================

function saveRootFolderPath(folderPath) {
  const db = getDb();
  if (!db) return;
  try {
    db.prepare('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)').run(['root_folder_path', folderPath]);
    saveDatabase();
  } catch (e) {
    console.error('❌ Error al guardar la ruta raíz de la biblioteca:', e.message);
  }
}

function getRootFolderPath() {
  const row = execToObjects("SELECT value FROM app_settings WHERE key = 'root_folder_path'")[0];
  return row && row.value ? row.value : null;
}


ipcMain.handle('scan-folder', async (event, folderPath) => {
  console.log(`🚀 Iniciando auditoría profunda en: ${folderPath}`);
  wipeDatabase(); // Limpieza absoluta garantizada antes de escanear
  await scanDirectory(folderPath);
  saveRootFolderPath(folderPath);
  return { success: true, message: "Escaneo completado" };
});


ipcMain.handle('open-folder-dialog', async () => {
  const musicPath = app.getPath('music'); 
  const result = await dialog.showOpenDialog(mainWindow, {
    defaultPath: musicPath,
    properties: ['openDirectory'],
    title: 'Selecciona la carpeta de tu Biblioteca Musical para Auditar'
  });

  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

ipcMain.handle('get-albums', () => {
  const query = `
    SELECT a.*, art.name as artist, 
    (SELECT COUNT(*) FROM songs WHERE album_id = a.id) as localTrackCount
    FROM albums a 
    JOIN artists art ON a.primary_artist_id = art.id
    ORDER BY a.title ASC
  `;
  return execToObjects(query);
});

// =========================================================================
// FUNCIÓN COMPARTIDA: misma query + mismo mapeo camelCase para
// "Todas las canciones", "Modificados" e "Incompletos".
// Acepta una cláusula WHERE opcional (ej: 'WHERE s.is_modified = 1')
// =========================================================================
function queryAndMapSongs(whereClause = '') {
  const query = `
    SELECT s.*, 
           a.title as album, 
           a.release_year as year,
           COALESCE(s.cover_art_path, a.cover_art_path) as cover_art_path, 
           art.name as artist, 
           g.name as genre
    FROM songs s
    JOIN albums a ON s.album_id = a.id
    JOIN artists art ON a.primary_artist_id = art.id
    LEFT JOIN genres g ON s.genre_id = g.id
    ${whereClause}
    ORDER BY s.title ASC
  `;
  const songs = execToObjects(query);

  return songs.map(song => {
    let coverBase64 = null;
    if (song.cover_art_path && fs.existsSync(song.cover_art_path)) {
      try {
        const imgBuffer = fs.readFileSync(song.cover_art_path);
        coverBase64 = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;
      } catch (e) {}
    }
    
    // CÁLCULO MATEMÁTICO DE DURACIÓN VISUAL (ej: 225000 ms -> "3:45")
    const ms = Number(song.duration_ms) || 0;
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const formattedDuration = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

    return {
    id: song.id,

    title: song.title,
    artist: song.artist,
    album: song.album,
    year: song.year,
    genre: song.genre,

    trackNumber: song.track_number,
    track: song.track_number ?? null,
    discNumber: song.disc_number ?? null,

    durationMs: Number(song.duration_ms) || 0,
    duration: formattedDuration,

    bitrate: Number(song.bitrate) || null,
    sampleRate: Number(song.sample_rate) || null,

    bpm: song.bpm,
    initialKey: song.initial_key,

    format: song.format,

    composer: song.composer,
    albumArtist: song.album_artist,
    publisher: song.publisher,
    copyright: song.copyright,
    lyrics: song.lyrics,

    filePath: song.file_path,

    coverUrl: coverBase64 || '',
    cover_data: coverBase64 || '',

    isModified: song.is_modified,
    isIncomplete: song.is_incomplete
    };
  });
}

// =========================================================================
// DETECCIÓN DE DUPLICADOS: agrupa por título normalizado + artista + duración
// =========================================================================
function getDuplicateSongs() {
  const dupKeys = execToObjects(`
    SELECT LOWER(TRIM(s.title)) as norm_title, 
           art.name as artist, 
           s.duration_ms as duration_ms, 
           COUNT(*) as cnt
    FROM songs s
    JOIN albums a ON s.album_id = a.id
    JOIN artists art ON a.primary_artist_id = art.id
    GROUP BY norm_title, artist, duration_ms
    HAVING cnt > 1
  `);

  if (dupKeys.length === 0) return [];

  const allSongs = queryAndMapSongs();
  return allSongs.filter(song => {
    const normTitle = (song.title || '').toLowerCase().trim();
    return dupKeys.some(k => 
      k.norm_title === normTitle && 
      k.artist === song.artist && 
      k.duration_ms === song.durationMs
    );
  });
}

// Canal Optimizado con Adaptador Puente para que todas las tablas HTML visualicen la duración "3:45"
ipcMain.handle('get-songs', () => {
  return queryAndMapSongs();
});

ipcMain.handle('get-folder-tree', () => {
  const rootFolderPath = getRootFolderPath();
  const songs = queryAndMapSongs(); // ← CAMBIO 1: antes era execToObjects con solo 4 columnas
  const root = { name: 'Raíz de tu Biblioteca', path: rootFolderPath || '', children: {}, songs: [] };

  songs.forEach(song => {
    const dirPath = path.dirname(song.filePath); // ← CAMBIO 2: antes era song.file_path (snake_case)

    let relativeDir = dirPath;
    if (rootFolderPath) {
      const rel = path.relative(rootFolderPath, dirPath);
      relativeDir = (rel && !rel.startsWith('..')) ? rel : '';
    }

    const parts = relativeDir.split(/[/\\]+/).filter(Boolean);
    let currentNode = root;

    parts.forEach((part, idx) => {
      if (!currentNode.children[part]) {
        const currentFullPath = parts.slice(0, idx + 1).join(path.sep);
        currentNode.children[part] = {
          name: part,
          path: currentFullPath,
          children: {},
          songs: []
        };
      }
      currentNode = currentNode.children[part];
    });

    currentNode.songs.push(song);
  });

  function formatNode(node) {
    return {
      name: node.name,
      path: node.path,
      songs: node.songs,
      children: Object.values(node.children).map(formatNode)
    };
  }

  return Object.values(root.children).map(formatNode);
});

// =========================================================================
// EDICIÓN DE ESTUDIO, PERSISTENCIA FÍSICA Y ESTADOS AVANZADOS
// =========================================================================

ipcMain.handle('change-cover-art', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Imágenes', extensions: ['jpg', 'jpeg', 'png', 'webp'] }],
    title: 'Selecciona la nueva carátula para el álbum'
  });

  if (result.canceled || result.filePaths.length === 0) return null;

  const selectedPath = result.filePaths[0];
  const coversDir = path.join(__dirname, 'covers');
  if (!fs.existsSync(coversDir)) fs.mkdirSync(coversDir);

  const newFileName = `custom_${Date.now()}${path.extname(selectedPath)}`;
  const destinationPath = path.join(coversDir, newFileName);
  fs.copyFileSync(selectedPath, destinationPath);

  const imgBuffer = fs.readFileSync(destinationPath);
  const base64Data = `data:image/${path.extname(selectedPath).replace('.', '')};base64,${imgBuffer.toString('base64')}`;

  return { physicalPath: destinationPath, base64: base64Data };
});

ipcMain.handle('update-song', async (event, updatedData) => {
  const db = getDb();
  if (!db) return { success: false };

  try {
    db.prepare('INSERT OR IGNORE INTO artists (name) VALUES (?)').run([updatedData.artist]);
    const artistRow = execToObjects('SELECT id FROM artists WHERE name = ?', [updatedData.artist])[0];

    db.prepare('INSERT OR IGNORE INTO albums (title, release_year, primary_artist_id) VALUES (?, ?, ?)').run([updatedData.album, updatedData.year || null, artistRow.id]);
    const albumRow = execToObjects('SELECT id FROM albums WHERE title = ? AND primary_artist_id = ?', [updatedData.album, artistRow.id])[0];
    if (updatedData.year) {
      db.prepare('UPDATE albums SET release_year = ? WHERE id = ?').run([updatedData.year, albumRow.id]);
    }

    let genreId = null;
    if (updatedData.genre) {
      db.prepare('INSERT OR IGNORE INTO genres (name) VALUES (?)').run([updatedData.genre]);
      const genreRow = execToObjects('SELECT id FROM genres WHERE name = ?', [updatedData.genre])[0];
      if (genreRow) genreId = genreRow.id;
    }

    if (updatedData.newCoverPhysicalPath) {
      db.prepare('UPDATE songs SET cover_art_path = ? WHERE id = ?').run([updatedData.newCoverPhysicalPath, updatedData.id]);
    }

    db.prepare(`
      UPDATE songs SET 
        title = ?, track_number = ?, disc_number = ?, bpm = ?, initial_key = ?, 
        album_artist = ?, publisher = ?, copyright = ?, lyrics = ?, composer = ?, 
        is_modified = 1, album_id = ?, genre_id = ? 
      WHERE id = ?
    `).run([
      updatedData.title, updatedData.trackNumber || updatedData.track_number || null, updatedData.discNumber || updatedData.disc_number || 1,
      updatedData.bpm || null, updatedData.initialKey || updatedData.initial_key || null, updatedData.albumArtist || updatedData.album_artist || null,
      updatedData.publisher || null, updatedData.copyright || null, updatedData.lyrics || null,
      updatedData.composer || null, albumRow.id, genreId, updatedData.id
    ]);

    const songRow = execToObjects('SELECT file_path FROM songs WHERE id = ?', [updatedData.id])[0];

    // Escritura real de tags en el archivo físico, antes de renombrar
    if (songRow && fs.existsSync(songRow.file_path)) {
      try {
        writeTagsToFile(songRow.file_path, updatedData, updatedData.newCoverPhysicalPath || null);
      } catch (tagErr) {
        console.error('⚠️ No se pudieron escribir los tags físicos (se guardó igual en el catálogo):', tagErr.message);
      }
    }

    if (songRow && fs.existsSync(songRow.file_path)) {
      const dir = path.dirname(songRow.file_path);
      const ext = path.extname(songRow.file_path);
      const safeTitle = updatedData.title.replace(/[/\\?%*:|"<>]/g, '');
      const newFilePath = path.join(dir, `${safeTitle}${ext}`);

      if (songRow.file_path !== newFilePath && !fs.existsSync(newFilePath)) {
        fs.renameSync(songRow.file_path, newFilePath);
        db.prepare('UPDATE songs SET file_path = ? WHERE id = ?').run([newFilePath, updatedData.id]);
      }
    }

    saveDatabase(); 
    return { success: true };
  } catch (err) {
    console.error('❌ Error al actualizar canción:', err);
    return { success: false };
  }
});

ipcMain.handle('rollback-song-official', async (event, songId) => {
  const db = getDb();
  if (!db) return { success: false };

  try {
    const song = execToObjects('SELECT * FROM songs WHERE id = ?', [songId])[0];
    if (!song) throw new Error('Canción no encontrada');

    const cleanTitle = path.basename(song.file_path, path.extname(song.file_path)).replace(/^\d+\s*-\s*/, '');
    db.prepare('UPDATE songs SET title = ? WHERE id = ?').run([cleanTitle, songId]);

    saveDatabase(); 
    return { success: true, restoredTitle: cleanTitle };
  } catch (err) {
    console.error('❌ Error al restaurar título original:', err.message);
    return { success: false };
  }
}); 

ipcMain.handle('delete-song', async (event, songId) => {
  const db = getDb();
  if (!db) return { success: false };

  try {
    const song = execToObjects('SELECT file_path, title FROM songs WHERE id = ?', [songId])[0];
    if (!song) return { success: false, error: 'No se encontró en BD' };

    if (fs.existsSync(song.file_path)) {
      fs.unlinkSync(song.file_path);
    }

    db.prepare('DELETE FROM songs WHERE id = ?').run([songId]);

    saveDatabase(); 
    return { success: true };
  } catch (err) {
    console.error('❌ Error al eliminar archivo físico:', err.message);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-modified-songs', () => {
  return queryAndMapSongs('WHERE s.is_modified = 1');
});

ipcMain.handle('get-incomplete-songs', () => {
  return queryAndMapSongs('WHERE s.is_incomplete = 1');
});

ipcMain.handle('get-duplicate-songs', () => {
  return getDuplicateSongs();
});

ipcMain.handle('rename-physical-folder', async (event, { relativePath, newName }) => {
  const rootFolderPath = getRootFolderPath();
  if (!rootFolderPath || !relativePath) {
    return { success: false, error: 'No hay una carpeta raíz configurada.' };
  }
  const safeName = newName.replace(/[/\\?%*:|"<>]/g, '').trim();
  if (!safeName) {
    return { success: false, error: 'Nombre inválido.' };
  }
  const absolutePath = path.join(rootFolderPath, relativePath);
  const result = renamePhysicalFolder(absolutePath, safeName);
  return result;
});

ipcMain.handle('delete-physical-folder', async (event, { relativePath }) => {
  const rootFolderPath = getRootFolderPath();
  if (!rootFolderPath || !relativePath) {
    return { success: false, error: 'No hay una carpeta raíz configurada.' };
  }
  const absolutePath = path.join(rootFolderPath, relativePath);
  const result = deletePhysicalFolder(absolutePath);
  return result;
});

ipcMain.handle('rescan-specific-folder', async (event, { relativePath }) => {
  const rootFolderPath = getRootFolderPath();
  if (!rootFolderPath || !relativePath) {
    return { success: false, error: 'No hay una carpeta raíz configurada.' };
  }
  const absolutePath = path.join(rootFolderPath, relativePath);
  try {
    await scanDirectory(absolutePath); // No hace wipeDatabase(): solo actualiza/inserta lo que encuentre en esa subcarpeta
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

  ipcMain.handle('restructure-library', async (event, mode) => {
  const rootFolderPath = getRootFolderPath();
  if (!rootFolderPath) {
    return { success: false, error: 'No hay una carpeta raíz configurada. Escanea una biblioteca primero.' };
  }

  try {
    const songs = queryAndMapSongs();
    const plan = buildRestructurePlan(songs, rootFolderPath, mode);
    const results = executeRestructurePlan(plan);
    const cleanup = cleanupEmptyFolders(rootFolderPath);

    return {
      success: true,
      moved: results.moved,
      failed: results.failed,
      failures: results.failures,
      cleanedFolders: cleanup.deletedFolders,
      leftoverFilesMoved: cleanup.movedFiles,
      skippedFolders: cleanup.skippedFolders
    };
  } catch (err) {
    console.error('❌ Error durante la reestructuración de biblioteca:', err.message);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('cleanup-orphan-folders', async () => {
  const rootFolderPath = getRootFolderPath();
  if (!rootFolderPath) {
    return { success: false, error: 'No hay una carpeta raíz configurada.' };
  }
  try {
    const cleanup = cleanupEmptyFolders(rootFolderPath);
    return {
      success: true,
      cleanedFolders: cleanup.deletedFolders,
      leftoverFilesMoved: cleanup.movedFiles,
      skippedFolders: cleanup.skippedFolders
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// CANAL DE PRUEBA TEMPORAL — solo para validar el Paso 1 antes de construir el orquestador
ipcMain.handle('test-fingerprint', async (event, songId) => {
  try {
    const song = execToObjects('SELECT file_path FROM songs WHERE id = ?', [songId])[0];
    if (!song) return { success: false, error: 'Canción no encontrada' };

    const result = await getFingerprint(song.file_path);
    console.log('✅ Fingerprint obtenido:', result.fingerprint.substring(0, 50) + '...', 'Duración:', result.durationSeconds);
    return { success: true, ...result };
  } catch (err) {
    console.error('❌ Error de fingerprint:', err.message);
    return { success: false, error: err.message };
  }
});

// CANAL DE PRUEBA TEMPORAL — valida identificación completa de UNA canción, sin escribir nada todavía
ipcMain.handle('test-identify', async (event, songId) => {
  try {
    const song = execToObjects('SELECT file_path FROM songs WHERE id = ?', [songId])[0];
    if (!song) return { success: false, error: 'Canción no encontrada' };

    console.log('🎧 Generando huella acústica...');
    const fp = await getFingerprint(song.file_path);

    console.log('🔍 Consultando AcoustID...');
    const acoustidResult = await lookupAcoustID(fp.fingerprint, fp.durationSeconds);

    if (!acoustidResult) {
      console.log('⚠️ Sin coincidencias en AcoustID para esta pista.');
      return { success: true, matched: false };
    }

    console.log(`✅ Coincidencia encontrada (score: ${acoustidResult.score}). Consultando MusicBrainz...`);
    const metadata = await getRecordingMetadata(acoustidResult.recordingMbid);

    console.log('🖼️ Buscando portada oficial...');
    const coverUrl = await getCoverArtUrl(metadata.releaseMbid);

    const finalResult = { ...metadata, coverUrl, matchScore: acoustidResult.score };
    console.log('🎉 Resultado final:', finalResult);

    return { success: true, matched: true, data: finalResult };
  } catch (err) {
    console.error('❌ Error durante identificación:', err.message);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('start-autotag', async (event) => {
  const incompleteSongs = execToObjects('SELECT id, file_path FROM songs WHERE is_incomplete = 1');

  if (incompleteSongs.length === 0) {
    return { success: true, processed: 0, identified: 0, skipped: 0, failed: 0, details: [] };
  }

  const songsForBatch = incompleteSongs.map(s => ({ id: s.id, filePath: s.file_path }));

  const results = await runAutotagBatch(songsForBatch, (progress) => {
    // Envía el progreso en vivo a la ventana de Angular
    if (mainWindow) {
      mainWindow.webContents.send('autotag-progress', progress);
    }
  });

  // Marca como completas (is_incomplete = 0) las que sí se identificaron correctamente
  const db = getDb();
  const identifiedIds = results.details
    .filter(d => d.status === 'identificada')
    .map(d => d.id);

  identifiedIds.forEach(id => {
    db.prepare('UPDATE songs SET is_incomplete = 0 WHERE id = ?').run([id]);
  });
  saveDatabase();

  return { success: true, ...results };
});

ipcMain.handle('scan-and-standardize', async (event, folderPath) => {
  console.log(`🚀 Iniciando auditoría profunda en: ${folderPath}`);
  wipeDatabase();
  await scanDirectory(folderPath);
  saveRootFolderPath(folderPath);

  if (mainWindow) mainWindow.webContents.send('autotag-progress', { phase: 'scanning-done' });

  const allSongs = execToObjects(`
  SELECT s.id, s.file_path, s.title,
         a.release_year as year,
         a.title as album, art.name as artist, g.name as genre
  FROM songs s
  JOIN albums a ON s.album_id = a.id
  JOIN artists art ON a.primary_artist_id = art.id
  LEFT JOIN genres g ON s.genre_id = g.id
`);

  const candidates = allSongs;
  let autotagResults = { processed: 0, identified: 0, skipped: 0, failed: 0, details: [] };

  if (candidates.length > 0) {
    const songsForBatch = candidates.map(s => ({
      id: s.id, filePath: s.file_path, title: s.title, artist: s.artist, album: s.album, year: s.year, genre: s.genre
    }));

    autotagResults = await runAutotagBatch(songsForBatch, (progress) => {
      if (mainWindow) mainWindow.webContents.send('autotag-progress', { phase: 'standardizing', ...progress });
    });

    // Reutilizamos tu propio motor de escaneo (ya probado) para releer los archivos
    // físicamente corregidos y sincronizar SQLite. No reimplementamos esa lógica.
    if (mainWindow) mainWindow.webContents.send('autotag-progress', { phase: 'syncing' });
    await scanDirectory(folderPath);
  }

  if (mainWindow) mainWindow.webContents.send('autotag-progress', { phase: 'done' });

  return { success: true, autotag: autotagResults };
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});