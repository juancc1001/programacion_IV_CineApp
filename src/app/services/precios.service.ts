import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class PreciosService {
  private readonly supabase = inject(SupabaseService).supabase;

  async getPrecio(label: string): Promise<number> {
    const { data, error } = await this.supabase.from('prices').select('price').eq('label', label).single();

    if (error) {
      console.error('Error loading precio:', error);
      return 0;
    }

    return data.price;
  }
}
