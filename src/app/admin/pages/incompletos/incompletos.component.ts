import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CancionesService } from '../../../core/services/canciones.service';
import { Observable, BehaviorSubject, switchMap } from 'rxjs';
import { Song } from '../../../core/models/song.model';
import { EditModalComponent } from '../../components/edit-modal/edit-modal.component';
import { SongTableComponent } from '../../components/song-table/song-table.component';

@Component({
  selector: 'app-incompletos',
  standalone: true,
  imports: [CommonModule, MatIconModule, EditModalComponent, SongTableComponent],
  templateUrl: './incompletos.component.html',
  styleUrls: ['./incompletos.component.css']
})
export class IncompletosComponent implements OnInit {
  songs$!: Observable<Song[]>;
  selectedSong: Song | null = null;
  isClosingModal = false;

  private refresh$ = new BehaviorSubject<void>(undefined);

  constructor(private cancionesService: CancionesService) {}

  ngOnInit(): void {
    this.songs$ = this.refresh$.pipe(
      switchMap(() => this.cancionesService.getIncompleteSongs())
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
    this.refresh$.next(); // Reconsulta: si ya no está incompleta, desaparece sola de esta lista
  }

  onSongDeleted(_: number) {
    this.closeEditModal();
    this.refresh$.next();
  }
}