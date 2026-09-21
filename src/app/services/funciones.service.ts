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

    if (error) {
      console.error('Error deleting funcion:', error);
      return false;
    }

    return true;
  }
}

export type Funcion = Tables<'showtimes'>;
