const config = require('./src/config');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// PASO A: Envía la huella acústica a AcoustID, recibe el MBID (ID oficial de MusicBrainz)
async function lookupAcoustID(fingerprint, durationSeconds) {
  const url = `${config.ACOUSTID_API_URL}?client=${config.ACOUSTID_CLIENT_KEY}` +
    `&duration=${Math.round(durationSeconds)}` +
    `&fingerprint=${encodeURIComponent(fingerprint)}` +
    `&meta=recordings`;

  const response = await fetch(url, {
    headers: { 'User-Agent': config.USER_AGENT }
  });

  if (!response.ok) {
    throw new Error(`AcoustID respondió con error HTTP ${response.status}`);
  }

  const data = await response.json();

  if (data.status !== 'ok') {
    console.error('🔴 AcoustID devolvió un error:', JSON.stringify(data));
    throw new Error(`AcoustID error: ${data.error?.message || 'desconocido'}`);
  }

  if (!data.results || data.results.length === 0) {
    console.log('ℹ️ AcoustID respondió correctamente pero sin resultados para esta huella.');
    return null;
  }

  const bestResult = data.results.sort((a, b) => (b.score || 0) - (a.score || 0))[0];

  if (!bestResult.recordings || bestResult.recordings.length === 0) {
    console.log('ℹ️ Hubo coincidencia de huella, pero sin grabaciones vinculadas en MusicBrainz.');
    return null;
  }

  // HEURÍSTICA DE CONSENSO: cuando un mismo fingerprint apunta a varias grabaciones
  // distintas (título/artista diferente), confiamos en la combinación título+artista
  // que se repite MÁS veces dentro de ese resultado, no en la primera de la lista.
  const voteCount = new Map();
  bestResult.recordings.forEach(rec => {
    const artistName = rec.artists && rec.artists.length > 0 ? rec.artists[0].name : 'Desconocido';
    const key = `${(rec.title || '').toLowerCase()}|||${artistName.toLowerCase()}`;
    if (!voteCount.has(key)) {
      voteCount.set(key, { count: 0, recording: rec });
    }
    voteCount.get(key).count++;
  });

  const winner = Array.from(voteCount.values()).sort((a, b) => b.count - a.count)[0];

  console.log(`🗳️ Consenso: "${winner.recording.title}" por "${winner.recording.artists?.[0]?.name}" con ${winner.count} coincidencias de ${bestResult.recordings.length} candidatos.`);

  return {
    score: bestResult.score,
    recordingMbid: winner.recording.id
  };
}

// PASO B: Con el MBID de la grabación, pide los metadatos oficiales completos a MusicBrainz
async function getRecordingMetadata(recordingMbid) {
  await delay(1200); // Respeta el límite de 1 req/seg de MusicBrainz (con margen de seguridad)

  const url = `${config.MUSICBRAINZ_API_URL}/recording/${recordingMbid}?inc=releases+artist-credits+genres&fmt=json`;
  const response = await fetch(url, {
    headers: { 'User-Agent': config.USER_AGENT }
  });

  if (!response.ok) {
    throw new Error(`MusicBrainz respondió con error HTTP ${response.status}`);
  }

  const data = await response.json();

  const firstRelease = data.releases && data.releases.length > 0 ? data.releases[0] : null;

  return {
    title: data.title || null,
    artist: data['artist-credit'] && data['artist-credit'].length > 0
      ? data['artist-credit'][0].name
      : null,
    album: firstRelease ? firstRelease.title : null,
    releaseMbid: firstRelease ? firstRelease.id : null,
    year: firstRelease && firstRelease.date
      ? parseInt(String(firstRelease.date).match(/\d{4}/)?.[0]) || null
      : null,
    genre: data.genres && data.genres.length > 0 ? data.genres[0].name : null
  };
}

// PASO C: Con el ID del álbum (release), busca la portada oficial en alta resolución
async function getCoverArtUrl(releaseMbid) {
  if (!releaseMbid) return null;

  try {
    const response = await fetch(`${config.COVER_ART_ARCHIVE_URL}/release/${releaseMbid}/front`, {
      headers: { 'User-Agent': config.USER_AGENT },
      redirect: 'follow'
    });

    if (!response.ok) return null;
    return response.url; // La URL final tras seguir la redirección, apunta a la imagen real
  } catch {
    return null; // Sin portada disponible — no es un error fatal
  }
}

module.exports = { lookupAcoustID, getRecordingMetadata, getCoverArtUrl, delay };