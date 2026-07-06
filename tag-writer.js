const fs = require('fs');
const { File, Picture, PictureType } = require('node-taglib-sharp');

/**
 * Escribe metadatos reales (y opcionalmente portada) directamente
 * en el archivo de audio físico. No toca SQLite ni scanner.js.
 * @param {string} filePath - Ruta física del archivo a modificar
 * @param {object} data - Campos a escribir (mismo shape que editedSong del frontend)
 * @param {string|null} newCoverPhysicalPath - Ruta de la nueva portada, si el usuario la cambió
 */
function writeTagsToFile(filePath, data, newCoverPhysicalPath = null) {
  const file = File.createFromPath(filePath);

  try {
    const tag = file.tag;

    if (data.title) tag.title = data.title;
    if (data.artist) tag.performers = [data.artist];
    if (data.albumArtist) tag.albumArtists = [data.albumArtist];
    if (data.album) tag.album = data.album;
    if (data.genre) tag.genres = [data.genre];
    if (data.year) tag.year = Number(data.year);
    if (data.trackNumber) tag.track = Number(data.trackNumber);
    if (data.discNumber) tag.disc = Number(data.discNumber);
    if (data.composer) tag.composers = [data.composer];
    if (data.publisher) tag.publisher = data.publisher;
    if (data.copyright) tag.copyright = data.copyright;
    if (data.lyrics) tag.lyrics = data.lyrics;
    if (data.bpm) tag.beatsPerMinute = Number(data.bpm);

    // Portada embebida: solo si el usuario cambió la imagen en esta edición
    if (newCoverPhysicalPath && fs.existsSync(newCoverPhysicalPath)) {
      const picture = Picture.fromPath(newCoverPhysicalPath);
      picture.type = PictureType.FrontCover;
      tag.pictures = [picture];
    }

    file.save();
  } finally {
    file.dispose(); // Libera el handle del archivo siempre, incluso si algo falla arriba
  }
}

module.exports = { writeTagsToFile };