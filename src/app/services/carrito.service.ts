import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { Pelicula } from './peliculas.service';
import type { Producto } from './productos.service';

const CARRITO_KEY = 'carrito';

export interface ItemEntrada {
  tipo: 'entrada';
  pelicula: Pelicula;
  funcionId: number;
  horario: string;
  formato: string;
  butacas: string[];
}

export interface ItemProducto {
  tipo: 'producto';
  producto: Producto;
  cantidad: number;
}

export type ItemCarrito = ItemEntrada | ItemProducto;

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
  readonly entrada = computed(() =>
    this.items().find((item): item is ItemEntrada => item.tipo === 'entrada'),
  );
  readonly compraSeleccionada = signal<CompraSeleccionada | null>(null);

  // el carrito admite una sola funcion a la vez
  agregarEntrada(item: Omit<ItemEntrada, 'tipo'>): boolean {
    if (this.entrada()) {
      return false;
    }

    this.items.update((items) => [...items, { tipo: 'entrada', ...item }]);
    this.guardar();
    return true;
  }

  agregarProducto(producto: Producto, cantidad: number): void {
    const max = producto.stock ?? Infinity;
    const existente = this.items().find(
      (item): item is ItemProducto => item.tipo === 'producto' && item.producto.id === producto.id,
    );

    if (existente) {
      this.items.update((items) =>
        items.map((item) =>
          item === existente ? { ...existente, cantidad: existente.cantidad + cantidad } : item,
        ),
      );
    } else {
      this.items.update((items) => [
        ...items,
        { tipo: 'producto', producto, cantidad: Math.min(cantidad, max) },
      ]);
    }

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
