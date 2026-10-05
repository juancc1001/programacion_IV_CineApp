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
  selectedFile: File | null = null;
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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  async addProducto() {
    let imageUrl: string | null = null;
    if (this.selectedFile) {
      imageUrl = await this.productosService.uploadImage(this.selectedFile);
    }

    await this.productosService.createProducto({ ...this.newProducto, image_url: imageUrl });
    this.newProducto = { name: '', price: 0, stock: 0 };
    this.selectedFile = null;
    await this.loadProductos();
  }
}
