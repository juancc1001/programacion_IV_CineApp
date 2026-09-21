import { Component, inject, signal } from '@angular/core';
import { Sala, SalasService } from '../../../services/salas.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from '../../../ui/button/button';

@Component({
  imports: [CommonModule, FormsModule, Button],
  selector: 'app-salas',
  templateUrl: './salas.html',
})
export class Salas {
  protected readonly salasService = inject(SalasService);

  salas = signal<Sala[]>([]);
  newSala = {
    name: '',
    floor: 1,
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
    await this.salasService.createSala(this.newSala);
    this.newSala = { name: '', floor: 1 };
    await this.loadSalas();
  }
}
