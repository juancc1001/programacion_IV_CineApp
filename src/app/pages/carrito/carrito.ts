import { Component, computed, inject, signal } from '@angular/core';
import { CarritoService, ItemProducto } from '../../services/carrito.service';
import { BookingService } from '../../services/booking.service';
import { Voucher, VoucherService } from '../../services/voucher.service';
import { AuthService } from '../../services/auth.service';
import { PreciosService } from '../../services/precios.service';
import { FormsModule } from '@angular/forms';
import { Button } from '../../ui/button/button';
import { InputComponent } from '../../ui/input/input';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  imports: [Button, InputComponent, FormsModule, QRCodeComponent],
  selector: 'app-carrito',
  styleUrl: './carrito.scss',
  templateUrl: './carrito.html',
})
export class Carrito {
  private readonly carritoService = inject(CarritoService);
  private readonly bookingService = inject(BookingService);
  private readonly voucherService = inject(VoucherService);
  private readonly authService = inject(AuthService);
  private readonly preciosService = inject(PreciosService);

  readonly items = this.carritoService.items;
  readonly entrada = this.carritoService.entrada;
  comprando = signal(false);
  codigosReserva = signal<string[]>([]);
  codigoCupon = '';
  cupon = signal<Voucher | null>(null);
  mensajeCupon = signal<string | null>(null);
  precioEntrada = signal(0);

  subtotal = computed(() => {
    let subtotal = 0;

    for (const item of this.items()) {
      if (item.tipo === 'entrada') {
        subtotal += item.butacas.length * this.precioEntrada();
      } else {
        subtotal += item.cantidad * item.producto.price;
      }
    }

    return subtotal;
  });

  total = computed(() => {
    const subtotal = this.subtotal();
    const cupon = this.cupon();
    if (!cupon) return subtotal;

    let descuento = (subtotal * cupon.discount_percentage) / 100;
    if (cupon.max_discount !== null) {
      descuento = Math.min(descuento, cupon.max_discount);
    }

    return subtotal - descuento;
  });

  constructor() {
    this.loadPrecioEntrada();
  }

  async loadPrecioEntrada() {
    this.precioEntrada.set(await this.preciosService.getPrecio('standard'));
  }

  eliminar(index: number) {
    this.carritoService.eliminar(index);
  }

  async agregarCupon() {
    const codigo = this.codigoCupon.trim();
    const usuario = await this.authService.getUserInformation();
    const cupon =
      codigo && usuario?.user_id ? await this.voucherService.getVoucherByCode(codigo, usuario.user_id, usuario.birthdate) : null;

    this.cupon.set(cupon);
    this.mensajeCupon.set(cupon ? `Cupón agregado: ${cupon.discount_percentage}% de descuento` : 'Cupón inválido');
  }

  async comprarCarrito() {
    const entrada = this.entrada();
    if (!entrada) return;

    this.comprando.set(true);
    this.codigosReserva.set([]);
    const productos = this.items()
      .filter((item): item is ItemProducto => item.tipo === 'producto')
      .map((item) => ({ productId: item.producto.id, cantidad: item.cantidad }));

    const booking = await this.bookingService.crearBooking(entrada.funcionId, entrada.butacas, productos, this.cupon()?.id ?? null);

    if (booking?.user_id) {
      await this.authService.sumarPuntos(Math.floor(this.total()));
    }

    this.comprando.set(false);

    if (booking) {
      const timestamp = new Date().getTime().toString().slice(-3);
      this.codigosReserva.set([String(booking.id).slice(-3)+timestamp]);
      this.carritoService.vaciar();
      this.codigoCupon = '';
      this.cupon.set(null);
      this.mensajeCupon.set(null);
    }
  }

  cerrarReserva() {
    this.codigosReserva.set([]);
  }
}
