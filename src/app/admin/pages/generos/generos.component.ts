import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CancionesService } from '../../../core/services/canciones.service';
import { Song } from '../../../core/mocks/canciones.mock';
import { EditModalComponent } from '../../components/edit-modal/edit-modal.component';

interface Genre {
  name: string;
  count: number;
  icon: string;
}

@Component({
  selector: 'app-generos',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, EditModalComponent],
  templateUrl: './generos.component.html',
  styleUrls: ['./generos.component.css']
})
export class GenerosComponent implements OnInit {
  allSongs: Song[] = [];
  
  // --- ESTADO DE LA VISTA ---
  viewMode: 'genres' | 'songs' = 'genres';
  selectedGenre: string | null = null;
  
  // --- LISTAS PARA MOSTRAR ---
  genresToDisplay: Genre[] = [];
  songsToDisplay: Song[] = [];

  // --- ORDENAMIENTO ---
  activeSort: 'name' | 'count' = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  // --- ESTADO DEL MODAL DE EDICIÓN ---
  songToEdit: Song | null = null;
  isClosingEditModal = false;

  constructor(private cancionesService: CancionesService) {}

  ngOnInit(): void {
    this.cancionesService.getAllSongs().subscribe(songs => {
      this.allSongs = songs;
      this.extractAndSortGenres();
    });
  }

  // --- LÓGICA DE EXTRACCIÓN Y ORDENAMIENTO ---
  extractAndSortGenres() {
    const map = new Map<string, number>();
    this.allSongs.forEach(song => {
      const genreName = song.genre || 'Desconocido';
      map.set(genreName, (map.get(genreName) || 0) + 1);
    });

    this.genresToDisplay = Array.from(map.entries()).map(([name, count]) => {
      return { name, count, icon: this.getIconForGenre(name) };
    });

    this.applySort();
  }

  toggleSort(column: 'name' | 'count') {
    if (this.activeSort === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.activeSort = column;
      // Por defecto: Nombre de A-Z, Cantidad de Mayor a Menor
      this.sortDirection = column === 'name' ? 'asc' : 'desc'; 
    }
    this.applySort();
  }

  applySort() {
    this.genresToDisplay.sort((a, b) => {
      if (this.activeSort === 'name') {
        const res = a.name.localeCompare(b.name);
        return this.sortDirection === 'asc' ? res : -res;
      } else {
        const res = a.count - b.count;
        return this.sortDirection === 'asc' ? res : -res;
      }
    });
  }

  // --- ASIGNACIÓN INTELIGENTE DE ICONOS ---
  private getIconForGenre(genre: string): string {
    const g = genre.toLowerCase();
    if (g.includes('rock') || g.includes('metal')) return 'graphic_eq';
    if (g.includes('pop')) return 'auto_awesome';
    if (g.includes('hip') || g.includes('rap')) return 'mic_external_on';
    if (g.includes('jazz') || g.includes('blues')) return 'music_note';
    if (g.includes('electronic') || g.includes('dance')) return 'headphones';
    if (g.includes('classical')) return 'piano';
    return 'category'; // Icono por defecto
  }

  // --- NAVEGACIÓN ---
  openGenre(genre: Genre) {
    this.selectedGenre = genre.name;
    this.songsToDisplay = this.allSongs.filter(s => s.genre === genre.name);
    this.viewMode = 'songs';
  }

  backToGenres() {
    this.viewMode = 'genres';
    this.selectedGenre = null;
  }

  // --- COMUNICACIÓN CON EL MODAL DE EDICIÓN ---
  openEditModal(song: Song) {
    this.songToEdit = song;
  }

  closeEditModal() {
    this.isClosingEditModal = true; 
    setTimeout(() => {
      this.songToEdit = null; 
      this.isClosingEditModal = false;
    }, 250); 
  }

  saveChanges(updatedSong: Song) {
    if (this.songToEdit) {
      Object.assign(this.songToEdit, updatedSong);
      this.closeEditModal(); 
      // Si el usuario cambia el género de la canción actual, regeneramos la vista
      this.extractAndSortGenres();
    }
  }
}