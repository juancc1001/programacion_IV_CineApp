import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import type { Tables } from '../../types/supabase';

@Injectable({
  providedIn: 'root',
})
export class ReviewsService {
  private readonly supabase = inject(SupabaseService).supabase;

  async getReviews(movieId: number): Promise<ReviewConUsuario[]> {
    const { data, error } = await this.supabase
      .from('reviews')
      .select('*')
      .eq('movie_id', movieId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading reviews:', error);
      return [];
    }

    // nombre de quien hizo cada review
    const { data: usuarios } = await this.supabase
      .from('user_information')
      .select('user_id, name, surname')
      .in('user_id', data.map((review) => review.user_id));

    return data.map((review) => {
      const usuario = usuarios?.find((item) => item.user_id === review.user_id);
      const nombre = `${usuario?.name ?? 'Usuario'} ${usuario?.surname ?? ''}`.trim();
      return { ...review, nombre };
    });
  }

  async getPromedios(): Promise<Map<number, number>> {
    const { data, error } = await this.supabase.from('reviews').select('movie_id, score');

    if (error) {
      console.error('Error loading promedios:', error);
      return new Map();
    }

    const sumas = new Map<number, { total: number; cantidad: number }>();

    for (const review of data) {
      const suma = sumas.get(review.movie_id) ?? { total: 0, cantidad: 0 };
      suma.total += review.score;
      suma.cantidad++;
      sumas.set(review.movie_id, suma);
    }

    const promedios = new Map<number, number>();
    for (const [movieId, suma] of sumas) {
      promedios.set(movieId, suma.total / suma.cantidad);
    }

    return promedios;
  }

  async getScoresUsuario(userId: string): Promise<Map<number, number>> {
    const { data, error } = await this.supabase
      .from('reviews')
      .select('movie_id, score')
      .eq('user_id', userId);

    if (error) {
      console.error('Error loading scores:', error);
      return new Map();
    }

    return new Map(data.map((review) => [review.movie_id, review.score]));
  }

  async createReview(movieId: number, score: number, comment: string) {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();

    const { data, error } = await this.supabase
      .from('reviews')
      .insert({ movie_id: movieId, score, comment, user_id: session?.user?.id })
      .select()
      .single();

    if (error) {
      console.error('Error creating review:', error);
      return null;
    }

    return data;
  }
}

export type Review = Tables<'reviews'>;

export interface ReviewConUsuario extends Review {
  nombre: string;
}
