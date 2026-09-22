import { Component, inject, signal } from '@angular/core';
import { Pelicula, PeliculasService } from '../../../services/peliculas.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from '../../../ui/button/button';
import { Multiselect } from '../../../ui/multiselect/multiselect';
import { GeneroPelicula } from '../../../../types/genero-pelicula';
import { FormatoPelicula } from '../../../../types/formato-pelicula';

@Component({
  imports: [CommonModule, FormsModule, Button, Multiselect],
  selector: 'app-peliculas',
  templateUrl: './peliculas.html',
})
export class Peliculas {
  protected readonly peliculasService = inject(PeliculasService);
  generosPelicula = signal(Object.values(GeneroPelicula));
  formatosPelicula = signal(Object.values(FormatoPelicula));

  peliculas = signal<Pelicula[]>([]);
  newPelicula = {
    title: '',
    duration: 0,
    genres: [] as string[],
    languages: '',
    available_formats: [] as string[],
    image_url: '',
    sinopsis: '',
    highlighted: false,
  };
  showForm = false;

  constructor() {
    this.loadPeliculas();
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  async loadPeliculas() {
    this.peliculas.set(await this.peliculasService.getPeliculas());
  }

  async addPelicula() {
    await this.peliculasService.createPelicula({
      ...this.newPelicula,
      genres: this.newPelicula.genres.join(', '),
      available_formats: this.newPelicula.available_formats.join(', '),
    });
    
    this.newPelicula = {
      title: '',
      duration: 0,
      genres: [],
      languages: '',
      available_formats: [],
      image_url: '',
      sinopsis: '',
      highlighted: false,
    };
    await this.loadPeliculas();
  }
}
