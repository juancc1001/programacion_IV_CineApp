import { Component, computed, inject, signal } from '@angular/core';
import { Producto, ProductosService } from '../../services/productos.service';
import { CarritoService } from '../../services/carrito.service';
import { Button } from '../../ui/button/button';
import { ModalService } from '../../services/modal.service';
import { CandyModal } from '../candy-modal/candy-modal';
import { RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  imports: [Button, RouterLink, NgTemplateOutlet],
  selector: 'app-candy',
  styleUrl: './candy.scss',
  templateUrl: './candy.html',
})
export class Candy {
  private readonly productosService = inject(ProductosService);
  private readonly carritoService = inject(CarritoService);
  private readonly modalService = inject(ModalService);

  productos = signal<Producto[]>([]);
  combos = computed(() => this.productos().filter((producto) => producto.is_combo));
  sueltos = computed(() => this.productos().filter((producto) => !producto.is_combo));
  cantidades = signal<Record<number, number>>({});

  constructor() {
    this.loadProductos();
  }

  async loadProductos() {
    this.productos.set(await this.productosService.getProductos());
  }

  cantidad(producto: Producto) {
    return this.cantidades()[producto.id] ?? 0;
  }

  max(producto: Producto) {
    return producto.stock ?? Infinity;
  }

  sumar(producto: Producto) {
    this.setCantidad(producto, Math.min(this.cantidad(producto) + 1, this.max(producto)));
  }

  restar(producto: Producto) {
    this.setCantidad(producto, Math.max(this.cantidad(producto) - 1, 0));
  }

  comprar(producto: Producto) {
    this.carritoService.agregarProducto(producto, this.cantidad(producto));
    this.setCantidad(producto, 0);
    this.modalService.open(CandyModal);
  }

  private setCantidad(producto: Producto, cantidad: number) {
    this.cantidades.update((cantidades) => ({ ...cantidades, [producto.id]: cantidad }));
  }
}
