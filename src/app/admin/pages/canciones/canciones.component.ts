import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CancionesService } from '../../../core/services/canciones.service';
import { Observable, BehaviorSubject, combineLatest, map, switchMap } from 'rxjs';
import { EditModalComponent } from '../../components/edit-modal/edit-modal.component';

@Component({
  selector: 'app-canciones',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, EditModalComponent],
  templateUrl: './canciones.component.html',
  styleUrls: ['./canciones.component.css']
})
export class CancionesComponent implements OnInit {
  canciones$!: Observable<any[]>;

  activeSort: string | null = null;
  sortDirection: 'asc' | 'desc' = 'desc'; 
  isFormatExpanded = false;
  activeFormat: string | null = null;

  selectedSong: any | null = null;
  isClosingModal = false;

  // NUEVO: Disparador reactivo para refrescar la tabla desde SQLite
  private refresh$ = new BehaviorSubject<void>(undefined);
  private formatFilter$ = new BehaviorSubject<string | null>(null);
  private sortConfig$ = new BehaviorSubject<{column: string | null, direction: 'asc' | 'desc'}>({column: null, direction: 'desc'});

  constructor(private cancionesService: CancionesService) {}

  ngOnInit(): void {
    // Usamos switchMap conectado a refresh$ para recargar SQLite instantáneamente al cambiar datos
    const rawSongs$ = this.refresh$.pipe(
      switchMap(() => this.cancionesService.getAllSongs())
    );

    this.canciones$ = combineLatest([rawSongs$, this.formatFilter$, this.sortConfig$]).pipe(
      map(([songs, format, sortConf]) => {
        let result = [...songs];
        if (format) result = result.filter(song => song.format === format);
        if (sortConf.column) {
        result.sort((a: any, b: any) => {
            let key: any = 'title';
            if (sortConf.column === 'name') key = 'title';
            if (sortConf.column === 'artist') key = 'artist';
            if (sortConf.column === 'album') key = 'album';
            if (sortConf.column === 'duration') key = 'duration';

            let valA: any = a[key];
            let valB: any = b[key];

            if (sortConf.column === 'duration') {
              const parseTime = (t: string) => {
                const p = (t || '00:00').split(':');
                return parseInt(p[0]) * 60 + parseInt(p[1]);
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

  // MÉTODOS DE ACCIÓN (DISPARAN EL REFRESCO REAL EN PANTALLA)
  onSongSaved(updatedSong: any) {
    this.closeEditModal();
    this.refresh$.next(); // Force re-fetch desde SQLite
  }

  onSongDeleted(deletedSongId: number) {
    this.closeEditModal();
    this.refresh$.next(); // Force re-fetch inmediatamente tras borrar
  }

  // MODIFICACIÓN QUIRÚRGICA: Desenvolvemos la canción real si viene envuelta por la tabla
  openEditModal(song: any) { 
    const realSong = song && song.localSongData ? song.localSongData : song;
    this.selectedSong = realSong; 
  }
  
  closeEditModal() {
    this.isClosingModal = true; 
    setTimeout(() => {
      this.selectedSong = null; 
      this.isClosingModal = false;
    }, 250); 
  }

  toggleSort(col: string) {
    this.activeSort = this.activeSort === col ? null : col;
    this.sortConfig$.next({ column: this.activeSort, direction: this.sortDirection });
  }

  changeDirection(e: Event) {
    e.stopPropagation();
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortConfig$.next({ column: this.activeSort, direction: this.sortDirection });
  }

  selectFormat(fmt: string) {
    this.activeFormat = this.activeFormat === fmt ? null : fmt;
    this.formatFilter$.next(this.activeFormat);
  }
}