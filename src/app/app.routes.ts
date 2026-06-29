import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AdminComponent } from './admin/admin.component';

export const routes: Routes = [
  // 1. La raíz del sitio ahora cargará correctamente el carrusel de inicio
  { path: '', component: HomeComponent }, 
  
  // 2. El panel que estuvimos modificando solo se abrirá al escribir /admin
  { path: 'admin', component: AdminComponent }, 
  
  // 3. Comodín: si escribes cualquier otra cosa, te regresa al inicio
  { path: '**', redirectTo: '' } 
];