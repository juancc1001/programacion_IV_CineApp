import { Routes } from '@angular/router';
import { roleGuard } from './guards/role.guard';
import { Roles } from '../types/roles';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then((m) => m.Home) },
  { path: 'candy', loadComponent: () => import('./pages/candy/candy').then((m) => m.Candy) },
  { path: 'pelicula/:id', loadComponent: () => import('./pages/pelicula/pelicula').then((m) => m.Pelicula) },
  { path: 'carrito', loadComponent: () => import('./pages/carrito/carrito').then((m) => m.Carrito) },
  { path: 'backoffice', 
    loadComponent: () => import('./pages/backoffice/backoffice').then((m) => m.Backoffice), 
    canMatch: [roleGuard(Roles.Admin)],
    children: [
      { path: 'salas', loadComponent: () => import('./pages/backoffice/salas/salas').then((m) => m.Salas) },
      { path: 'peliculas', loadComponent: () => import('./pages/backoffice/peliculas/peliculas').then((m) => m.Peliculas) },
      { path: 'funciones', loadComponent: () => import('./pages/backoffice/funciones/funciones').then((m) => m.Funciones) },
      { path: 'productos', loadComponent: () => import('./pages/backoffice/productos/productos').then((m) => m.Productos) },
      { path: 'vouchers', loadComponent: () => import('./pages/backoffice/vouchers/vouchers').then((m) => m.Vouchers) }
    ]
  },
];
