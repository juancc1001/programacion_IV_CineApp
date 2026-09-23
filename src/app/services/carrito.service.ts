import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { Pelicula } from './peliculas.service';

const CARRITO_KEY = 'carrito';

export interface ItemCarrito {
  pelicula: Pelicula;
  cantidad: number;
}

export interface CompraSeleccionada {
  pelicula: Pelicula;
  fecha: string;
}

@Injectable({
  providedIn: 'root',
})
export class CarritoService {
  // pareciera que SSR no soporta localstorage

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly items = signal<ItemCarrito[]>(this.leer());
  readonly compraSeleccionada = signal<CompraSeleccionada | null>(null);

  agregar(pelicula: Pelicula): void {
    this.items.update((items) => {
      const existente = items.find((item) => item.pelicula.id === pelicula.id);

      if (existente) {
        return items.map((item) =>
          item === existente ? { ...item, cantidad: item.cantidad + 1 } : item,
        );
      }

      return [...items, { pelicula, cantidad: 1 }];
    });
    this.guardar();
  }

  private leer(): ItemCarrito[] {
    if (!this.isBrowser) {
      return [];
    }

    return JSON.parse(localStorage.getItem(CARRITO_KEY) ?? '[]');
  }

  private guardar(): void {
    if (this.isBrowser) {
      localStorage.setItem(CARRITO_KEY, JSON.stringify(this.items()));
    }
  }
}
