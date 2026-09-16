import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import type { Database } from '../../types/supabase';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private readonly client: SupabaseClient<Database> = createClient<Database>(
    environment.supabaseUrl,
    environment.supabaseKey,
  );

  get supabase(): SupabaseClient<Database> {
    return this.client;
  }
}
