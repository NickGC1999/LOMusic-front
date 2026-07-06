const { execFile } = require('child_process');
const config = require('./src/config');

// Ejecuta fpcalc de forma asíncrona (nunca bloquea el hilo principal de Electron)
function getFingerprint(filePath) {
  return new Promise((resolve, reject) => {
    execFile(config.FPCALC_PATH, ['-json', filePath], { timeout: 15000 }, (err, stdout) => {
      if (err) {
        return reject(new Error(`fpcalc falló: ${err.message}`));
      }
      try {
        const data = JSON.parse(stdout);
        resolve({
          durationSeconds: data.duration,
          fingerprint: data.fingerprint
        });
      } catch (parseErr) {
        reject(new Error(`No se pudo interpretar la salida de fpcalc: ${parseErr.message}`));
      }
    });
  });
}

module.exports = { getFingerprint };