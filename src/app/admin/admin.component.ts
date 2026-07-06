import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// IMPORTANTE: Importación canónica del componente de búsqueda global
import { GlobalSearchComponent } from './components/global-search/global-search.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  // REGISTRO EN EL ÁMBITO DE LA PLANTILLA: Elimina el error rojo en el HTML
  imports: [
    CommonModule, 
    MatIconModule, 
    MatButtonModule, 
    RouterModule, 
    FormsModule, 
    GlobalSearchComponent
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  // --- ESTADO GENERAL DE LA BARRA LATERAL ---
  isAdvancedOpen = false;
  isCollapsed = false;
  isAnimating = false;
  isWelcome = true;
  currentDensity: number = 2; 
  private animationTimeout: any; 
  isLightTheme = false; 

  // --- LÓGICA DE MODALES ---
  isConfigOpen = false;
  isConfigClosing = false;
  isExitOpen = false;
  isExitClosing = false;

  // --- LÓGICA DE ESCANEO ---
  isScanMenuOpen = false;
  isScanMenuClosing = false;
  isScanConfirmOpen = false;
  isScanConfirmClosing = false;
  selectedScanType: 'new_folder' | 'full_rescan' | null = null;
  isScanningExecution = false; 

  // --- CONTROL DE BÚSQUEDA GLOBAL ---
  private searchSubject = new Subject<string>();
  activeSearchTerm: string = '';
  currentRouteContext: string = 'canciones';
  dynamicPlaceholder: string = 'Escribe la canción, artista o álbum que buscas...';

  constructor(private router: Router) {}

  // --- ÚNICO CICLO DE VIDA (UNIFICADO) ---
  ngOnInit() {
    // 1. Temporizador original de bienvenida
    setTimeout(() => {
      this.isWelcome = false;
    }, 1400);

    // 2. Escucha reactiva del Router para contextualizar la búsqueda
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects;
        if (url.includes('artistas')) {
          this.currentRouteContext = 'artistas';
          this.dynamicPlaceholder = 'Buscar artistas en tu biblioteca local...';
        } else if (url.includes('albumes')) {
          this.currentRouteContext = 'albumes';
          this.dynamicPlaceholder = 'Buscar álbumes en tu biblioteca local...';
        } else if (url.includes('generos')) {
          this.currentRouteContext = 'generos';
          this.dynamicPlaceholder = 'Buscar género musical...';
        } else if (url.includes('carpetas')) {
          this.currentRouteContext = 'carpetas';
          this.dynamicPlaceholder = 'Busca en tus directorios...';
        } else {
          this.currentRouteContext = url.split('/').pop() || 'canciones';
          this.dynamicPlaceholder = 'Escribe la canción, artista o álbum que buscas...';
        }
      }
    });

    // 3. Flujo reactivo del input con protección de renderizado (Debounce)
    this.searchSubject.pipe(
      debounceTime(250),
      distinctUntilChanged()
    ).subscribe(term => {
      this.activeSearchTerm = term;
    });
  }

  // --- EMISOR DE EVENTO DEL INPUT ---
  onGlobalSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
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
  
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.triggerWaveAnimation();
  }

  private triggerWaveAnimation() {
    if (this.isAnimating) return; 
    this.isAnimating = true;
    this.animationTimeout = setTimeout(() => {
      this.isAnimating = false;
      this.animationTimeout = null; 
    }, 1200); 
  }
}