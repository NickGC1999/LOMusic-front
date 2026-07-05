const fs = require('fs');
const path = require('path');
const mm = require('music-metadata');
const { getDb, saveDatabase } = require('./database');

const coversDir = path.join(__dirname, 'covers');
if (!fs.existsSync(coversDir)) {
  fs.mkdirSync(coversDir);
}

const SUPPORTED_EXTENSIONS = new Set([
  '.flac', '.wav', '.mp3', '.m4a', '.aac', '.ogg', '.opus', '.wma', '.aiff'
]);

function cleanStr(str, fallback = 'Desconocido') {
  if (str === null || str === undefined || str === '') {
    return fallback;
  }
  const cleaned = String(str).replace(/\0/g, '').replace(/[\x00-\x1F\x7F]/g, ' ').trim();
  return cleaned.length > 0 ? cleaned : fallback;
}

function getAllAudioFiles(dirPath, arrayOfFiles = []) {
  let files;
  try { 
    files = fs.readdirSync(dirPath); 
  } catch (e) { 
    return arrayOfFiles; 
  }

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    try {
      const stat = fs.lstatSync(fullPath);
      if (stat.isDirectory()) {
        getAllAudioFiles(fullPath, arrayOfFiles);
      } else if (stat.isFile()) {
        if (SUPPORTED_EXTENSIONS.has(path.extname(fullPath).toLowerCase())) {
          arrayOfFiles.push(fullPath);
        }
      }
    } catch (e) {}
  }
  return arrayOfFiles;
}

