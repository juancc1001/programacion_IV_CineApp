import { Component, computed, inject, signal } from '@angular/core';
import { Funcion, FuncionesService } from '../../../services/funciones.service';
import { Pelicula, PeliculasService } from '../../../services/peliculas.service';
import { Sala, SalasService } from '../../../services/salas.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from '../../../ui/button/button';
import { FechaInput } from '../../../ui/fecha-input/fecha-input';

@Component({
  imports: [CommonModule, FormsModule, Button, FechaInput],
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
  salaFiltro = signal<number | null>(null);
  funcionesFiltradas = computed(() =>
    this.funciones()
      .filter((funcion) => this.salaFiltro() === null || funcion.room_id === this.salaFiltro())
      .sort((a, b) => (b.to ?? '').localeCompare(a.to ?? '')),
  );
  newFuncion = {
    movie_id: 0,
    room_id: 0,
    start_time: '',
    from: '',
    to: '',
    format: '',
    language: '',
  };
  showForm = false;
  error: string | null = null;

  constructor() {
    this.loadFunciones();
    this.loadPeliculas();
    this.loadSalas();
  }

  toggleSalaFiltro(salaId: number) {
    this.salaFiltro.set(this.salaFiltro() === salaId ? null : salaId);
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

  // los formatos e idiomas dependen de la pelicula elegida
  formatosDisponibles(): string[] {
    return separarValores(this.peliculaSeleccionada()?.available_formats);
  }

  idiomasDisponibles(): string[] {
    return separarValores(this.peliculaSeleccionada()?.languages);
  }

  salasDisponibles(): Sala[] {
    return this.salas().filter((sala) =>
      separarValores(sala.formats).includes(this.newFuncion.format),
    );
  }

  onPeliculaChange() {
    this.newFuncion.format = '';
    this.newFuncion.language = '';
    this.newFuncion.room_id = 0;
  }

  onFormatoChange() {
    this.newFuncion.room_id = 0;
  }

  nombrePelicula(funcion: Funcion): string {
    return this.peliculas().find((pelicula) => pelicula.id === funcion.movie_id)?.title ?? '';
  }

  horaFin(funcion: Funcion): string {
    const duracion = this.peliculas().find((pelicula) => pelicula.id === funcion.movie_id)?.duration ?? 0;
    const [horas, minutos] = (funcion.start_time ?? '0:0').split(':');
    const fin = (Number(horas) * 60 + Number(minutos) + duracion) % (24 * 60);

    return `${String(Math.floor(fin / 60)).padStart(2, '0')}:${String(fin % 60).padStart(2, '0')}`;
  }

  private peliculaSeleccionada(): Pelicula | undefined {
    return this.peliculas().find((pelicula) => pelicula.id === this.newFuncion.movie_id);
  }

  async addFuncion() {
    this.error = await this.funcionesService.validateFuncion(this.newFuncion);

    if (this.error) {
      return;
    }

    await this.funcionesService.createFuncion(this.newFuncion);
    this.newFuncion = {
      movie_id: 0,
      room_id: 0,
      start_time: '',
      from: '',
      to: '',
      format: '',
      language: '',
    };
    await this.loadFunciones();
  }
}

function separarValores(valores: string | null | undefined): string[] {
  return (valores ?? '')
    .split(',')
    .map((valor) => valor.trim())
    .filter((valor) => valor !== '');
}
