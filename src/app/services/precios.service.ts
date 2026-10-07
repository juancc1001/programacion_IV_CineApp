import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import type { Tables, TablesInsert, TablesUpdate } from '../../types/supabase';

@Injectable({
  providedIn: 'root',
})
export class PreciosService {
  private readonly supabase = inject(SupabaseService).supabase;

  async getPrecios(): Promise<Precio[]> {
    const { data, error } = await this.supabase.from('prices').select('*');

    if (error) {
      console.error('Error loading precios:', error);
      return [];
    }

    return data;
  }

  async getPrecio(label: string): Promise<Precio | null> {
    const { data, error } = await this.supabase.from('prices').select('*').eq('label', label).single();

    if (error) {
      console.error('Error loading precio:', error);
      return null;
    }

    return data;
  }

  async createPrecio(precio: TablesInsert<'prices'>) {
    const { data, error } = await this.supabase.from('prices').insert(precio).select().single();

    if (error) {
      console.error('Error creating precio:', error);
      return null;
    }

    return data;
  }

  async updatePrecio(id: number, precio: TablesUpdate<'prices'>) {
    const { data, error } = await this.supabase.from('prices').update(precio).eq('id', id).select().single();

    if (error) {
      console.error('Error updating precio:', error);
      return null;
    }

    return data;
  }
}

export type Precio = Tables<'prices'>;
