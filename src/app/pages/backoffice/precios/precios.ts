import { Component, inject, signal } from '@angular/core';
import { Precio, PreciosService } from '../../../services/precios.service';
import { FormsModule } from '@angular/forms';
import { Button } from '../../../ui/button/button';
import { LogService } from '../../../services/log.service';

@Component({
  imports: [FormsModule, Button],
  selector: 'app-precios',
  templateUrl: './precios.html',
})
export class Precios {
  protected readonly preciosService = inject(PreciosService);
  private readonly logService = inject(LogService);

  precios = signal<Precio[]>([]);
  newPrecio = this.emptyPrecio();
  editingId: number | null = null;
  showForm = false;

  constructor() {
    this.loadPrecios();
  }

  toggleForm() {
    if (this.editingId !== null) {
      this.newPrecio = this.emptyPrecio();
      this.editingId = null;
    }
    this.showForm = !this.showForm;
  }

  async loadPrecios() {
    this.precios.set(await this.preciosService.getPrecios());
  }

  editPrecio(precio: Precio) {
    if (this.editingId !== null) {
      this.newPrecio = this.emptyPrecio();
      this.editingId = null;
      this.showForm = false;
      return;
    }
    this.editingId = precio.id;
    this.newPrecio = { label: precio.label, price: precio.price, points: precio.points };
    this.showForm = true;
  }

  async savePrecio() {
    if (this.editingId === null) {
      await this.preciosService.createPrecio(this.newPrecio);
      await this.logService.registrar(`creó el precio '${this.newPrecio.label}'`);
    } else {
      await this.preciosService.updatePrecio(this.editingId, this.newPrecio);
      await this.logService.registrar(`editó el precio '${this.newPrecio.label}': ${JSON.stringify(this.newPrecio)}`);
    }

    this.newPrecio = this.emptyPrecio();
    this.editingId = null;
    await this.loadPrecios();
  }

  private emptyPrecio() {
    return { label: '', price: 0, points: 0 };
  }
}
