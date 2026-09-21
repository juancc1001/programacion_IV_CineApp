import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import type { Tables, TablesInsert, TablesUpdate } from '../../types/supabase';

@Injectable({
  providedIn: 'root',
})
export class SalasService {
  private readonly supabase = inject(SupabaseService).supabase;

  async getSalas(): Promise<Sala[]> {
    const { data, error } = await this.supabase.from('rooms').select('*');

    if (error) {
      console.error('Error loading salas:', error);
      return [];
    }

    return data;
  }

  async getSala(id: number): Promise<Sala | null> {
    const { data, error } = await this.supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error loading sala:', error);
      return null;
    }

    return data;
  }

  async createSala(sala: TablesInsert<'rooms'>) {
    const { data, error } = await this.supabase
      .from('rooms')
      .insert(sala)
      .select()
      .single();

    if (error) {
      console.error('Error creating sala:', error);
      return null;
    }

    return data;
  }

  async updateSala(id: number, sala: TablesUpdate<'rooms'>) {
    const { data, error } = await this.supabase
      .from('rooms')
      .update(sala)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating sala:', error);
      return null;
    }

    return data;
  }

  async deleteSala(id: number) {
    const { error } = await this.supabase.from('rooms').delete().eq('id', id);

    if (error) {
      console.error('Error deleting sala:', error);
      return false;
    }

    return true;
  }
}

export type Sala = Tables<'rooms'>;
