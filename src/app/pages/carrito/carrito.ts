import { Component, inject, signal } from '@angular/core';
import { CarritoService, ItemCarrito } from '../../services/carrito.service';
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
  comprando = signal<number | null>(null);

  eliminar(index: number) {
    this.carritoService.eliminar(index);
  }

  async comprar(item: ItemCarrito, index: number) {
    this.comprando.set(index);

    const booking = await this.bookingService.crearBooking(item.funcionId, item.butacas);

    this.comprando.set(null);

    if (booking) {
      this.carritoService.eliminar(index);
    }
  }
}
