import { Song } from '../models/song.model';

export { Song };

// El catálogo arranca estrictamente vacío, dependiendo 100% de la lectura física de SQLite
export const MOCK_SONGS_SORTED: Song[] = [];