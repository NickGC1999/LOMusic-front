import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  // Aquí definiremos los estados del buscador y filtros cuando conectemos el backend
}