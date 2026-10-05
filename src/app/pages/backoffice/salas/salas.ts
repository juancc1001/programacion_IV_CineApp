import { Component, inject, signal } from '@angular/core';
import { Sala, SalasService } from '../../../services/salas.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from '../../../ui/button/button';
import { Multiselect } from '../../../ui/multiselect/multiselect';
import { FormatoPelicula } from '../../../../types/formato-pelicula';

@Component({
  imports: [CommonModule, FormsModule, Button, Multiselect],
  selector: 'app-salas',
  templateUrl: './salas.html',
})
export class Salas {
  protected readonly salasService = inject(SalasService);
  formatosPelicula = signal(Object.values(FormatoPelicula));

  salas = signal<Sala[]>([]);
  newSala = {
    name: '',
    floor: 1,
    formats: [] as string[],
  };
  showForm = false;

  constructor() {
    this.loadSalas();
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  async loadSalas() {
    this.salas.set(await this.salasService.getSalas());
  }

  async addSala() {
    let formatted = this.newSala.formats.join(', ');

    await this.salasService.createSala({ ...this.newSala, formats: formatted });
    this.newSala = { name: '', floor: 1, formats: [] };
    await this.loadSalas();
  }
}
