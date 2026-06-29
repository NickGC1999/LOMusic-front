import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';

// Importa tus nuevos componentes
import { CancionesComponent } from './admin/pages/canciones/canciones.component';
import { CarpetasComponent } from './admin/pages/carpetas/carpetas.component';
import { ArtistasComponent } from './admin/pages/artistas/artistas.component';
import { AlbumesComponent } from './admin/pages/albumes/albumes.component';

export const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    children: [
      { path: 'todas', component: CancionesComponent },
      { path: 'carpetas', component: CarpetasComponent },
      { path: 'artistas', component: ArtistasComponent },
      { path: 'albumes', component: AlbumesComponent },
      { path: '', redirectTo: 'todas', pathMatch: 'full' } // Ruta por defecto
    ]
  },
  { path: '', redirectTo: '/admin/todas', pathMatch: 'full' }
];