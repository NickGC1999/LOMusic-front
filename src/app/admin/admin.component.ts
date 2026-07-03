import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  // --- ESTADO GENERAL DE LA BARRA LATERAL ---
  isAdvancedOpen = false;
  isCollapsed = false;
  isAnimating = false;
  isWelcome = true; // Controla estrictamente la animación de bienvenida inicial
  currentDensity: number = 2; 
  private animationTimeout: any; 
  
  isLightTheme = false; 

  // --- LÓGICA DE MODALES DE CONFIGURACIÓN Y SALIDA ---
  isConfigOpen = false;
  isConfigClosing = false;
  
  isExitOpen = false;
  isExitClosing = false;

  // --- LÓGICA DE ESCANEO DE ARCHIVOS LOCALES ---
  isScanMenuOpen = false;
  isScanMenuClosing = false;

  isScanConfirmOpen = false;
  isScanConfirmClosing = false;
  selectedScanType: 'new_folder' | 'full_rescan' | null = null;

  isScanningExecution = false; 

  constructor(private router: Router) {}

  // --- CICLO DE VIDA DE ANGULAR ---
  ngOnInit() {
    // Al cargar la pantalla, dejamos que el 'welcomeDance' de CSS se ejecute por 1.4s.
    // Tras este tiempo, destruimos el estado de bienvenida para evitar colisiones futuras.
    setTimeout(() => {
      this.isWelcome = false;
    }, 1400);
  }

  // --- CONTROL DE DENSIDAD ---
  changeDensity() {
    document.body.classList.remove('density-1', 'density-2', 'density-3');
    if (this.currentDensity != 2) {
      document.body.classList.add(`density-${this.currentDensity}`);
    }
  }

  // --- FLUJO DEL MENÚ DE ESCANEO ---
  toggleScanMenu(event?: Event) {
    if (event) event.preventDefault();
    if (this.isScanMenuOpen) {
      this.isScanMenuClosing = true;
      setTimeout(() => { this.isScanMenuOpen = false; this.isScanMenuClosing = false; }, 250);
    } else {
      this.isScanMenuOpen = true;
    }
  }

  selectScanOption(type: 'new_folder' | 'full_rescan') {
    this.selectedScanType = type;
    this.isScanMenuClosing = true;
    setTimeout(() => {
      this.isScanMenuOpen = false;
      this.isScanMenuClosing = false;
      this.isScanConfirmOpen = true;
    }, 200);
  }

  closeScanConfirm() {
    this.isScanConfirmClosing = true;
    setTimeout(() => {
      this.isScanConfirmOpen = false;
      this.isScanConfirmClosing = false;
      this.selectedScanType = null;
    }, 250);
  }

  confirmAndExecuteScan() {
    this.isScanConfirmClosing = true;
    setTimeout(() => {
      this.isScanConfirmOpen = false;
      this.isScanConfirmClosing = false;
      this.isScanningExecution = true;

      setTimeout(() => {
        this.isScanningExecution = false;
        this.selectedScanType = null;
      }, 2500);
    }, 200);
  }

  // --- MODALES EXISTENTES ---
  toggleConfig(event?: Event) {
    if (event) event.preventDefault();
    if (this.isConfigOpen) {
      this.isConfigClosing = true; 
      setTimeout(() => { this.isConfigOpen = false; this.isConfigClosing = false; }, 250);
    } else {
      this.isConfigOpen = true; 
    }
  }

  toggleExit(event?: Event) {
    if (event) event.preventDefault();
    if (this.isExitOpen) {
      this.isExitClosing = true;
      setTimeout(() => { this.isExitOpen = false; this.isExitClosing = false; }, 250);
    } else {
      this.isExitOpen = true;
    }
  }

  confirmExit() {
    this.router.navigate(['/']); 
  }

  toggleTheme() {
    this.isLightTheme = !this.isLightTheme;
    if (this.isLightTheme) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }

  toggleAdvanced() { 
    this.isAdvancedOpen = !this.isAdvancedOpen; 
  }
  
  // --- CONTROL DE BARRA LATERAL CON ANIMATION GUARD ---
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.triggerWaveAnimation();
  }

  private triggerWaveAnimation() {
    // PATRÓN DE BLOQUEO: Evita que interacciones compulsivas (spam click) rompan la onda
    if (this.isAnimating) {
      return; 
    }

    this.isAnimating = true;

    // Sincronizado al 100% con la onda dinámica de 1.2s en CSS
    this.animationTimeout = setTimeout(() => {
      this.isAnimating = false;
      this.animationTimeout = null; 
    }, 1200); 
  }
}