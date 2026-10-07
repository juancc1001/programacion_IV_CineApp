import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CarritoService, ItemCarrito, ItemProducto } from '../../services/carrito.service';
import { BookingService } from '../../services/booking.service';
import { Voucher, VoucherService } from '../../services/voucher.service';
import { AuthService } from '../../services/auth.service';
import { PreciosService } from '../../services/precios.service';
import { FormsModule } from '@angular/forms';
import { Button } from '../../ui/button/button';
import { InputComponent } from '../../ui/input/input';
import { QRCodeComponent } from 'angularx-qrcode';
import { esVip } from '../../ui/mapa-sala/mapa-sala';

@Component({
  imports: [Button, InputComponent, FormsModule, QRCodeComponent],
  selector: 'app-carrito',
  styleUrl: './carrito.scss',
  templateUrl: './carrito.html',
})
export class Carrito implements OnInit {
  private readonly carritoService = inject(CarritoService);
  private readonly bookingService = inject(BookingService);
  private readonly voucherService = inject(VoucherService);
  private readonly authService = inject(AuthService);
  private readonly preciosService = inject(PreciosService);
  private readonly router = inject(Router);

  readonly items = this.carritoService.items;
  readonly entrada = this.carritoService.entrada;
  comprando = signal(false);
  codigosReserva = signal<string[]>([]);
  codigoCupon = '';
  cupon = signal<Voucher | null>(null);
  mensajeCupon = signal<string | null>(null);
  precioEntrada = signal(0);
  precioVip = signal(0);
  readonly usuario = this.authService.userInformation;

  subtotal = computed(() => {
    let subtotal = 0;

    for (const item of this.items()) {
      subtotal += this.precioItem(item);
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

  ngOnInit() {
    if (this.carritoService.canje()) {
      this.router.navigate(['/canjes']);
    }
  }

  async loadPrecioEntrada() {
    const precio = await this.preciosService.getPrecio('standard');
    this.precioEntrada.set(precio?.price ?? 0);
    const vip = await this.preciosService.getPrecio('vip');
    this.precioVip.set(vip?.price ?? 0);
  }

  precioItem(item: ItemCarrito) {
    if (item.tipo === 'producto') {
      return item.cantidad * item.producto.price;
    }

    if (item.preventa && item.pelicula.presale_price !== null) {
      return item.butacas.length * item.pelicula.presale_price;
    }

    let total = 0;
    for (const butaca of item.butacas) {
      total += esVip(butaca) ? this.precioVip() : this.precioEntrada();
    }
    return total;
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

    const booking = await this.bookingService.crearBooking(entrada.funcionId, entrada.fecha, entrada.butacas, productos, this.cupon()?.id ?? null, 0, this.total());

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
