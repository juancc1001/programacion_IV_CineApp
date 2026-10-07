import { Component, inject, signal } from '@angular/core';
import { Producto, ProductosService } from '../../../services/productos.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from '../../../ui/button/button';
import { Multiselect } from '../../../ui/multiselect/multiselect';
import { LogService } from '../../../services/log.service';

@Component({
  imports: [CommonModule, FormsModule, Button, Multiselect],
  selector: 'app-productos',
  templateUrl: './productos.html',
})
export class Productos {
  protected readonly productosService = inject(ProductosService);
  private readonly logService = inject(LogService);

  productos = signal<Producto[]>([]);
  newProducto = this.emptyProducto();
  selectedFile: File | null = null;
  editingId: number | null = null;
  showForm = false;

  constructor() {
    this.loadProductos();
  }

  toggleForm() {
    if (this.editingId !== null) {
      this.newProducto = this.emptyProducto();
      this.editingId = null;
    }
    this.showForm = !this.showForm;
  }

  async loadProductos() {
    this.productos.set(await this.productosService.getProductos());
  }

  // un combo se arma con productos sueltos
  opcionesCombo() {
    return this.productos()
      .filter((producto) => !producto.is_combo && producto.id !== this.editingId)
      .map((producto) => producto.name);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  editProducto(producto: Producto) {
    if (this.editingId !== null) {
      this.newProducto = this.emptyProducto();
      this.editingId = null;
      this.showForm = false;
      return;
    }
    this.editingId = producto.id;
    this.newProducto = {
      name: producto.name,
      price: producto.price,
      point_price: producto.point_price,
      stock: producto.stock ?? 0,
      is_combo: producto.is_combo,
      combo_items: producto.combo_items?.split(', ') ?? [],
    };
    this.showForm = true;
  }

  async saveProducto() {
    let imageUrl: string | null = null;
    if (this.selectedFile) {
      imageUrl = await this.productosService.uploadImage(this.selectedFile);
    }

    const producto = {
      ...this.newProducto,
      combo_items: this.newProducto.is_combo ? this.newProducto.combo_items.join(', ') : null,
    };

    if (this.editingId === null) {
      await this.productosService.createProducto({ ...producto, image_url: imageUrl });
      await this.logService.registrar(`creó el producto '${producto.name}'`);
    } else {
      // si no se elige imagen nueva se mantiene la actual
      await this.productosService.updateProducto(
        this.editingId,
        imageUrl ? { ...producto, image_url: imageUrl } : producto,
      );
      await this.logService.registrar(`editó el producto '${producto.name}': ${JSON.stringify(producto)}`);
    }

    this.newProducto = this.emptyProducto();
    this.selectedFile = null;
    this.editingId = null;
    await this.loadProductos();
  }

  private emptyProducto() {
    return { name: '', price: 0, point_price: 0, stock: 0, is_combo: false, combo_items: [] as string[] };
  }
}
