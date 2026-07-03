import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Song } from '../../../core/mocks/canciones.mock';

@Component({
  selector: 'app-edit-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './edit-modal.component.html',
  styleUrls: ['./edit-modal.component.css']
})
export class EditModalComponent implements OnChanges {
  // Canales de comunicación unidireccional (Data-down, Actions-up)
  @Input() song: Song | null = null;
  @Input() isClosing = false;
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Song>();

  editedSong: Partial<Song> = {};

  ngOnChanges(changes: SimpleChanges): void {
    // Cada vez que el padre nos pase una nueva canción, rompemos la referencia de memoria clonándola
    if (changes['song'] && this.song) {
      this.editedSong = { 
        ...this.song,
        composer: this.song.composer || 'Desconocido',
        lyrics: this.song.lyrics || 'Cargando letras desde la base de datos...\n[Verso 1]\n...'
      };
    }
  }

  resetChanges() {
    if (this.song) {
      this.editedSong = { ...this.song };
    }
  }

  confirmSave() {
    if (this.song && this.editedSong) {
      // Emitimos el objeto modificado hacia el componente padre
      this.save.emit(this.editedSong as Song);
    }
  }

  cancel() {
    this.close.emit();
  }
}