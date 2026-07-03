import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

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

  // --- NUEVO: MAQUINA DE ESTADOS PARA ESCANEO DE ARRANQUE ---
  isScanning = false;
  currentStatusText = 'Iniciando pasarela de almacenamiento local...';

  constructor(private router: Router) {}

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

  // --- NUEVO: PIPELINE DE INDEXACIÓN INICIAL ---
  startApplication() {
    this.isScanning = true;

    // Cambios de estado dinámicos que simulan la auditoría en tiempo real
    setTimeout(() => { 
      this.currentStatusText = 'Buscando directorios de música en el almacenamiento...'; 
    }, 900);

    setTimeout(() => { 
      this.currentStatusText = 'Analizando firmas acústicas locales (.FLAC / .WAV)...'; 
    }, 1800);

    setTimeout(() => { 
      this.currentStatusText = 'Estandarizando metadatos e indexando catálogo de colección...'; 
    }, 2700);

    // Navegación final programática tras completar el ciclo de carga
    setTimeout(() => {
      this.router.navigate(['/admin']);
    }, 3600);
  }
}