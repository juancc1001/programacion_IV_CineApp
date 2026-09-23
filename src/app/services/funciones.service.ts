import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import type { Tables, TablesInsert, TablesUpdate } from '../../types/supabase';

@Injectable({
  providedIn: 'root',
})
export class FuncionesService {
  private readonly supabase = inject(SupabaseService).supabase;

  async getFunciones(): Promise<Funcion[]> {
    const { data, error } = await this.supabase.from('showtimes').select('*');

    if (error) {
      console.error('Error loading funciones:', error);
      return [];
    }

    return data;
  }

  async getFuncion(id: number): Promise<Funcion | null> {
    const { data, error } = await this.supabase
      .from('showtimes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error loading funcion:', error);
      return null;
    }

    return data;
  }

  async getFuncionesPorFecha(fecha: string): Promise<FuncionConPelicula[]> {
    const { data, error } = await this.supabase
      .from('showtimes')
      .select('*, movies(*)')
      .lte('from', fecha)
      .gte('to', fecha)
      .order('start_time');

    if (error) {
      console.error('Error loading funciones:', error);
      return [];
    }

    return data;
  }

  async getButacasOcupadas(funcionId: number): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('booking_seats')
      .select('seat, bookings!inner(showtime_id)')
      .eq('bookings.showtime_id', funcionId);

    if (error) {
      console.error('Error loading butacas ocupadas:', error);
      return [];
    }

    return data.map((butaca) => butaca.seat);
  }

  //valida que no haya funcion hasta media hora antes de que comience la que se quiera ingresar
  async validateFuncion(funcion: TablesInsert<'showtimes'>): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('showtimes')
      .select('*, movies(duration)')
      .eq('room_id', funcion.room_id)
      .lte('from', funcion.to ?? '9999-12-31')
      .gte('to', funcion.from ?? '0001-01-01');

    if (error) throw new Error(`Error: ${error.message}`);

    //duracion de la pelicula que se quiere ingresar
    const { data: movie } = await this.supabase
      .from('movies')
      .select('duration')
      .eq('id', funcion.movie_id ?? 0)
      .single();

    const start = toMinutes(funcion.start_time);
    const end = start + (movie?.duration ?? 0);

    const conflicto = data.find((otra) => {
      if (otra.id === funcion.id) {
        return false;
      }

      const otraStart = toMinutes(otra.start_time);
      const otraEnd = otraStart + (otra.movies?.duration ?? 0);

      return start < otraEnd + MINUTOS_ENTRE_FUNCIONES && otraStart < end + MINUTOS_ENTRE_FUNCIONES;
    });

    if (conflicto) {
      return `La sala ya tiene la funcion ${conflicto.id} a las ${conflicto.start_time}; tienen que quedar ${MINUTOS_ENTRE_FUNCIONES} minutos entre una y otra.`;
    }

    return null;
  }

  async createFuncion(funcion: TablesInsert<'showtimes'>) {
    const { data, error } = await this.supabase
      .from('showtimes')
      .insert(funcion)
      .select()
      .single();

    if (error) {
      console.error('Error creating funcion:', error);
      return null;
    }

    return data;
  }

  async updateFuncion(id: number, funcion: TablesUpdate<'showtimes'>) {
    const { data, error } = await this.supabase
      .from('showtimes')
      .update(funcion)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating funcion:', error);
      return null;
    }

    return data;
  }

  async deleteFuncion(id: number) {
    const { error } = await this.supabase.from('showtimes').delete().eq('id', id);
    if (error) throw new Error(`Error: ${error.message}`);

    return true;
  }
}

export type Funcion = Tables<'showtimes'>;
export type FuncionConPelicula = Funcion & { movies: Tables<'movies'> | null };

const MINUTOS_ENTRE_FUNCIONES = 30;
function toMinutes(time: string | null | undefined): number {
  const [hours, minutes] = (time ?? '0:0').split(':');

  return Number(hours) * 60 + Number(minutes);
}
