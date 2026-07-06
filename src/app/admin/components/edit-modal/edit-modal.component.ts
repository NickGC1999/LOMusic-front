import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CancionesService } from '../../../core/services/canciones.service';
import { Song } from '../../../core/models/song.model';

@Component({
  selector: 'app-edit-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './edit-modal.component.html',
  styleUrls: ['./edit-modal.component.css']
})
export class EditModalComponent implements OnChanges {
  @Input() song: Song | null = null;
  @Input() isClosing = false;
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();
  @Output() delete = new EventEmitter<number>();

  // INTERSECCIÓN DE TIPOS: Permite las propiedades de Song + la ruta física temporal del cover
  editedSong: Partial<Song> & { newCoverPhysicalPath?: string } = {};
  showDeleteConfirm = false;
  rescanState: 'idle' | 'loading' | 'success' = 'idle';
  Math = Math; 

  constructor(private cancionesService: CancionesService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['song'] && this.song) {
      this.showDeleteConfirm = false;
      this.rescanState = 'idle';
      this.editedSong = JSON.parse(JSON.stringify(this.song));
    }
  }

  async changeCoverArt() {
    const result = await this.cancionesService.selectCustomCover();
    if (result) {
      this.editedSong.coverUrl = result.base64;
      this.editedSong.newCoverPhysicalPath = result.physicalPath;
    }
  }

  searchHighResCover() {
    alert("🤖 Módulo de búsqueda automática de carátulas HQ listo para ser implementado.");
  }

  async startRescanProcess() {
    if (!this.editedSong.id) return;
    this.rescanState = 'loading';
    setTimeout(async () => {
      const success = await this.cancionesService.rollbackToOfficial(this.editedSong.id!);
      if (success && this.editedSong.filePath) {
        // CORREGIDO: Usamos estricta y únicamente filePath según nuestro contrato
        const cleanTitle = this.editedSong.filePath.split(/[/\\]/).pop()?.replace(/\.[^/.]+$/, '').replace(/^\d+\s*-\s*/, '') || this.editedSong.title;
        this.editedSong.title = cleanTitle;
      }
      this.rescanState = 'success';
    }, 1800);
  }

  acceptRescan() { this.rescanState = 'idle'; }
  requestDelete() { this.showDeleteConfirm = true; }

  async executePhysicalDelete() {
  if (this.editedSong?.id) {
    const deleted = await this.cancionesService.deletePhysicalSong(this.editedSong.id);
    if (deleted) {
      this.delete.emit(this.editedSong.id);
      this.cancel();
    } else {
      console.error('❌ No se pudo eliminar la canción. Revisa la terminal de Electron (proceso main).');
    }
  }
}

  confirmSave() {
    if (this.song && this.editedSong) {
      this.cancionesService.updateSongMetadata(this.editedSong).then(() => {
        this.save.emit(this.editedSong);
        this.cancel();
      });
    }
  }

  cancel() { this.close.emit(); }
}