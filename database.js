const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const dbPath = path.join(__dirname, 'lomusic.db');
let db = null;

async function initDatabase() {
  const SQL = await initSqlJs();
  
  // 1. Carga del archivo físico o inicialización en RAM
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // 2. Creación del esquema relacional completo (Grado de Estudio)
  db.run(`
    CREATE TABLE IF NOT EXISTS artists (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      name TEXT UNIQUE
    );

    CREATE TABLE IF NOT EXISTS albums (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      title TEXT, 
      release_year INTEGER, 
      cover_art_path TEXT, 
      primary_artist_id INTEGER
    );

    CREATE TABLE IF NOT EXISTS genres (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      name TEXT UNIQUE
    );

    CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      track_number INTEGER,
      disc_number INTEGER,
      duration_ms INTEGER,
      bitrate INTEGER,
      sample_rate INTEGER,
      bpm INTEGER,
      initial_key TEXT,
      format TEXT,
      file_path TEXT UNIQUE,
      lyrics TEXT,
      composer TEXT,
      album_artist TEXT,
      publisher TEXT,
      copyright TEXT,
      cover_art_path TEXT,
      is_modified INTEGER DEFAULT 0,
      is_incomplete INTEGER DEFAULT 0,
      album_id INTEGER,
      genre_id INTEGER
    );
  `);

  // 3. AUTO-MIGRACIÓN SILENCIOSA: Blindaje por si el usuario abre un lomusic.db de versiones anteriores
  const migrations = [
    "ALTER TABLE songs ADD COLUMN is_modified INTEGER DEFAULT 0;",
    "ALTER TABLE songs ADD COLUMN is_incomplete INTEGER DEFAULT 0;",
    "ALTER TABLE songs ADD COLUMN disc_number INTEGER;",
    "ALTER TABLE songs ADD COLUMN bpm INTEGER;",
    "ALTER TABLE songs ADD COLUMN initial_key TEXT;",
    "ALTER TABLE songs ADD COLUMN album_artist TEXT;",
    "ALTER TABLE songs ADD COLUMN publisher TEXT;",
    "ALTER TABLE songs ADD COLUMN copyright TEXT;",
    "ALTER TABLE songs ADD COLUMN bitrate INTEGER;",
    "ALTER TABLE songs ADD COLUMN sample_rate INTEGER;"
  ];
  
  migrations.forEach(sql => { 
    try { 
      db.exec(sql); 
    } catch(e) {
      // Ignora en silencio si la columna ya existe en la base de datos
    } 
  });

  saveDatabase(); 
  return db;
}

// 4. FUNCIÓN CRÍTICA: Exporta el búfer de RAM de WebAssembly al archivo físico lomusic.db
function saveDatabase() {
  if (db) {
    const binaryArray = db.export();
    fs.writeFileSync(dbPath, Buffer.from(binaryArray));
  }
}

// CRÍTICO: Exportamos getDb como función () => db para que main.js y scanner.js obtengan siempre la referencia viva en RAM
module.exports = { initDatabase, saveDatabase, getDb: () => db };