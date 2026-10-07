import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import type { Tables } from '../../types/supabase';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  private readonly supabase = inject(SupabaseService).supabase;
  private readonly authService = inject(AuthService);

  async getLogs(): Promise<Log[]> {
    const { data, error } = await this.supabase
      .from('Log')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading logs:', error);
      return [];
    }

    return data;
  }

  async registrar(accion: string) {
    const usuario = this.authService.userInformation();
    const nombre = `${usuario?.name ?? 'Usuario'} ${usuario?.surname ?? ''}`.trim();

    const { error } = await this.supabase.from('Log').insert({ log: `${nombre} ${accion}` });

    if (error) {
      console.error('Error creating log:', error);
    }
  }
}

export type Log = Tables<'Log'>;
