import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private readonly supabase = inject(SupabaseService).supabase;

  async crearBooking(
    showtimeId: number,
    butacas: string[],
    productos: { productId: number; cantidad: number }[],
    voucherId: number | null = null,
  ) {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();

    const { data: booking, error } = await this.supabase
      .from('bookings')
      .insert({ showtime_id: showtimeId, user_id: session?.user?.id ?? null, voucher_id: voucherId })
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
}
