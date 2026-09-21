import { Component, inject, signal } from '@angular/core';
import { Funcion, FuncionesService } from '../../../services/funciones.service';
import { Pelicula, PeliculasService } from '../../../services/peliculas.service';
import { Sala, SalasService } from '../../../services/salas.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from '../../../ui/button/button';

@Component({
  imports: [CommonModule, FormsModule, Button],
  selector: 'app-funciones',
  templateUrl: './funciones.html',
})
export class Funciones {
  protected readonly funcionesService = inject(FuncionesService);
  protected readonly peliculasService = inject(PeliculasService);
  protected readonly salasService = inject(SalasService);

  funciones = signal<Funcion[]>([]);
  peliculas = signal<Pelicula[]>([]);
  salas = signal<Sala[]>([]);
  newFuncion = {
    movie_id: 0,
    room_id: 0,
    start_time: '',
    from: '',
    to: '',
  };
  showForm = false;

  constructor() {
    this.loadFunciones();
    this.loadPeliculas();
    this.loadSalas();
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  async loadFunciones() {
    this.funciones.set(await this.funcionesService.getFunciones());
  }

  async loadPeliculas() {
    this.peliculas.set(await this.peliculasService.getPeliculas());
  }

  async loadSalas() {
    this.salas.set(await this.salasService.getSalas());
  }

  async addFuncion() {
    await this.funcionesService.createFuncion(this.newFuncion);
    this.newFuncion = { movie_id: 0, room_id: 0, start_time: '', from: '', to: '' };
    await this.loadFunciones();
  }
}
