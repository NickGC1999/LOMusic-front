import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CancionesService } from '../../../core/services/canciones.service';
import { Song } from '../../../core/models/song.model';
import { FolderNode } from '../../../core/models/folder-node.model';
import { EditModalComponent } from '../../components/edit-modal/edit-modal.component';
import { SongTableComponent } from '../../components/song-table/song-table.component';

@Component({
  selector: 'app-carpetas',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, EditModalComponent, SongTableComponent],
  templateUrl: './carpetas.component.html',
  styleUrls: ['./carpetas.component.css']
})
export class CarpetasComponent implements OnInit {
  rootNodes: FolderNode[] = [];
  pathStack: FolderNode[] = [];

  currentChildren: FolderNode[] = [];
  currentSongs: Song[] = [];

  selectedSong: Song | null = null;
  isClosingEditModal = false;

  // --- MENÚ CONTEXTUAL ---
  contextMenuVisible = false;
  contextMenuX = 0;
  contextMenuY = 0;
  contextMenuTarget: FolderNode | null = null;

  // --- MODAL DE RENOMBRAR ---
  isRenameModalOpen = false;
  isRenameModalClosing = false;
  renameValue = '';


  // --- MODAL DE ELIMINAR ---
  isDeleteFolderModalOpen = false;
  isDeleteFolderModalClosing = false;

  // --- ESTADO DE OPERACIÓN EN CURSO ---
  isProcessingFolderAction = false;
  folderActionMessage = '';
  folderActionError: string | null = null;

  isRestructureConfirmOpen = false;
  isRestructureConfirmClosing = false;
  pendingRestructureMode: 'artist' | 'year' | 'genre' | 'format' | null = null;
  restructureResultMessage: string | null = null;

  constructor(private cancionesService: CancionesService) {}

  ngOnInit(): void {
    this.loadTree();
  }

  private loadTree() {
    this.cancionesService.getFolderTree().subscribe(tree => {
      this.rootNodes = tree;
      this.pathStack = [];
      this.renderCurrentLevel();
    });
  }

  private renderCurrentLevel() {
    const currentLevelNodes = this.pathStack.length === 0
      ? this.rootNodes
      : this.pathStack[this.pathStack.length - 1].children;

    this.currentChildren = currentLevelNodes;
    this.currentSongs = this.pathStack.length === 0
      ? []
      : this.pathStack[this.pathStack.length - 1].songs;
  }

  openFolder(node: FolderNode) {
    this.pathStack.push(node);
    this.renderCurrentLevel();
  }

  goToBreadcrumb(index: number) {
    this.pathStack = index < 0 ? [] : this.pathStack.slice(0, index + 1);
    this.renderCurrentLevel();
  }

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

  onSongSaved(_: any) {
    this.closeEditModal();
    this.loadTree();
  }

  onSongDeleted(_: number) {
    this.closeEditModal();
    this.loadTree();
  }

  // =========================================================================
  // MENÚ CONTEXTUAL
  // =========================================================================
  onFolderRightClick(event: MouseEvent, node: FolderNode) {
    event.preventDefault();
    event.stopPropagation();
    this.contextMenuTarget = node;
    this.contextMenuX = event.clientX;
    this.contextMenuY = event.clientY;
    this.contextMenuVisible = true;
  }

  @HostListener('document:click')
  closeContextMenu() {
    this.contextMenuVisible = false;
  }

  @HostListener('document:keydown.escape')
  onEscapePressed() {
    this.contextMenuVisible = false;
  }

  // --- ACCIÓN: RENOMBRAR ---
  requestRename() {
    if (!this.contextMenuTarget) return;
    this.renameValue = this.contextMenuTarget.name;
    this.isRenameModalOpen = true;
    this.contextMenuVisible = false;
  }

  cancelRename() {
    this.isRenameModalClosing = true;
    setTimeout(() => {
      this.isRenameModalOpen = false;
      this.isRenameModalClosing = false;
    }, 250);
  }

  async confirmRename() {
    if (!this.contextMenuTarget || !this.renameValue.trim()) return;
    const target = this.contextMenuTarget;
    this.cancelRename();
    this.runFolderAction('Renombrando carpeta...', async () => {
      return await this.cancionesService.renamePhysicalFolder(target.path, this.renameValue.trim());
    });
  }

  // --- ACCIÓN: BORRAR ---
  requestDeleteFolder() {
    if (!this.contextMenuTarget) return;
    this.isDeleteFolderModalOpen = true;
    this.contextMenuVisible = false;
  }

