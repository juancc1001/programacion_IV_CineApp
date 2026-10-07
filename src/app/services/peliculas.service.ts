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

  // cuenta las butacas reservadas por pelicula
  async getPeliculasMasVistas(cantidad: number): Promise<Pelicula[]> {
    const { data, error } = await this.supabase
      .from('booking_seats')
      .select('bookings(showtimes(movies(*)))');

    if (error) {
      console.error('Error loading peliculas mas vistas:', error);
      return [];
    }

    const conteo = new Map<number, { pelicula: Pelicula; vistas: number }>();

    for (const butaca of data) {
      const pelicula = butaca.bookings?.showtimes?.movies;
      if (!pelicula) {
        continue;
      }

      const item = conteo.get(pelicula.id) ?? { pelicula, vistas: 0 };
      item.vistas++;
      conteo.set(pelicula.id, item);
    }

    return [...conteo.values()]
      .sort((a, b) => b.vistas - a.vistas)
      .slice(0, cantidad)
      .map((item) => item.pelicula);
  }

  // el estreno es el primer "from" de las funciones de cada pelicula
  async getProximamente(hoy: string): Promise<PeliculaProxima[]> {
    const { data, error } = await this.supabase.from('showtimes').select('from, movies(*)');

    if (error) {
      console.error('Error loading proximamente:', error);
      return [];
    }

    const estrenos = new Map<number, PeliculaProxima>();

    for (const funcion of data) {
      if (!funcion.movies || !funcion.from) {
        continue;
      }

      const actual = estrenos.get(funcion.movies.id);
      if (!actual || funcion.from < actual.estreno) {
        estrenos.set(funcion.movies.id, { pelicula: funcion.movies, estreno: funcion.from });
      }
    }

    return [...estrenos.values()]
      .filter((item) => item.estreno > hoy)
      .sort((a, b) => a.estreno.localeCompare(b.estreno));
  }

  async getPelicula(id: number): Promise<Pelicula | null> {
    const { data, error } = await this.supabase.from('movies').select('*').eq('id', id).single();

    if (error) {
      console.error('Error loading pelicula:', error);
      return null;
    }

    return data;
  }

  async uploadImage(file: File): Promise<string | null> {
    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await this.supabase.storage
      .from('imagenes')
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    const { data } = this.supabase.storage
      .from('imagenes')
      .getPublicUrl(fileName);

    return data.publicUrl;
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

export interface PeliculaProxima {
  pelicula: Pelicula;
  estreno: string;
}
