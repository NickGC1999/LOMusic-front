import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AdminComponent } from './admin/admin.component';

// Importamos los hijos
import { CancionesComponent } from './admin/pages/canciones/canciones.component';
import { CarpetasComponent } from './admin/pages/carpetas/carpetas.component';
import { ArtistasComponent } from './admin/pages/artistas/artistas.component';
import { AlbumesComponent } from './admin/pages/albumes/albumes.component';
import { GenerosComponent } from './admin/pages/generos/generos.component';
import { IncompletosComponent } from './admin/pages/incompletos/incompletos.component';
import { DuplicadosComponent } from './admin/pages/duplicados/duplicados.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { 
    path: 'admin', 
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'canciones', pathMatch: 'full' }, // Por defecto carga canciones
      { path: 'canciones', component: CancionesComponent },
      { path: 'carpetas', component: CarpetasComponent },
      { path: 'artistas', component: ArtistasComponent },
      { path: 'albumes', component: AlbumesComponent },
      { path: 'generos', component: GenerosComponent },
      { path: 'incompletos', component: IncompletosComponent },
      { path: 'duplicados', component: DuplicadosComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];