  cancelDeleteFolder() {
    this.isDeleteFolderModalClosing = true;
    setTimeout(() => {
      this.isDeleteFolderModalOpen = false;
      this.isDeleteFolderModalClosing = false;
    }, 250);
  }

  async confirmDeleteFolder() {
    if (!this.contextMenuTarget) return;
    const target = this.contextMenuTarget;
    this.cancelDeleteFolder();
    this.runFolderAction('Eliminando carpeta...', async () => {
      return await this.cancionesService.deletePhysicalFolder(target.path);
    });
  }

  // --- ACCIÓN: VOLVER A ESCANEAR ---
  async requestRescan() {
    if (!this.contextMenuTarget) return;
    const target = this.contextMenuTarget;
    this.contextMenuVisible = false;
    this.runFolderAction('Re-escaneando carpeta...', async () => {
      return await this.cancionesService.rescanSpecificFolder(target.path);
    });
  }

  // --- MOTOR COMPARTIDO DE EJECUCIÓN ---
  private async runFolderAction(message: string, action: () => Promise<{ success: boolean; error?: string }>) {
    this.isProcessingFolderAction = true;
    this.folderActionMessage = message;
    this.folderActionError = null;

    const result = await action();

    this.isProcessingFolderAction = false;

    if (!result.success) {
      this.folderActionError = result.error || 'Ocurrió un error inesperado.';
      return;
    }

    // Si la carpeta afectada estaba en nuestra ruta de navegación actual, volvemos a la raíz
    // para evitar mostrar una ruta que ya no existe físicamente.
    this.pathStack = [];
    this.loadTree();
  }

  dismissFolderActionError() {
    this.folderActionError = null;
  }

  requestRestructure(mode: 'artist' | 'year' | 'genre' | 'format') {
  this.pendingRestructureMode = mode;
  this.isRestructureConfirmOpen = true;
}

cancelRestructure() {
  this.isRestructureConfirmClosing = true;
  setTimeout(() => {
    this.isRestructureConfirmOpen = false;
    this.isRestructureConfirmClosing = false;
    this.pendingRestructureMode = null;
  }, 250);
}

async confirmRestructure() {
  const mode = this.pendingRestructureMode;
  if (!mode) return;

  this.isRestructureConfirmClosing = true;
  setTimeout(() => {
    this.isRestructureConfirmOpen = false;
    this.isRestructureConfirmClosing = false;
  }, 250);

  this.isProcessingFolderAction = true;
  this.folderActionMessage = 'Reestructurando biblioteca física...';

  const result = await this.cancionesService.restructureLibrary(mode);

  this.isProcessingFolderAction = false;
  this.pendingRestructureMode = null;

  if (!result.success) {
    this.folderActionError = result.error || 'Ocurrió un error inesperado.';
    return;
  }

  
let message = `Se movieron ${result.moved} pistas correctamente.`;
if (result.failed) message += ` ${result.failed} fallaron (revisa la consola de Electron).`;
if (result.cleanedFolders) message += ` Se limpiaron ${result.cleanedFolders} carpetas vacías.`;
if (result.leftoverFilesMoved) message += ` ${result.leftoverFilesMoved} archivos sueltos se movieron a "Archivos Sueltos".`;
this.restructureResultMessage = message;

  this.pathStack = [];
  this.loadTree();
}

dismissRestructureResult() {
  this.restructureResultMessage = null;
}

async runCleanupOrphanFolders() {
  this.isProcessingFolderAction = true;
  this.folderActionMessage = 'Buscando carpetas vacías...';

  const result = await this.cancionesService.cleanupOrphanFolders();

  this.isProcessingFolderAction = false;

  if (!result.success) {
    this.folderActionError = result.error || 'Ocurrió un error inesperado.';
    return;
  }

  let message = `Se eliminaron ${result.cleanedFolders} carpetas vacías.`;
  if (result.leftoverFilesMoved) {
    message += ` Se movieron ${result.leftoverFilesMoved} archivos sueltos (letras, imágenes, etc.) a la carpeta "Archivos Sueltos" en la raíz de tu biblioteca.`;
  }
  if (result.skippedFolders && result.skippedFolders.length) {
    message += ` ${result.skippedFolders.length} carpeta(s) no se tocaron por contener archivos no reconocidos.`;
  }

  this.restructureResultMessage = message;
  this.pathStack = [];
  this.loadTree();
}

}