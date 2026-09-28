import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { Pelicula } from './peliculas.service';

const CARRITO_KEY = 'carrito';

export interface ItemCarrito {
  pelicula: Pelicula;
  funcionId: number;
  horario: string;
  formato: string;
  butacas: string[];
}

export interface CompraSeleccionada {
  pelicula: Pelicula;
  fecha: string;
}

@Injectable({
  providedIn: 'root',
})
export class CarritoService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly items = signal<ItemCarrito[]>(this.leer());
  readonly compraSeleccionada = signal<CompraSeleccionada | null>(null);

  agregar(item: ItemCarrito): void {
    this.items.update((items) => [...items, item]);
    this.guardar();
  }

  eliminar(index: number): void {
    this.items.update((items) => items.filter((_, i) => i !== index));
    this.guardar();
  }

  vaciar(): void {
    this.items.set([]);
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
