import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import type { Tables, TablesInsert, TablesUpdate } from '../../types/supabase';
import { cumpleEdad } from '../utils/edad';

@Injectable({
  providedIn: 'root',
})
export class VoucherService {
  private readonly supabase = inject(SupabaseService).supabase;

  async getVouchers(): Promise<Voucher[]> {
    const { data, error } = await this.supabase.from('voucher').select('*');

    if (error) {
      console.error('Error loading vouchers:', error);
      return [];
    }

    return data;
  }

  async getVoucher(id: number): Promise<Voucher | null> {
    const { data, error } = await this.supabase
      .from('voucher')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error loading voucher:', error);
      return null;
    }

    return data;
  }

  async getVoucherByCode(code: string, userId?: string, birthdate?: string): Promise<Voucher | null> {
    if (!userId) {
      const { data, error } = await this.supabase
        .from('voucher')
        .select('*')
        .eq('code', code)
        .is('user_id', null)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading voucher:', error);
        return null;
      }

      return data?.min_age ? null : data;
    }

    const { data, error } = await this.supabase
      .from('voucher')
      .select('*')
      .eq('code', code)
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order('user_id', { nullsFirst: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error loading voucher:', error);
      return null;
    }

    if (!data || (await this.hasUsedVoucher(data.id, userId))) return null;
    if (data.min_age && (!birthdate || !cumpleEdad(birthdate, data.min_age))) return null;

    return data;
  }

  async getVoucherPorEdad(userId: string, birthdate: string): Promise<Voucher | null> {
    const { data, error } = await this.supabase
      .from('voucher')
      .select('*')
      .not('min_age', 'is', null)
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order('discount_percentage', { ascending: false });

    if (error) {
      console.error('Error loading vouchers:', error);
      return null;
    }

    for (const voucher of data) {
      if (cumpleEdad(birthdate, voucher.min_age!) && !(await this.hasUsedVoucher(voucher.id, userId))) {
        return voucher;
      }
    }

    return null;
  }

  async hasUsedVoucher(voucherId: number, userId: string): Promise<boolean> {
    const { count, error } = await this.supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('voucher_id', voucherId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error checking voucher usage:', error);
      return true;
    }

    return (count ?? 0) > 0;
  }

  async createVoucher(voucher: TablesInsert<'voucher'>) {
    const { data, error } = await this.supabase
      .from('voucher')
      .insert(voucher)
      .select()
      .single();

    if (error) {
      console.error('Error creating voucher:', error);
      return null;
    }

    return data;
  }

  async updateVoucher(id: number, voucher: TablesUpdate<'voucher'>) {
    const { data, error } = await this.supabase
      .from('voucher')
      .update(voucher)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating voucher:', error);
      return null;
    }

    return data;
  }

  async deleteVoucher(id: number) {
    const { error } = await this.supabase.from('voucher').delete().eq('id', id);

    if (error) {
      console.error('Error deleting voucher:', error);
      return false;
    }

    return true;
  }
}

export type Voucher = Tables<'voucher'>;
