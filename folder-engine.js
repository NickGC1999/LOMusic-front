const fs = require('fs');
const path = require('path');
const { getDb, saveDatabase } = require('./database');

function execRows(query, params = []) {
  const db = getDb();
  if (!db) return [];
  try {
    const stmt = db.prepare(query);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  } catch (err) {
    console.error('❌ [folder-engine] Error de consulta:', err.message);
    return [];
  }
}

// Renombra una carpeta física y sincroniza todas las rutas de canciones afectadas
function renamePhysicalFolder(oldAbsolutePath, newName) {
  const db = getDb();
  if (!db) return { success: false, error: 'Base de datos no disponible' };

  const parentDir = path.dirname(oldAbsolutePath);
  const newAbsolutePath = path.join(parentDir, newName);

  if (fs.existsSync(newAbsolutePath)) {
    return { success: false, error: 'Ya existe una carpeta con ese nombre en este directorio.' };
  }

  try {
    fs.renameSync(oldAbsolutePath, newAbsolutePath);
  } catch (err) {
    return { success: false, error: `No se pudo renombrar en disco: ${err.message}` };
  }

  try {
    const oldPrefix = oldAbsolutePath + path.sep;
    const allSongs = execRows('SELECT id, file_path FROM songs');
    const updateStmt = db.prepare('UPDATE songs SET file_path = ? WHERE id = ?');

    allSongs.forEach(row => {
      if (row.file_path === oldAbsolutePath) {
        updateStmt.run([newAbsolutePath, row.id]);
      } else if (row.file_path.startsWith(oldPrefix)) {
        const updatedPath = newAbsolutePath + path.sep + row.file_path.slice(oldPrefix.length);
        updateStmt.run([updatedPath, row.id]);
      }
    });

    updateStmt.free();
    saveDatabase();
    return { success: true, newPath: newAbsolutePath };
  } catch (err) {
    return { success: false, error: `Carpeta renombrada en disco, pero falló la sincronización de la base de datos: ${err.message}` };
  }
}

// Elimina una carpeta física completa y borra las canciones asociadas del catálogo
function deletePhysicalFolder(absolutePath) {
  const db = getDb();
  if (!db) return { success: false, error: 'Base de datos no disponible' };

  try {
    if (fs.existsSync(absolutePath)) {
      fs.rmSync(absolutePath, { recursive: true, force: true });
    }
  } catch (err) {
    return { success: false, error: `No se pudo eliminar en disco: ${err.message}` };
  }

  try {
    const prefix = absolutePath + path.sep;
    const allSongs = execRows('SELECT id, file_path FROM songs');
    const deleteStmt = db.prepare('DELETE FROM songs WHERE id = ?');

    allSongs.forEach(row => {
      if (row.file_path === absolutePath || row.file_path.startsWith(prefix)) {
        deleteStmt.run([row.id]);
      }
    });

    deleteStmt.free();
    saveDatabase();
    return { success: true };
  } catch (err) {
    return { success: false, error: `Carpeta eliminada en disco, pero falló la limpieza de la base de datos: ${err.message}` };
  }
}

module.exports = { renamePhysicalFolder, deletePhysicalFolder };