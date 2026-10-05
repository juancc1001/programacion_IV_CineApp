import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { Pelicula as PeliculaModel, PeliculasService } from '../../services/peliculas.service';
import { ReviewConUsuario, ReviewsService } from '../../services/reviews.service';
import { AuthService } from '../../services/auth.service';
import { Button } from '../../ui/button/button';

@Component({
  imports: [Button, FormsModule, DecimalPipe],
  selector: 'app-pelicula',
  styleUrl: './pelicula.scss',
  templateUrl: './pelicula.html',
})
export class Pelicula {
  private readonly peliculasService = inject(PeliculasService);
  private readonly reviewsService = inject(ReviewsService);
  private readonly route = inject(ActivatedRoute);
  private readonly movieId = Number(this.route.snapshot.paramMap.get('id'));

  readonly userInformation = inject(AuthService).userInformation;
  readonly estrellas = [1, 2, 3, 4, 5];

  pelicula = signal<PeliculaModel | null>(null);
  reviews = signal<ReviewConUsuario[]>([]);
  score = signal(0);
  comment = '';

  constructor() {
    this.loadPelicula();
    this.loadReviews();
  }

  async loadPelicula() {
    this.pelicula.set(await this.peliculasService.getPelicula(this.movieId));
  }

  async loadReviews() {
    this.reviews.set(await this.reviewsService.getReviews(this.movieId));
  }

  get promedio(): number {
    const reviews = this.reviews();
    return reviews.reduce((total, review) => total + review.score, 0) / reviews.length;
  }

  async enviarReview() {
    const review = await this.reviewsService.createReview(this.movieId, this.score(), this.comment);

    if (review) {
      this.score.set(0);
      this.comment = '';
      this.loadReviews();
    }
  }
}
