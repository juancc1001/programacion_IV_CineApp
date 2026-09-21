import { Component, inject, signal } from '@angular/core';
import { Producto, ProductosService } from '../../../services/productos.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from '../../../ui/button/button';

@Component({
  imports: [CommonModule, FormsModule, Button],
  selector: 'app-productos',
  templateUrl: './productos.html',
})
export class Productos {
  protected readonly productosService = inject(ProductosService);

  productos = signal<Producto[]>([]);
  newProducto = {
    name: '',
    price: 0,
    stock: 0,
  };
  showForm = false;

  constructor() {
    this.loadProductos();
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  async loadProductos() {
    this.productos.set(await this.productosService.getProductos());
  }

  async addProducto() {
    await this.productosService.createProducto(this.newProducto);
    this.newProducto = { name: '', price: 0, stock: 0 };
    await this.loadProductos();
  }
}
