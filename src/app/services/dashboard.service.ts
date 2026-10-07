import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly supabase = inject(SupabaseService).supabase;

  // cuenta las entradas vendidas por pelicula desde la fecha dada
  async getPeliculasMasVistas(desde: Date, cantidad: number): Promise<Ranking[]> {
    const { data, error } = await this.supabase
      .from('bookings')
      .select('booking_seats(id), showtimes(movies(title))')
      .gte('created_at', desde.toISOString());

    if (error) {
      console.error('Error loading peliculas mas vistas:', error);
      return [];
    }

    const conteo = new Map<string, number>();

    for (const booking of data) {
      const titulo = booking.showtimes?.movies?.title;
      if (!titulo) {
        continue;
      }

      //si es la primera entrada para la pelicula es cero, sino suma la cantidad de asientos de la reserva
      conteo.set(titulo, (conteo.get(titulo) ?? 0) + booking.booking_seats.length);
    }

    return top(conteo, cantidad);
  }

  async getProductosMasVendidos(cantidad: number): Promise<Ranking[]> {
    const { data, error } = await this.supabase
      .from('booking_products')
      .select('quantity, products(name)');

    if (error) {
      console.error('Error loading productos mas vendidos:', error);
      return [];
    }

    const conteo = new Map<string, number>();

    for (const item of data) {
      const nombre = item.products?.name;
      if (!nombre) {
        continue;
      }

      conteo.set(nombre, (conteo.get(nombre) ?? 0) + item.quantity);
    }

    return top(conteo, cantidad);
  }
}

function top(conteo: Map<string, number>, cantidad: number): Ranking[] {
  const ranking: Ranking[] = [];

  for (const [nombre, total] of conteo) {
    ranking.push({ nombre, total });
  }

  ranking.sort((a, b) => b.total - a.total);

  return ranking.slice(0, cantidad);
}

export interface Ranking {
  nombre: string;
  total: number;
}
