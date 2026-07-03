import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Song, MOCK_SONGS_SORTED } from '../mocks/canciones.mock';

@Injectable({
  providedIn: 'root'
})
export class CancionesService {
  
  constructor() { }

  // Simula una petición HTTP al backend (Tardará 500ms en responder para simular carga)
  getAllSongs(): Observable<Song[]> {
    return of(MOCK_SONGS_SORTED).pipe(delay(500));
  }
}