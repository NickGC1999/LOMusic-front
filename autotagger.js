const fs = require('fs');
const os = require('os');
const path = require('path');
const { getFingerprint } = require('./acoustic-fingerprint');
const { lookupAcoustID, getRecordingMetadata, getCoverArtUrl, delay } = require('./musicbrainz-client');
const { writeTagsToFile } = require('./tag-writer');

async function downloadCoverToTemp(coverUrl) {
  if (!coverUrl) return null;
  try {
    const response = await fetch(coverUrl);
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    const tempPath = path.join(os.tmpdir(), `lomusic_cover_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`);
    fs.writeFileSync(tempPath, buffer);
    return tempPath;
  } catch (err) {
    console.error('⚠️ No se pudo descargar la portada (fallo de red):', err.message);
    return null;
  }
}

function valuesMatch(current, official) {
  if (!official) return true;
  if (!current) return false;
  return String(current).trim().toLowerCase() === String(official).trim().toLowerCase();
}

// Filtro local AMPLIO: cualquier señal de dato dañado o faltante activa la verificación completa.
// Solo las canciones que pasan TODAS estas pruebas se saltan la consulta a internet.
function looksSuspicious(song) {
  const title = String(song.title || '').trim();
  const artist = String(song.artist || '').trim();
  const album = String(song.album || '').trim();

  if (!title || !artist || !album) return true;
  if (!song.year || !song.genre) return true;
  if (title.toLowerCase().includes('pista') || title.toLowerCase().includes('track')) return true;
  if (/^\d+$/.test(title)) return true; // Solo números
  if (artist.toLowerCase().includes('desconocido') || album.toLowerCase().includes('desconocido')) return true;
  if (!/[aeiouáéíóúAEIOUÁÉÍÓÚ]/.test(title)) return true; // Sin ninguna vocal — típico de texto basura tipo "asdkjhaskd"

  return false;
}

async function runAutotagBatch(songs, onProgress) {
  const results = { processed: 0, identified: 0, skipped: 0, failed: 0, details: [] };
  const coverCache = new Map(); // releaseMbid -> tempCoverPath (evita descargar la misma portada varias veces)

  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];
    const fileName = path.basename(song.filePath);

    const report = (status) => {
      if (onProgress) onProgress({ current: i + 1, total: songs.length, currentTitle: fileName, status });
    };

    if (!looksSuspicious(song)) {
      results.skipped++;
      results.details.push({ id: song.id, file: fileName, status: 'omitida_local' });
      report('Ya se ve completa, omitida sin consultar internet.');
      results.processed++;
      continue; // Sin delay: no se hizo ninguna petición de red, no hay límite que respetar
    }

    try {
      report('Generando huella acústica...');
      const fp = await getFingerprint(song.filePath);

      report('Consultando AcoustID...');
      const acoustidResult = await lookupAcoustID(fp.fingerprint, fp.durationSeconds);

      if (!acoustidResult) {
        results.skipped++;
        results.details.push({ id: song.id, file: fileName, status: 'sin_coincidencia' });
        report('Sin coincidencias, se dejó intacta.');
        results.processed++;
        continue;
      }

      report('Obteniendo metadatos oficiales...');
      const metadata = await getRecordingMetadata(acoustidResult.recordingMbid); // Ya incluye el delay de 1.2s obligatorio

      const fieldsToWrite = {};
      if (metadata.title && !valuesMatch(song.title, metadata.title)) fieldsToWrite.title = metadata.title;
      if (metadata.artist && !valuesMatch(song.artist, metadata.artist)) fieldsToWrite.artist = metadata.artist;
      if (metadata.album && !valuesMatch(song.album, metadata.album)) fieldsToWrite.album = metadata.album;
      if (metadata.year && !valuesMatch(song.year, metadata.year)) fieldsToWrite.year = metadata.year;
      if (metadata.genre && !valuesMatch(song.genre, metadata.genre)) fieldsToWrite.genre = metadata.genre;

      let tempCoverPath = null;
      if (metadata.releaseMbid) {
        if (coverCache.has(metadata.releaseMbid)) {
          tempCoverPath = coverCache.get(metadata.releaseMbid);
          if (tempCoverPath) report('Reutilizando portada ya descargada de este álbum...');
        } else {
          report('Buscando portada oficial...');
          const coverUrl = await getCoverArtUrl(metadata.releaseMbid);
          if (!coverUrl) {
            console.log(`ℹ️ "${fileName}": no existe portada en Cover Art Archive para este álbum (no es un error).`);
          }
          tempCoverPath = await downloadCoverToTemp(coverUrl);
          coverCache.set(metadata.releaseMbid, tempCoverPath);
        }
      }

      if (Object.keys(fieldsToWrite).length === 0 && !tempCoverPath) {
        results.skipped++;
        results.details.push({ id: song.id, file: fileName, status: 'ya_completa' });
        report('Ya coincidía con la fuente oficial.');
        results.processed++;
        continue;
      }

      report('Escribiendo metadatos y portada en el archivo...');
      writeTagsToFile(song.filePath, fieldsToWrite, tempCoverPath);

      results.identified++;
      results.details.push({
        id: song.id,
        file: fileName,
        status: 'corregida',
        fields: Object.keys(fieldsToWrite),
        coverUpdated: !!tempCoverPath
      });
      report('Corregida correctamente.');
    } catch (err) {
      console.error(`❌ Error procesando "${fileName}":`, err.message);
      results.failed++;
      results.details.push({ id: song.id, file: fileName, status: 'error', error: err.message });
      report('Error, omitida.');
    }

    results.processed++;
  }

  // Limpieza final de todas las portadas temporales descargadas
  coverCache.forEach(tempPath => {
    if (tempPath) { try { fs.unlinkSync(tempPath); } catch {} }
  });

  return results;
}

module.exports = { runAutotagBatch };