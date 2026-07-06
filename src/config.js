const path = require('path');

module.exports = {
  // Ruta física al binario, relativa a la raíz del proyecto (donde vive main.js)
  FPCALC_PATH: path.join(__dirname, 'bin', 'fpcalc.exe'),

  ACOUSTID_CLIENT_KEY: 'Fz4ANAE3jQ',

  // Endpoints oficiales
  ACOUSTID_API_URL: 'https://api.acoustid.org/v2/lookup',
  MUSICBRAINZ_API_URL: 'https://musicbrainz.org/ws/2',
  COVER_ART_ARCHIVE_URL: 'https://coverartarchive.org',

  // Obligatorio por política de MusicBrainz: identifica tu app en cada petición
  USER_AGENT: 'LOMusic/1.0 (tu-email@ejemplo.com)'
};