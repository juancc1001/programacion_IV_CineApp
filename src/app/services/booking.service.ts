import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private readonly supabase = inject(SupabaseService).supabase;

  async crearBooking(
    showtimeId: number,
    fecha: string,
    butacas: string[],
    productos: { productId: number; cantidad: number }[],
    voucherId: number | null = null,
    puntosUsados = 0,
    total = 0,
  ) {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();

    const { data: booking, error } = await this.supabase
      .from('bookings')
      .insert({
        showtime_id: showtimeId,
        showtime_date: fecha,
        user_id: session?.user?.id ?? null,
        voucher_id: voucherId,
        points_used: puntosUsados,
        total,
      })
      .select()
      .single();

    if (error || !booking) {
      console.error('Error creating booking:', error);
      return null;
    }

    const { error: seatsError } = await this.supabase
      .from('booking_seats')
      .insert(butacas.map((seat) => ({ booking_id: booking.id, seat })));

    if (seatsError) {
      console.error('Error creating booking seats:', seatsError);
      return null;
    }

    if (productos.length) {
      const { error: productsError } = await this.supabase.from('booking_products').insert(
        productos.map(({ productId, cantidad }) => ({
          booking_id: booking.id,
          product_id: productId,
          quantity: cantidad,
        })),
      );

      if (productsError) {
        console.error('Error creating booking products:', productsError);
        return null;
      }
    }

    return booking;
  }

  async getBookingsUsuario(userId: string) {
    const { data, error } = await this.supabase
      .from('bookings')
      .select('id, created_at, points_used, total, showtime_date, showtimes(start_time, movies(id, title, image_url))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading bookings:', error);
      return [];
    }

    return data;
  }

  // primero se borran las butacas y productos que dependen del booking
  async cancelarBooking(id: number) {
    await this.supabase.from('booking_products').delete().eq('booking_id', id);
    await this.supabase.from('booking_seats').delete().eq('booking_id', id);
    const { error } = await this.supabase.from('bookings').delete().eq('id', id);

    if (error) {
      console.error('Error canceling booking:', error);
      return false;
    }

    return true;
  }
}
