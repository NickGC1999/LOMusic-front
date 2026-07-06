import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
// CRÍTICO: Importación con ruta relativa limpia y segura
import { ElectronService } from '../core/services/electron.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  // --- ESTADO DE MODALES INFORMATIVOS ---
  activeModal: 'about' | 'faq' | null = null;
  isClosingModal = false;

  // --- MÁQUINA DE ESTADOS PARA ESCANEO DE ARRANQUE ---
  isScanning: boolean = false;
  currentStatusText = 'Iniciando pasarela de almacenamiento local...';

  constructor(
    private router: Router,
    private electronService: ElectronService
  ) {}

  openModal(type: 'about' | 'faq') {
    this.activeModal = type;
    this.isClosingModal = false;
  }

  closeModal() {
    this.isClosingModal = true;
    setTimeout(() => {
      this.activeModal = null;
      this.isClosingModal = false;
    }, 300);
  }

  // --- PIPELINE DE INDEXACIÓN REAL POR IPC ---
  async startApplication() {
  if (!this.electronService.isElectron) {
    this.runSimulatedDemo();
    return;
  }

  try {
    const carpetaSeleccionada = await this.electronService.invoke<string>('open-folder-dialog');

    if (!carpetaSeleccionada) {
      console.log('⚠️ [HomeComponent] Selección de carpeta cancelada por el usuario.');
      return;
    }

    this.isScanning = true;
    this.currentStatusText = `Accediendo al disco duro: ${carpetaSeleccionada}...`;
    console.log(`📂 Auditoría iniciada en ruta física: ${carpetaSeleccionada}`);

    // Escuchamos el progreso en vivo del proceso combinado (escaneo + estandarización)
    this.electronService.onAutotagProgress((progress: any) => {
      if (progress.phase === 'scanning-done') {
        this.currentStatusText = 'Biblioteca indexada. Buscando pistas con datos incompletos...';
      } else if (progress.phase === 'standardizing') {
        this.currentStatusText = `Estandarizando (${progress.current}/${progress.total}): ${progress.status}`;
      } else if (progress.phase === 'syncing') {
        this.currentStatusText = 'Sincronizando metadatos corregidos con el catálogo...';
      } else if (progress.phase === 'done') {
        this.currentStatusText = 'Auditoría completa.';
      }
    });

    const resultado = await this.electronService.invoke<any>('scan-and-standardize', carpetaSeleccionada);

    if (resultado && resultado.success) {
      console.log('✅ [HomeComponent] Escaneo y estandarización completados con éxito.', resultado.autotag);
      setTimeout(() => {
        this.isScanning = false;
        this.router.navigate(['/admin']);
      }, 1000);
    }
  } catch (error) {
    this.isScanning = false;
    this.currentStatusText = 'Error en la lectura del almacenamiento local.';
    console.error('❌ [HomeComponent] Fallo crítico en canal IPC:', error);
  }
}

  // Método de respaldo para que tu web demo en Vercel siga funcionando sin errores
  private runSimulatedDemo() {
    this.isScanning = true;
    setTimeout(() => { this.currentStatusText = 'Buscando directorios de música en el almacenamiento...'; }, 900);
    setTimeout(() => { this.currentStatusText = 'Analizando firmas acústicas locales (.FLAC / .WAV)...'; }, 1800);
    setTimeout(() => { this.currentStatusText = 'Estandarizando metadatos e indexando catálogo de colección...'; }, 2700);
    setTimeout(() => {
      this.isScanning = false;
      this.router.navigate(['/admin']);
    }, 3600);
  }
}