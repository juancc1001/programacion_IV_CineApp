import { Component, inject, signal } from '@angular/core';
import { CarritoService } from '../../services/carrito.service';
import { BookingService } from '../../services/booking.service';
import { Button } from '../../ui/button/button';

@Component({
  imports: [Button],
  selector: 'app-carrito',
  styleUrl: './carrito.scss',
  templateUrl: './carrito.html',
})
export class Carrito {
  private readonly carritoService = inject(CarritoService);
  private readonly bookingService = inject(BookingService);

  readonly items = this.carritoService.items;
  comprando = signal(false);
  codigosReserva = signal<string[]>([]);

  eliminar(index: number) {
    this.carritoService.eliminar(index);
  }

  async comprarCarrito() {
    this.comprando.set(true);
    this.codigosReserva.set([]);

    const codigos: string[] = [];

    for (const item of this.items()) {
      const booking = await this.bookingService.crearBooking(item.funcionId, item.butacas);
      if (booking) {
        codigos.push(String(booking.id).slice(0, 4));
      }
    }

    this.comprando.set(false);

    if (codigos.length > 0) {
      this.codigosReserva.set(codigos);
      this.carritoService.vaciar();
    }
  }

  cerrarReserva() {
    this.codigosReserva.set([]);
  }
}
