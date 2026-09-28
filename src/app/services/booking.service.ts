import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private readonly supabase = inject(SupabaseService).supabase;

  async crearBooking(showtimeId: number, butacas: string[]) {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();

    const { data: booking, error } = await this.supabase
      .from('bookings')
      .insert({ showtime_id: showtimeId, user_id: session?.user?.id ?? null })
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

    return booking;
  }
}
