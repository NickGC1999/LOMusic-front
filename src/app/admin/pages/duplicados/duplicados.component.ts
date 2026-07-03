import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-duplicados',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './duplicados.component.html',
  styleUrls: ['./duplicados.component.css']
})
export class DuplicadosComponent {
  // Lógica visual para mantener la interfaz funcional
  activeSort: string | null = null;
  sortDirection: 'asc' | 'desc' = 'desc'; 
  isFormatExpanded = false;
  activeFormat: string | null = null;

  toggleSort(column: string) {
    if (this.activeSort === column) {
      this.activeSort = null;
    } else {
      this.activeSort = column;
      this.sortDirection = 'desc';
    }
  }

  changeDirection(event: Event) {
    event.stopPropagation(); 
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  }

  selectFormat(format: string) {
    this.activeFormat = this.activeFormat === format ? null : format;
  }
}