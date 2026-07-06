import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Song } from '../../../core/models/song.model';

@Component({
  selector: 'app-song-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './song-table.component.html',
  styleUrls: ['./song-table.component.css']
})
export class SongTableComponent {
  @Input() songs: Song[] | null = null;
  @Output() rowClick = new EventEmitter<Song>();

  onRowClick(song: Song) {
    this.rowClick.emit(song);
  }
}