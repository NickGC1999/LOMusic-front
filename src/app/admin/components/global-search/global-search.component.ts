import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SongTableComponent } from '../song-table/song-table.component';
import { CancionesService } from '../../../core/services/canciones.service';
import { Observable, combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [CommonModule, MatIconModule, SongTableComponent],
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.css']
})
export class GlobalSearchComponent implements OnChanges {
  @Input() term: string = '';
  @Input() currentContext: string = 'canciones'; // Ej: 'canciones', 'artistas', 'albumes', etc.

  // Observables para los 5 grupos
  searchResults$!: Observable<{
    canciones: any[];
    artistas: { name: string; count: number; cover: string }[];
    albumes: { title: string; artist: string; cover: string; count: number }[];
    generos: { name: string; count: number }[];
    carpetas: { path: string; name: string }[];
    totalResults: number;
  }>;

  // Orden reactivo de las secciones según el contexto
  sectionOrder: string[] = ['canciones', 'artistas', 'albumes', 'generos', 'carpetas'];

  constructor(private cancionesService: CancionesService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentContext']) {
      this.calculatePriorityOrder();
    }
    if (changes['term']) {
      this.initSearchStreams();
    }
  }

  private calculatePriorityOrder() {
    // Regla estricta: Duplicados, Incompletos y Modificados priorizan Canciones
    if (['duplicados', 'incompletos', 'modificados', 'canciones'].includes(this.currentContext)) {
      this.sectionOrder = ['canciones', 'artistas', 'albumes', 'generos', 'carpetas'];
    } else if (this.currentContext === 'artistas') {
      this.sectionOrder = ['artistas', 'canciones', 'albumes', 'generos', 'carpetas'];
    } else if (this.currentContext === 'albumes') {
      this.sectionOrder = ['albumes', 'canciones', 'artistas', 'generos', 'carpetas'];
    } else if (this.currentContext === 'generos') {
      this.sectionOrder = ['generos', 'canciones', 'artistas', 'albumes', 'carpetas'];
    } else if (this.currentContext === 'carpetas') {
      this.sectionOrder = ['carpetas', 'canciones', 'artistas', 'albumes', 'generos'];
    }
  }

  private initSearchStreams() {
    const cleanTerm = (this.term || '').trim().toLowerCase();
    
    // Obtenemos canciones del servicio puente. 
    // Al usar combineLatest inmutable, operamos en la memoria ultrarrápida del V8 engine
    const songs$ = this.cancionesService.getAllSongs();
    const folders$ = this.cancionesService.getFolderTree();

    this.searchResults$ = combineLatest([songs$, folders$]).pipe(
      map(([songs, folders]) => {
        if (!cleanTerm) {
          return { canciones: [], artistas: [], albumes: [], generos: [], carpetas: [], totalResults: 0 };
        }

        // 1. Filtrar Canciones
        const matchedSongs = songs.filter(s => 
          (s.title || '').toLowerCase().includes(cleanTerm) ||
          (s.artist || '').toLowerCase().includes(cleanTerm) ||
          (s.album || '').toLowerCase().includes(cleanTerm)
        );

        // 2. Extraer y Filtrar Artistas Únicos desde el catálogo total
        const artistMap = new Map<string, { count: number; cover: string }>();
        songs.forEach(s => {
          const artName = s.artist || 'Artista Desconocido';
          if (!artistMap.has(artName)) {
            artistMap.set(artName, { count: 1, cover: s.coverUrl });
          } else {
            artistMap.get(artName)!.count++;
          }
        });
        const matchedArtists: { name: string; count: number; cover: string }[] = [];
        artistMap.forEach((val, key) => {
          if (key.toLowerCase().includes(cleanTerm)) {
            matchedArtists.push({ name: key, count: val.count, cover: val.cover });
          }
        });

        // 3. Extraer y Filtrar Álbumes Únicos
        const albumMap = new Map<string, { artist: string; cover: string; count: number }>();
        songs.forEach(s => {
          const albName = s.album || 'Álbum Desconocido';
          if (!albumMap.has(albName)) {
            albumMap.set(albName, { artist: s.artist || 'Varios', cover: s.coverUrl, count: 1 });
          } else {
            albumMap.get(albName)!.count++;
          }
        });
        const matchedAlbums: { title: string; artist: string; cover: string; count: number }[] = [];
        albumMap.forEach((val, key) => {
          if (key.toLowerCase().includes(cleanTerm)) {
            matchedAlbums.push({ title: key, artist: val.artist, cover: val.cover, count: val.count });
          }
        });

        // 4. Extraer y Filtrar Géneros (Asumiendo que song.genre existe o se infiere, usamos mock seguro si no está en la row básica)
        const genreMap = new Map<string, number>();
        songs.forEach(s => {
          const gName = (s as any).genre || 'Sin Género';
          genreMap.set(gName, (genreMap.get(gName) || 0) + 1);
        });
        const matchedGenres: { name: string; count: number }[] = [];
        genreMap.forEach((count, key) => {
          if (key !== 'Sin Género' && key.toLowerCase().includes(cleanTerm)) {
            matchedGenres.push({ name: key, count });
          }
        });

        // 5. Filtrar Carpetas desde el árbol
        const matchedFolders: { path: string; name: string }[] = [];
        const flattenFolders = (nodes: any[]) => {
          nodes.forEach(n => {
            if (n.name && n.name.toLowerCase().includes(cleanTerm)) {
              matchedFolders.push({ path: n.path || n.name, name: n.name });
            }
            if (n.children && n.children.length > 0) flattenFolders(n.children);
          });
        };
        flattenFolders(folders);

        const total = matchedSongs.length + matchedArtists.length + matchedAlbums.length + matchedGenres.length + matchedFolders.length;

        return {
          canciones: matchedSongs,
          artistas: matchedArtists,
          albumes: matchedAlbums,
          generos: matchedGenres,
          carpetas: matchedFolders,
          totalResults: total
        };
      })
    );
  }
}