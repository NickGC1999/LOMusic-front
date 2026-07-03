import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CancionesService } from '../../../core/services/canciones.service';
import { Song } from '../../../core/mocks/canciones.mock';
// CRÍTICO: Importación del modal compartido
import { EditModalComponent } from '../../components/edit-modal/edit-modal.component';

interface Folder { name: string; count: number; coverUrl?: string; icon: string; }
interface PathNode { label: string; filterKey?: keyof Song; filterValue?: any; }

@Component({
  selector: 'app-carpetas',
  standalone: true,
  // CRÍTICO: Inyectamos el EditModalComponent aquí
  imports: [CommonModule, MatIconModule, FormsModule, EditModalComponent],
  templateUrl: './carpetas.component.html',
  styleUrls: ['./carpetas.component.css']
})
export class CarpetasComponent implements OnInit {
  allSongs: Song[] = [];
  viewMode: 'folders' | 'songs' = 'folders';
  groupingBy: 'artist' | 'year' | 'genre' | 'format' = 'artist';
  
  foldersToDisplay: Folder[] = [];
  songsToDisplay: Song[] = [];
  currentPath: PathNode[] = [];

  // --- ESTADO DE REESTRUCTURACIÓN ---
  isConfirmModalOpen = false;
  isModalClosing = false;
  pendingGroupSelection: 'artist' | 'year' | 'genre' | 'format' | null = null;
  isLoading = false; 

  // --- ESTADO DEL MODAL DE EDICIÓN ---
  selectedSong: Song | null = null;
  isClosingEditModal = false;

  constructor(private cancionesService: CancionesService) {}

  ngOnInit(): void {
    this.cancionesService.getAllSongs().subscribe(songs => {
      this.allSongs = songs;
      this.buildRootFolders();
    });
  }

  // --- LÓGICA DE REESTRUCTURACIÓN DE DIRECTORIOS ---
  requestGroupChange(group: 'artist' | 'year' | 'genre' | 'format') {
    if (this.groupingBy === group) return;
    this.pendingGroupSelection = group;
    this.isConfirmModalOpen = true;
  }

  cancelGroupChange() {
    this.isModalClosing = true;
    setTimeout(() => { this.isConfirmModalOpen = false; this.isModalClosing = false; }, 250);
  }

  confirmGroupChange() {
    this.isModalClosing = true;
    setTimeout(() => { this.isConfirmModalOpen = false; this.isModalClosing = false; }, 250);

    this.isLoading = true;

    setTimeout(() => {
      if (this.pendingGroupSelection) {
        this.groupingBy = this.pendingGroupSelection;
        this.buildRootFolders();
      }
      this.isLoading = false;
    }, 2000);
  }

  // --- NAVEGACIÓN (BREADCRUMBS) ---
  buildRootFolders() {
    this.viewMode = 'folders';
    this.currentPath = [{ label: 'Raíz (' + this.getGroupLabel() + ')' }];
    this.foldersToDisplay = this.extractUniqueFolders(this.allSongs, this.groupingBy);
  }

  openFolder(folder: Folder) {
    const level = this.currentPath.length;

    if (this.groupingBy === 'artist' && level === 1) {
      this.currentPath.push({ label: folder.name, filterKey: 'artist', filterValue: folder.name });
      const artistSongs = this.filterSongsByPath();
      this.foldersToDisplay = this.extractUniqueFolders(artistSongs, 'album');
      this.viewMode = 'folders';
    } else {
      let key: keyof Song = this.groupingBy;
      if (this.groupingBy === 'artist' && level === 2) key = 'album'; 

      this.currentPath.push({ label: String(folder.name), filterKey: key, filterValue: folder.name });
      this.songsToDisplay = this.filterSongsByPath();
      this.viewMode = 'songs';
    }
  }

  goToBreadcrumb(index: number) {
    if (index === this.currentPath.length - 1) return;
    this.currentPath = this.currentPath.slice(0, index + 1);

    if (index === 0) {
      this.buildRootFolders();
    } else if (this.groupingBy === 'artist' && index === 1) {
      const artistSongs = this.filterSongsByPath();
      this.foldersToDisplay = this.extractUniqueFolders(artistSongs, 'album');
      this.viewMode = 'folders';
    }
  }

  // --- UTILIDADES DE FILTRO ---
  private filterSongsByPath(): Song[] {
    let filtered = [...this.allSongs];
    for (let i = 1; i < this.currentPath.length; i++) {
      const node = this.currentPath[i];
      const key = node.filterKey; 
      if (key) {
        filtered = filtered.filter(song => song[key] === node.filterValue);
      }
    }
    return filtered;
  }

  private extractUniqueFolders(songs: Song[], key: keyof Song): Folder[] {
    const map = new Map<any, Folder>();
    let defaultIcon = 'folder';
    if (key === 'artist') defaultIcon = 'mic';
    if (key === 'genre') defaultIcon = 'category';
    if (key === 'format') defaultIcon = 'audiotrack';
    if (key === 'year') defaultIcon = 'event';

    songs.forEach(song => {
      const value = song[key];
      if (!map.has(value)) {
        map.set(value, {
          name: String(value), count: 1, icon: defaultIcon,
          coverUrl: key === 'album' ? song.coverUrl : undefined 
        });
      } else {
        map.get(value)!.count++;
      }
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  getGroupLabel(): string {
    const labels = { 'artist': 'Artista', 'year': 'Año', 'genre': 'Género', 'format': 'Calidad' };
    return labels[this.groupingBy];
  }

  // --- COMUNICACIÓN CON EL MODAL DE EDICIÓN ---
  openEditModal(song: Song) {
    this.selectedSong = song;
  }

  closeEditModal() {
    this.isClosingEditModal = true; 
    setTimeout(() => {
      this.selectedSong = null; 
      this.isClosingEditModal = false;
    }, 250); 
  }

  saveChanges(updatedSong: Song) {
    if (this.selectedSong) {
      Object.assign(this.selectedSong, updatedSong);
      this.closeEditModal(); 
    }
  }
}