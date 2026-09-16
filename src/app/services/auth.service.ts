import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Roles } from '../../types/roles';
import type { Tables } from '../../types/supabase';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly supabase = inject(SupabaseService).supabase;
  readonly userInformation = signal<Tables<'user_information'> | null>(null);
  private cachedUserInformation?: Promise<Tables<'user_information'> | null>;

  constructor() {
    this.supabase.auth.onAuthStateChange(() => {
      this.cachedUserInformation = undefined;
      // supabase-js puede bloquearse si se consulta dentro del propio callback
      setTimeout(() => void this.getUserInformation(), 0);
    });
  }

  signUp(email: string, password: string) {
    return this.supabase.auth.signUp({ email, password });
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

  async isAdmin() {
    const information = await this.getUserInformation();

    return information?.role === Roles.Admin;
  }
}
