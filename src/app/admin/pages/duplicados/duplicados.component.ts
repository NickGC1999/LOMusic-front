import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CancionesService } from '../../../core/services/canciones.service';
import { Observable, BehaviorSubject, switchMap } from 'rxjs';
import { Song } from '../../../core/models/song.model';
import { EditModalComponent } from '../../components/edit-modal/edit-modal.component';
import { SongTableComponent } from '../../components/song-table/song-table.component';

@Component({
  selector: 'app-duplicados',
  standalone: true,
  imports: [CommonModule, MatIconModule, EditModalComponent, SongTableComponent],
  templateUrl: './duplicados.component.html',
  styleUrls: ['./duplicados.component.css']
})
export class DuplicadosComponent implements OnInit {
  songs$!: Observable<Song[]>;
  selectedSong: Song | null = null;
  isClosingModal = false;

  private refresh$ = new BehaviorSubject<void>(undefined);

  constructor(private cancionesService: CancionesService) {}

  ngOnInit(): void {
    this.songs$ = this.refresh$.pipe(
      switchMap(() => this.cancionesService.getDuplicateSongs())
    );
  }

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

  onSongSaved(_: any) {
    this.closeEditModal();
    this.refresh$.next();
  }

  onSongDeleted(_: number) {
    this.closeEditModal();
    this.refresh$.next(); // Si el usuario elimina el duplicado, desaparece de la lista al recontar
  }
}