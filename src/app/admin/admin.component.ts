import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  isAdvancedOpen = false;
  isCollapsed = false;
  isAnimating = false; 
  private animationTimeout: any; 

  // --- LÓGICA DE ORDENAMIENTO AVANZADO ---
  activeSort: string | null = null; // Ninguno activo por defecto
  sortDirection: 'asc' | 'desc' = 'desc'; 

  // --- LÓGICA DE EXPANSIÓN DE FORMATO ---
  isFormatExpanded = false;
  activeFormat: string | null = null;

  // Acción 1: Clic en el texto (Activa o Apaga)
  toggleSort(column: string) {
    if (this.activeSort === column) {
      this.activeSort = null; // Si ya estaba activo, lo apaga
    } else {
      this.activeSort = column;
      this.sortDirection = 'desc'; // Por defecto empieza descendente
    }
  }

  // Acción 2: Clic en la flecha (Solo invierte)
  changeDirection(event: Event) {
    event.stopPropagation(); // CRÍTICO: Evita que el clic llegue al texto y apague el filtro
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  }

  // Selección de formato
  selectFormat(format: string) {
    this.activeFormat = this.activeFormat === format ? null : format;
  }

  // --- MÉTODOS DEL MENÚ LATERAL ---
  toggleAdvanced() {
    this.isAdvancedOpen = !this.isAdvancedOpen;
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.triggerWaveAnimation();
  }

  private triggerWaveAnimation() {
    if (this.animationTimeout) clearTimeout(this.animationTimeout);
    this.isAnimating = true;
    this.animationTimeout = setTimeout(() => {
      this.isAnimating = false;
      this.animationTimeout = null; 
    }, 1500); 
  }
}