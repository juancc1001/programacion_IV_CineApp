import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import type { Tables, TablesInsert, TablesUpdate } from '../../types/supabase';

@Injectable({
  providedIn: 'root',
})
export class PeliculasService {
  private readonly supabase = inject(SupabaseService).supabase;

  async getPeliculas(): Promise<Pelicula[]> {
    const { data, error } = await this.supabase.from('movies').select('*');

    if (error) {
      console.error('Error loading peliculas:', error);
      return [];
    }

    return data;
  }

  async getPeliculasDestacadas(cantidad: number): Promise<Pelicula[]> {
    const { data, error } = await this.supabase
      .from('movies')
      .select('*')
      .eq('highlighted', true)
      .limit(cantidad);

    if (error) {
      console.error('Error loading peliculas:', error);
      return [];
    }

    return data;
  }

  async getPelicula(id: number): Promise<Pelicula | null> {
    const { data, error } = await this.supabase.from('movies').select('*').eq('id', id).single();

    if (error) {
      console.error('Error loading pelicula:', error);
      return null;
    }

    return data;
  }

  async createPelicula(pelicula: TablesInsert<'movies'>) {
    const { data, error } = await this.supabase.from('movies').insert(pelicula).select().single();

    if (error) {
      console.error('Error creating pelicula:', error);
      return null;
    }

    return data;
  }

  async updatePelicula(id: number, pelicula: TablesUpdate<'movies'>) {
    const { data, error } = await this.supabase
      .from('movies')
      .update(pelicula)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating pelicula:', error);
      return null;
    }

    return data;
  }

  async deletePelicula(id: number) {
    const { error } = await this.supabase.from('movies').delete().eq('id', id);

    if (error) {
      console.error('Error deleting pelicula:', error);
      return false;
    }

    return true;
  }
}

export type Pelicula = Tables<'movies'>;
