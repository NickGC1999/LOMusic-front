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
    // 1. Verificación de entorno: Si estamos en web (Vercel), mantenemos la simulación para la demo visual
    if (!this.electronService.isElectron) {
      this.runSimulatedDemo();
      return;
    }

    try {
      // 2. Pedimos a Node.js que abra el explorador nativo del sistema operativo
      const carpetaSeleccionada = await this.electronService.invoke<string>('open-folder-dialog');

      // Si el usuario cierra la ventana de Windows sin elegir carpeta, abortamos limpiamente
      if (!carpetaSeleccionada) {
        console.log('⚠️ [HomeComponent] Selección de carpeta cancelada por el usuario.');
        return;
      }

      // 3. Activamos la animación visual de la onda "L" en tu HTML
      this.isScanning = true;
      this.currentStatusText = `Accediendo al disco duro: ${carpetaSeleccionada}...`;
      console.log(`📂 Auditoría iniciada en ruta física: ${carpetaSeleccionada}`);

      setTimeout(() => {
        this.currentStatusText = 'Extrayendo etiquetas ID3 y firmas acústicas binarias...';
      }, 800);

      // 4. Ordenamos al proceso principal (Node.js + WebAssembly) escanear e insertar en SQLite
      const resultado = await this.electronService.invoke<any>('scan-folder', carpetaSeleccionada);

      this.currentStatusText = 'Consolidando catálogo en base de datos relacional...';

      if (resultado && resultado.success) {
        console.log('✅ [HomeComponent] Escaneo físico completado con éxito.');
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