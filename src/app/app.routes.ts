import { Routes } from '@angular/router';

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
