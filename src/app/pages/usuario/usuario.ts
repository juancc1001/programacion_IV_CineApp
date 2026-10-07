import { Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';
import { ReviewsService } from '../../services/reviews.service';
import { Button } from '../../ui/button/button';

@Component({
  imports: [DatePipe, RouterLink, Button],
  selector: 'app-usuario',
  styleUrl: './usuario.scss',
  templateUrl: './usuario.html',
})
export class Usuario {
  private readonly authService = inject(AuthService);
  private readonly bookingService = inject(BookingService);
  private readonly reviewsService = inject(ReviewsService);

  readonly usuario = this.authService.userInformation;
  reservas = signal<Reserva[]>([]);
  scores = signal(new Map<number, number>());
  canjes = computed(() => this.reservas().filter((reserva) => reserva.points_used > 0));
  proximas = computed(() => this.reservas().filter((reserva) => inicioFuncion(reserva) > new Date()));
  pasadas = computed(() => this.reservas().filter((reserva) => inicioFuncion(reserva) <= new Date()));

  constructor() {
    // el usuario se carga async, se esperan los datos para buscar sus reservas
    effect(() => {
      const userId = this.usuario()?.user_id;
      if (userId) {
        this.loadReservas(userId);
      }
    });
  }

  async loadReservas(userId: string) {
    this.reservas.set(await this.bookingService.getBookingsUsuario(userId));
    this.scores.set(await this.reviewsService.getScoresUsuario(userId));
  }

  inicioFuncion(reserva: Reserva) {
    return inicioFuncion(reserva);
  }

  // se puede cancelar hasta 2hs antes de la funcion
  puedeCancelar(reserva: Reserva) {
    return inicioFuncion(reserva).getTime() - Date.now() > 2 * 60 * 60 * 1000;
  }

  async cancelar(reserva: Reserva) {
    const cancelada = await this.bookingService.cancelarBooking(reserva.id);

    if (cancelada) {
      // se devuelve el total en puntos y se descuentan los puntos que se ganaron con la compra
      const devueltos = Math.floor(reserva.total) + reserva.points_used;
      const ganados = Math.floor(reserva.total);
      await this.authService.sumarPuntos(devueltos - ganados);
      this.reservas.update((reservas) => reservas.filter((item) => item.id !== reserva.id));
    }
  }
}

// las reservas viejas no tienen fecha de funcion, se toman como pasadas
function inicioFuncion(reserva: Reserva): Date {
  if (!reserva.showtime_date) {
    return new Date(0);
  }

  return new Date(`${reserva.showtime_date}T${reserva.showtimes?.start_time ?? '00:00'}`);
}

type Reserva = Awaited<ReturnType<BookingService['getBookingsUsuario']>>[number];
