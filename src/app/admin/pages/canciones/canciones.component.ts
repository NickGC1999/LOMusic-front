import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CancionesService } from '../../../core/services/canciones.service';
import { Song } from '../../../core/mocks/canciones.mock';
import { Observable, BehaviorSubject, combineLatest, map } from 'rxjs';
// CRÍTICO: Importación del nuevo componente modular
import { EditModalComponent } from '../../components/edit-modal/edit-modal.component';

@Component({
  selector: 'app-canciones',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, EditModalComponent],
  templateUrl: './canciones.component.html',
  styleUrls: ['./canciones.component.css']
})
export class CancionesComponent implements OnInit {
  // --- FLUJO DE DATOS ---
  canciones$!: Observable<Song[]>;

  // --- ESTADO DE LA INTERFAZ (FILTROS) ---
  activeSort: string | null = null;
  sortDirection: 'asc' | 'desc' = 'desc'; 
  isFormatExpanded = false;
  activeFormat: string | null = null;

  // --- ESTADO DEL MODAL COMPARTIDO ---
  selectedSong: Song | null = null;
  isClosingModal = false;

  private formatFilter$ = new BehaviorSubject<string | null>(null);
  private sortConfig$ = new BehaviorSubject<{column: string | null, direction: 'asc' | 'desc'}>({column: null, direction: 'desc'});

  constructor(private cancionesService: CancionesService) {}

  ngOnInit(): void {
    this.canciones$ = combineLatest([
      this.cancionesService.getAllSongs(),
      this.formatFilter$,
      this.sortConfig$
    ]).pipe(
      map(([songs, format, sortConf]) => {
        let result = [...songs];

        // 1. Aplicar Filtro de Formato
        if (format) {
          result = result.filter(song => song.format === format);
        }

        // 2. Aplicar Ordenamiento
        if (sortConf.column) {
          result.sort((a, b) => {
            let key: keyof Song = 'title'; 
            if (sortConf.column === 'name') key = 'title';
            if (sortConf.column === 'date') key = 'year';
            if (sortConf.column === 'artist') key = 'artist';
            if (sortConf.column === 'album') key = 'album';
            if (sortConf.column === 'duration') key = 'duration';

            let valA: any = a[key];
            let valB: any = b[key];

            // PARCHEO ARQUITECTÓNICO: Convertir "MM:SS" a segundos totales
            if (sortConf.column === 'duration') {
              const parseTime = (timeStr: string) => {
                const parts = timeStr.split(':');
                return parseInt(parts[0]) * 60 + parseInt(parts[1]);
              };
              valA = parseTime(a.duration);
              valB = parseTime(b.duration);
            }

            if (valA < valB) return sortConf.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConf.direction === 'asc' ? 1 : -1;
            return 0;
          });
        }

        return result;
      })
    );
  }

  // --- MÉTODOS DE FILTROS ---
  toggleSort(column: string) {
    if (this.activeSort === column) {
      this.activeSort = null;
    } else {
      this.activeSort = column;
      this.sortDirection = 'desc';
    }
    this.sortConfig$.next({ column: this.activeSort, direction: this.sortDirection });
  }

  changeDirection(event: Event) {
    event.stopPropagation(); 
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortConfig$.next({ column: this.activeSort, direction: this.sortDirection });
  }

  selectFormat(format: string) {
    this.activeFormat = this.activeFormat === format ? null : format;
    this.formatFilter$.next(this.activeFormat);
  }

  // --- MÉTODOS DE COMUNICACIÓN CON EL MODAL (DELEGACIÓN) ---
  
  openEditModal(song: Song) {
    this.selectedSong = song;
  }

  closeEditModal() {
    this.isClosingModal = true; 
    setTimeout(() => {
      this.selectedSong = null; 
      this.isClosingModal = false;
    }, 250); 
  }

  // Ahora recibe la canción actualizada que le envía el modal hijo
  saveChanges(updatedSong: Song) {
    if (this.selectedSong) {
      Object.assign(this.selectedSong, updatedSong);
      this.closeEditModal(); 
    }
  }
}