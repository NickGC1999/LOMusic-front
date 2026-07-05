import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ElectronService } from './electron.service';
import { Song } from '../models/song.model';

@Injectable({
  providedIn: 'root'
})
export class CancionesService {

  constructor(private electronService: ElectronService) {}

  /**
   * Obtiene todas las canciones de la colección.
   * Si corre en Electron, consulta SQLite por IPC y adapta los datos
   * sin romper el contrato canónico definido en Song.
   */
  getAllSongs(): Observable<Song[]> {
    if (this.electronService.isElectron) {

      return from(this.electronService.invoke<Song[]>('get-songs')).pipe(

        map(rawSongs =>
          rawSongs.map(row => ({

            // Conservamos TODAS las propiedades que entrega el backend.
            ...row,

            // Valores por defecto únicamente cuando son necesarios.
            title: row.title || 'Sin Título',
            artist: row.artist || 'Artista Desconocido',
            album: row.album || 'Álbum Desconocido',

            // Si main.js ya envía duration ("03:45"), la respetamos.
            // Si no, la calculamos desde durationMs.
            duration:
              row.duration ||
              this.formatDurationFromMs(row.durationMs ?? 0),

            // Cover por defecto únicamente cuando no existe.
            coverUrl:
              row.coverUrl ||
              'assets/default-cover.png'

          }))
        ),

        catchError(err => {
          console.error('❌ [CancionesService] Error al consultar base de datos nativa:', err);
          return of([]);
        })

      );
    }

    console.warn('⚠️ [CancionesService] Modo Web detectado. Cargando MOCK_SONGS.');
    return of([]);
  }

  /**
   * Convierte milisegundos a MM:SS
   */
  private formatDurationFromMs(ms: number): string {

    if (!ms || isNaN(ms)) {
      return '00:00';
    }

    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  /**
   * Abrir selector de carátula personalizada.
   */
  async selectCustomCover(): Promise<{ physicalPath: string; base64: string } | null> {
    if (this.electronService.isElectron) {
      return await this.electronService.invoke('change-cover-art');
    }
    return null;
  }

  /**
   * Guardar metadatos editados.
   */
  async updateSongMetadata(updatedSong: any): Promise<boolean> {
    if (this.electronService.isElectron) {
      const res = await this.electronService.invoke<any>('update-song', updatedSong);
      return res.success;
    }
    return false;
  }

  /**
   * Restaurar metadatos oficiales.
   */
  async rollbackToOfficial(songId: number): Promise<boolean> {
    if (this.electronService.isElectron) {
      const res = await this.electronService.invoke<any>('rollback-song-official', songId);
      return res.success;
    }
    return false;
  }

  /**
   * Eliminar físicamente una canción.
   */
  async deletePhysicalSong(songId: number): Promise<boolean> {
    if (this.electronService.isElectron) {
      const res = await this.electronService.invoke<any>('delete-song', songId);
      return res.success;
    }
    return false;
  }

}