import { Component } from '@angular/core';
// Importamos la herramienta de navegación nativa
import { RouterOutlet } from '@angular/router'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  // Esta etiqueta es un "hueco" donde Angular inyectará la pantalla que corresponda
  template: `<router-outlet></router-outlet>` 
})
export class AppComponent {}