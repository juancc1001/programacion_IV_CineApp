import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { VoucherService } from './voucher.service';
import { Roles } from '../../types/roles';
import type { Tables, TablesInsert } from '../../types/supabase';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly supabase = inject(SupabaseService).supabase;
  private readonly voucherService = inject(VoucherService);
  readonly userInformation = signal<Tables<'user_information'> | null>(null);
  private cachedUserInformation?: Promise<Tables<'user_information'> | null>;

  constructor() {
    this.supabase.auth.onAuthStateChange(() => { // al logearse guarda la información de usuario de user_information
      this.cachedUserInformation = this.fetchUserInformation();
    });
  }

  async signUp(
    email: string,
    password: string,
    //clase de supabase para insertar en la tabla user_information
    information: TablesInsert<'user_information'>,
  ) {
    const { user_id, role, ...cleanInformation } = information;

    const { data, error } = await this.supabase.auth.signUp({ email, password });

    if (error || !data.user) {
      console.error('Error signing up:', error);
      return { data, error };
    }

    const { error: informationError } = await this.supabase
      .from('user_information')
      .insert({ ...cleanInformation, user_id: data.user.id, role: Roles.Client });

    if (informationError) {
      console.error('Error saving user information:', informationError);
    }

    this.cachedUserInformation = this.fetchUserInformation();
    await this.cachedUserInformation;

    return { data, error: informationError };
  }

  signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  signOut() {
    return this.supabase.auth.signOut();
  }

  getUserInformation() {
    this.cachedUserInformation ??= this.fetchUserInformation();

    return this.cachedUserInformation;
  }

  private async fetchUserInformation() {
    const {
      data: { session },
      error: sessionError,
    } = await this.supabase.auth.getSession();

    if (sessionError || !session?.user) {
      console.error('No active Supabase session:', sessionError);
      this.userInformation.set(null);
      return null;
    }

    const { data, error } = await this.supabase
      .from('user_information')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      console.error('Error loading user information:', error);
      this.userInformation.set(null);
      return null;
    }

    this.userInformation.set(data);

    return data;
  }

  async getUsers(): Promise<Tables<'user_information'>[]> {
    const { data, error } = await this.supabase.from('user_information').select('*');

    if (error) {
      console.error('Error loading users:', error);
      return [];
    }

    return data;
  }

  async sumarPuntos(cantidad: number) {
    const { error } = await this.supabase.rpc('sumar_puntos', { cantidad });

    if (error) {
      console.error('Error adding points:', error);
      return;
    }

    this.cachedUserInformation = this.fetchUserInformation();
  }

  async isAdmin() {
    const information = await this.getUserInformation();

    return information?.role === Roles.Admin;
  }
}
