import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import type { Tables, TablesInsert, TablesUpdate } from '../../types/supabase';

@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  private readonly supabase = inject(SupabaseService).supabase;

  async getProductos(): Promise<Producto[]> {
    const { data, error } = await this.supabase.from('products').select('*');

    if (error) {
      console.error('Error loading productos:', error);
      return [];
    }

    return data;
  }

  async getProducto(id: number): Promise<Producto | null> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error loading producto:', error);
      return null;
    }

    return data;
  }

  async createProducto(producto: TablesInsert<'products'>) {
    const { data, error } = await this.supabase
      .from('products')
      .insert(producto)
      .select()
      .single();

    if (error) {
      console.error('Error creating producto:', error);
      return null;
    }

    return data;
  }

  async updateProducto(id: number, producto: TablesUpdate<'products'>) {
    const { data, error } = await this.supabase
      .from('products')
      .update(producto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating producto:', error);
      return null;
    }

    return data;
  }

  async deleteProducto(id: number) {
    const { error } = await this.supabase.from('products').delete().eq('id', id);

    if (error) {
      console.error('Error deleting producto:', error);
      return false;
    }

    return true;
  }
}

export type Producto = Tables<'products'>;
