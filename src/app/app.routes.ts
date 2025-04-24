import { Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'analisis',
    pathMatch: 'full',
  },
  {
    path: 'analisis',
    loadComponent: () =>
      import('./features/analisis/analisis.page').then((m) => m.AnalisisPage),
  },
];

// Exportamos los proveedores para la aplicación
export const appProviders = [
  provideHttpClient()
];
