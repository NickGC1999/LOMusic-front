const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { initDatabase, getDb, saveDatabase } = require('./database');
const { scanDirectory } = require('./scanner');

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

ipcMain.handle('scan-folder', async (event, folderPath) => {
  console.log(`🚀 Iniciando auditoría profunda en: ${folderPath}`);
  wipeDatabase(); // Limpieza absoluta garantizada antes de escanear
  await scanDirectory(folderPath);
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


// Canal Optimizado con Adaptador Puente para que todas las tablas HTML visualicen la duración "3:45"
ipcMain.handle('get-songs', () => {
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
});

ipcMain.handle('get-folder-tree', () => {
  const songs = execToObjects('SELECT id, title, file_path, format FROM songs ORDER BY file_path ASC');
  const root = { name: 'Raíz del Sistema', path: '', children: {}, songs: [] };

  songs.forEach(song => {
    const dirPath = path.dirname(song.file_path);
    const parts = dirPath.split(/[/\\]+/).filter(Boolean);
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

    db.prepare('DELETE FROM song_artists WHERE song_id = ?').run([songId]);
    db.prepare('DELETE FROM songs WHERE id = ?').run([songId]);

    saveDatabase(); 
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-modified-songs', () => {
  return execToObjects('SELECT * FROM songs WHERE is_modified = 1 ORDER BY title ASC');
});

ipcMain.handle('get-incomplete-songs', () => {
  return execToObjects('SELECT * FROM songs WHERE is_incomplete = 1 ORDER BY title ASC');
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});