async function scanDirectory(rootFolderPath) {
  const db = getDb();
  if (!db) return;

  console.log(`🔍 [Fase 1] Mapeando árbol de carpetas en: ${rootFolderPath}`);
  const allAudioPaths = getAllAudioFiles(rootFolderPath);
  console.log(`📂 [Fase 1] Se encontraron ${allAudioPaths.length} archivos de audio reales.`);

  if (allAudioPaths.length === 0) return;

  const parsedDataBuffer = [];

  for (const fullPath of allAudioPaths) {
    const ext = path.extname(fullPath).toLowerCase();
    let title = cleanStr(path.basename(fullPath, ext), 'Pista Sin Título');
    let trackNo = null; 
    let durationMs = 0; 
    let bitrate = null; 
    let sampleRate = null;
    let artistName = 'Artista Desconocido'; 
    let albumTitle = 'Álbum Desconocido';
    let genreName = null; 
    let coverPath = null; 
    let lyrics = null; 
    let composer = null; 
    let year = null;
    
    let discNo = 1; 
    let bpm = null; 
    let initialKey = null;
    let albumArtist = null; 
    let publisher = null; 
    let copyright = null;

    try {
      const metadata = await mm.parseFile(fullPath);
      const { common, format } = metadata;

      // 1. Duración y Frecuencia de muestreo nativas
      if (format.duration) durationMs = Math.round(format.duration * 1000);
      if (format.sampleRate) sampleRate = Math.round(format.sampleRate);

      // 2. INGENIERÍA INVERSA DE BITRATE PARA ARCHIVOS FLAC / LOSSLESS
      if (format.bitrate) {
        bitrate = Math.round(format.bitrate);
      } else if (format.duration && format.duration > 0) {
        try {
          const fileStats = fs.statSync(fullPath);
          // Fórmula matemática: (Bytes del archivo * 8) / Duración en segundos
          bitrate = Math.round((fileStats.size * 8) / format.duration);
        } catch (err) {
          bitrate = 0;
        }
      }

      // 3. NORMALIZACIÓN DE FECHAS VORBIS / ID3
      let rawDate = common.year || common.date;
      if (rawDate) {
        // Extraemos quirúrgicamente los primeros 4 caracteres numéricos (ej: "2018-09-07" -> 2018)
        const match = String(rawDate).match(/\d{4}/);
        if (match) year = parseInt(match[0]);
      }

      if (common.title) title = cleanStr(common.title, title);
      if (common.track && common.track.no) trackNo = parseInt(common.track.no) || null;
      if (common.disk && common.disk.no) discNo = parseInt(common.disk.no) || 1;
      if (common.bpm) bpm = Math.round(common.bpm);
      if (common.key) initialKey = cleanStr(common.key, null);
      if (common.artist) artistName = cleanStr(common.artist, 'Artista Desconocido');
      if (common.albumartist) albumArtist = cleanStr(common.albumartist, artistName);
      if (common.album) albumTitle = cleanStr(common.album, 'Álbum Desconocido');
      if (common.label && common.label.length > 0) publisher = cleanStr(common.label[0], null);
      if (common.copyright) copyright = cleanStr(common.copyright, null);
      if (common.lyrics && common.lyrics.length > 0) lyrics = cleanStr(common.lyrics.join('\n'), null);
      if (common.composer && common.composer.length > 0) composer = cleanStr(common.composer.join(', '), null);
      if (common.genre && common.genre.length > 0) genreName = cleanStr(common.genre[0], null);

      if (common.picture && common.picture.length > 0) {
        const pic = common.picture[0];
        const safeTitle = albumTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        coverPath = path.join(coversDir, `${safeTitle}_${Date.now()}.jpg`);
        if (!fs.existsSync(coverPath)) {
          fs.writeFileSync(coverPath, pic.data);
        }
      }
    } catch (id3Err) {}

    // Una canción se considera incompleta si le falta el año de lanzamiento o el género
    const isIncomplete = (!year || !genreName) ? 1 : 0;

    parsedDataBuffer.push({
      fullPath, title, trackNo, discNo, durationMs, bitrate, sampleRate, bpm, initialKey,
      format: ext.replace('.', '').toUpperCase(),
      artistName, albumTitle, genreName, coverPath, lyrics, composer, albumArtist, publisher, copyright, year,
      isIncomplete
    });
  }

  console.log(`💾 [Fase 2] Indexando ${parsedDataBuffer.length} registros en memoria WASM...`);

  const insertArtist = db.prepare('INSERT OR IGNORE INTO artists (name) VALUES (?)');
  const getArtist = db.prepare('SELECT id FROM artists WHERE name = ?');
  const insertGenre = db.prepare('INSERT OR IGNORE INTO genres (name) VALUES (?)');
  const getGenre = db.prepare('SELECT id FROM genres WHERE name = ?');
  const insertAlbum = db.prepare('INSERT INTO albums (title, release_year, cover_art_path, primary_artist_id) VALUES (?, ?, ?, ?)');
  const getAlbum = db.prepare('SELECT id FROM albums WHERE title = ? AND primary_artist_id = ?');
  
  const insertSong = db.prepare(`
    INSERT OR REPLACE INTO songs 
    (title, track_number, disc_number, duration_ms, bitrate, sample_rate, bpm, initial_key, format, file_path, lyrics, composer, album_artist, publisher, copyright, is_incomplete, album_id, genre_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const item of parsedDataBuffer) {
    try {
      insertArtist.run([item.artistName]);
      const artistRow = getArtist.get([item.artistName]);
      const artistId = artistRow && artistRow.length > 0 ? artistRow[0] : 1;

      let albumRow = getAlbum.get([item.albumTitle, artistId]);
      if (!albumRow || albumRow.length === 0) {
        insertAlbum.run([item.albumTitle, item.year, item.coverPath, artistId]);
        albumRow = getAlbum.get([item.albumTitle, artistId]);
      }
      const albumId = albumRow && albumRow.length > 0 ? albumRow[0] : 1;

      let genreId = null;
      if (item.genreName) {
        insertGenre.run([item.genreName]);
        const genreRow = getGenre.get([item.genreName]);
        if (genreRow && genreRow.length > 0) {
          genreId = genreRow[0];
        }
      }

      insertSong.run([
        item.title, item.trackNo, item.discNo, item.durationMs, item.bitrate, item.sampleRate,
        item.bpm, item.initialKey, item.format, item.fullPath, item.lyrics, item.composer,
        item.albumArtist, item.publisher, item.copyright, item.isIncomplete, albumId, genreId
      ]);
    } catch (itemErr) {}
  }

  try {
    insertArtist.free(); getArtist.free();
    insertGenre.free(); getGenre.free();
    insertAlbum.free(); getAlbum.free();
    insertSong.free();
  } catch (e) {}

  saveDatabase(); 
  console.log(`✨ Auditoría de estudio completada con éxito: ${parsedDataBuffer.length} pistas persistidas.`);
}

module.exports = { scanDirectory };