import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QRCodeComponent } from 'angularx-qrcode';
import { CarritoService } from '../../services/carrito.service';
import { Producto, ProductosService } from '../../services/productos.service';
import { PreciosService } from '../../services/precios.service';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { Button } from '../../ui/button/button';
import { esVip } from '../../ui/mapa-sala/mapa-sala';

@Component({
  imports: [Button, RouterLink, QRCodeComponent],
  selector: 'app-canjes',
  styleUrls: ['../candy/candy.scss', './canjes.scss'],
  templateUrl: './canjes.html',
})
export class Canjes {
  private readonly carritoService = inject(CarritoService);
  private readonly productosService = inject(ProductosService);
  private readonly preciosService = inject(PreciosService);
  private readonly bookingService = inject(BookingService);
  private readonly authService = inject(AuthService);

  readonly canje = this.carritoService.canje;
  readonly usuario = this.authService.userInformation;
  productos = signal<Producto[]>([]);
  cantidades = signal<Record<number, number>>({});
  puntosEntrada = signal(0);
  puntosVip = signal(0);
  canjeando = signal(false);
  codigoReserva = signal<string | null>(null);

  totalPuntos = computed(() => {
    let total = this.puntosButacas();

    for (const producto of this.productos()) {
      total += this.cantidad(producto) * producto.point_price;
    }

    return total;
  });

  constructor() {
    this.loadProductos();
    this.loadPuntosEntrada();
  }

  async loadProductos() {
    const productos = await this.productosService.getProductos();
    this.productos.set(productos.filter((producto) => producto.point_price > 0));
  }

  async loadPuntosEntrada() {
    const precio = await this.preciosService.getPrecio('standard');
    this.puntosEntrada.set(precio?.points ?? 0);
    const vip = await this.preciosService.getPrecio('vip');
    this.puntosVip.set(vip?.points ?? 0);
  }

  puntosButacas() {
    let total = 0;
    for (const butaca of this.canje()?.butacas ?? []) {
      total += esVip(butaca) ? this.puntosVip() : this.puntosEntrada();
    }
    return total;
  }

  cantidad(producto: Producto) {
    return this.cantidades()[producto.id] ?? 0;
  }

  max(producto: Producto) {
    return producto.stock ?? Infinity;
  }

  sumar(producto: Producto) {
    this.setCantidad(producto, Math.min(this.cantidad(producto) + 1, this.max(producto)));
  }

  restar(producto: Producto) {
    this.setCantidad(producto, Math.max(this.cantidad(producto) - 1, 0));
  }

  async canjear() {
    const canje = this.canje();
    if (!canje) return;

    this.canjeando.set(true);
    const puntos = this.totalPuntos();
    const productos = this.productos()
      .filter((producto) => this.cantidad(producto) > 0)
      .map((producto) => ({ productId: producto.id, cantidad: this.cantidad(producto) }));

    const booking = await this.bookingService.crearBooking(canje.funcionId, canje.fecha, canje.butacas, productos, null, puntos, 0);

    if (booking) {
      await this.authService.sumarPuntos(-puntos);
      const timestamp = new Date().getTime().toString().slice(-3);
      this.codigoReserva.set(String(booking.id).slice(-3) + timestamp);
      this.canje.set(null);
      this.cantidades.set({});
    }

    this.canjeando.set(false);
  }

  cancelarCanje() {
    this.canje.set(null);
    this.cantidades.set({});
  }

  private setCantidad(producto: Producto, cantidad: number) {
    this.cantidades.update((cantidades) => ({ ...cantidades, [producto.id]: cantidad }));
  }
}
