const fs = require('fs');
const path = require('path');
const { getDb, saveDatabase } = require('./database');

const LEFTOVER_EXTENSIONS = new Set([
  '.lrc', '.txt', '.nfo', '.jpg', '.jpeg', '.png', '.webp',
  '.url', '.ini', '.db', '.pdf', '.cue', '.m3u'
]);
const LEFTOVER_FOLDER_NAME = 'Archivos Sueltos';

function sanitize(name) {
  return String(name || 'Desconocido').replace(/[/\\?%*:|"<>]/g, '').trim() || 'Desconocido';
}

function computeTargetRelativePath(song, mode) {
  const ext = path.extname(song.filePath);
  const artist = sanitize(song.artist);
  const title = sanitize(song.title);

  if (mode === 'artist') {
    const album = sanitize(song.album);
    const track = song.trackNumber ? String(song.trackNumber).padStart(2, '0') + ' - ' : '';
    return path.join(artist, album, `${track}${title}${ext}`);
  }

  if (mode === 'year') {
    const yearFolder = song.year ? String(song.year) : 'Desconocido';
    return path.join(yearFolder, `${artist} - ${title}${ext}`);
  }

  if (mode === 'genre') {
    const genreFolder = song.genre ? sanitize(song.genre) : 'Desconocido';
    return path.join(genreFolder, `${artist} - ${title}${ext}`);
  }

  if (mode === 'format') {
    const formatFolder = sanitize(song.format);
    return path.join(formatFolder, `${artist} - ${title}${ext}`);
  }

  throw new Error(`Modo de reestructuración desconocido: ${mode}`);
}

function buildRestructurePlan(songs, rootFolderPath, mode) {
  const plan = [];
  const usedTargets = new Set();

  for (const song of songs) {
    let relativeTarget = computeTargetRelativePath(song, mode);
    let absoluteTarget = path.join(rootFolderPath, relativeTarget);

    let counter = 2;
    const dir = path.dirname(absoluteTarget);
    const ext = path.extname(absoluteTarget);
    const base = path.basename(absoluteTarget, ext);
    while (usedTargets.has(absoluteTarget) || (fs.existsSync(absoluteTarget) && absoluteTarget !== song.filePath)) {
      absoluteTarget = path.join(dir, `${base} (${counter})${ext}`);
      counter++;
    }
    usedTargets.add(absoluteTarget);

    plan.push({
      songId: song.id,
      oldPath: song.filePath,
      newPath: absoluteTarget
    });
  }

  return plan;
}

function executeRestructurePlan(plan) {
  const db = getDb();
  const results = { moved: 0, failed: 0, failures: [] };

  const updateStmt = db.prepare('UPDATE songs SET file_path = ? WHERE id = ?');

  for (const item of plan) {
    if (item.oldPath === item.newPath) continue;

    try {
      if (!fs.existsSync(item.oldPath)) {
        throw new Error('Archivo original no encontrado (¿ya fue movido o eliminado?)');
      }
      fs.mkdirSync(path.dirname(item.newPath), { recursive: true });
      fs.renameSync(item.oldPath, item.newPath);
      updateStmt.run([item.newPath, item.songId]);
      results.moved++;
    } catch (err) {
      results.failed++;
      results.failures.push({ oldPath: item.oldPath, error: err.message });
    }
  }

  updateStmt.free();
  saveDatabase();
  return results;
}

// Limpia recursivamente carpetas vacías. Si una carpeta contiene ÚNICAMENTE
// archivos "no musicales" reconocidos (letras, imágenes sueltas, .nfo, etc.),
// los mueve a Raíz/Archivos Sueltos/ antes de borrar la carpeta.
// Si contiene cualquier otra cosa no reconocida, la deja intacta y la reporta.
function cleanupEmptyFolders(rootFolderPath) {
  const leftoverDir = path.join(rootFolderPath, LEFTOVER_FOLDER_NAME);
  const report = { deletedFolders: 0, movedFiles: 0, skippedFolders: [] };

  function moveLeftoverFile(fullPath) {
    fs.mkdirSync(leftoverDir, { recursive: true });
    const ext = path.extname(fullPath);
    const base = path.basename(fullPath, ext);
    let dest = path.join(leftoverDir, `${base}${ext}`);
    let counter = 2;
    while (fs.existsSync(dest)) {
      dest = path.join(leftoverDir, `${base} (${counter})${ext}`);
      counter++;
    }
    fs.renameSync(fullPath, dest);
    report.movedFiles++;
  }

  function walk(dirPath) {
    if (dirPath === leftoverDir) return; // Nunca tocar la carpeta de archivos sueltos
    let entries;
    try {
      entries = fs.readdirSync(dirPath, { withFileTypes: true });
    } catch {
      return;
    }

    // Primero procesamos subcarpetas (de abajo hacia arriba)
    for (const entry of entries) {
      if (entry.isDirectory()) {
        walk(path.join(dirPath, entry.name));
      }
    }

    if (dirPath === rootFolderPath) return; // Nunca evaluar/borrar la raíz misma

    // Releemos el contenido actual, ya que las subcarpetas pudieron vaciarse arriba
    let currentEntries;
    try {
      currentEntries = fs.readdirSync(dirPath, { withFileTypes: true });
    } catch {
      return;
    }

    if (currentEntries.length === 0) {
      try { fs.rmdirSync(dirPath); report.deletedFolders++; } catch {}
      return;
    }

    const onlyLeftovers = currentEntries.every(e =>
      e.isFile() && LEFTOVER_EXTENSIONS.has(path.extname(e.name).toLowerCase())
    );

    if (onlyLeftovers) {
      currentEntries.forEach(e => moveLeftoverFile(path.join(dirPath, e.name)));
      try { fs.rmdirSync(dirPath); report.deletedFolders++; } catch {}
    } else {
      report.skippedFolders.push(dirPath);
    }
  }

  walk(rootFolderPath);
  return report;
}

module.exports = { buildRestructurePlan, executeRestructurePlan, cleanupEmptyFolders };