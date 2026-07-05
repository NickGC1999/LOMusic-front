import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-modificados',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './modificados.component.html',
  styleUrls: ['./modificados.component.css']
})
export class ModificadosComponent {
  activeSort: string | null = null;
  sortDirection: 'asc' | 'desc' = 'desc';
  isFormatExpanded = false;
  activeFormat: string | null = null;

  toggleSort(column: string) {
    this.activeSort = this.activeSort === column ? null : column;
    if (this.activeSort) this.sortDirection = 'desc';
  }

  changeDirection(event: Event) {
    event.stopPropagation();
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  }

  selectFormat(format: string) {
    this.activeFormat = this.activeFormat === format ? null : format;
  }
}