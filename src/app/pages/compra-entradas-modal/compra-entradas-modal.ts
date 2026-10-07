import { Component, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { Funcion, FuncionesService } from '../../services/funciones.service';
import { ModalService } from '../../services/modal.service';
import { AuthService } from '../../services/auth.service';
import { PreciosService } from '../../services/precios.service';
import { MapaSala, esVip } from '../../ui/mapa-sala/mapa-sala';
import { Button } from '../../ui/button/button';

@Component({
  imports: [MapaSala, Button],
  selector: 'app-compra-entradas-modal',
  styleUrl: './compra-entradas-modal.scss',
  templateUrl: './compra-entradas-modal.html',
})
export class CompraEntradasModal {
  private readonly funcionesService = inject(FuncionesService);
  private readonly carritoService = inject(CarritoService);
  private readonly modalService = inject(ModalService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly preciosService = inject(PreciosService);

  readonly compra = this.carritoService.compraSeleccionada;
  readonly mapaSala = viewChild(MapaSala);

  funcionesPorFormato = signal<FuncionesPorFormato[]>([]);
  funcionSeleccionada = signal<Funcion | null>(null);
  error = signal<string | null>(null);
  readonly usuario = this.authService.userInformation;
  puntosEntrada = signal(0);
  puntosVip = signal(0);

  constructor() {
    this.loadFunciones();
    this.loadPuntosEntrada();
  }

  async loadPuntosEntrada() {
    const precio = await this.preciosService.getPrecio('standard');
    this.puntosEntrada.set(precio?.points ?? 0);
    const vip = await this.preciosService.getPrecio('vip');
    this.puntosVip.set(vip?.points ?? 0);
  }

  get puntosCanje(): number {
    let total = 0;
    for (const butaca of this.butacasSeleccionadas) {
      total += esVip(butaca) ? this.puntosVip() : this.puntosEntrada();
    }
    return total;
  }

  async loadFunciones() {
    const compra = this.compra();

    if (!compra) {
      return;
    }

    const funciones = await this.funcionesService.getFuncionesPorFecha(compra.fecha);
    const formatoDict = new Map<string, Funcion[]>();

    for (const funcion of funciones) {
      if (funcion.movie_id !== compra.pelicula.id || !funcion.start_time) {
        continue;
      }

      formatoDict.set(funcion.format, [...(formatoDict.get(funcion.format) ?? []), funcion]);
    }

    this.funcionesPorFormato.set(
      [...formatoDict].map(([formato, funciones]) => ({ formato, funciones })),
    );
  }

  get butacasSeleccionadas(): string[] {
    return this.mapaSala()?.seleccionadas() ?? [];
  }

  agregarAlCarrito() {
    const funcion = this.funcionSeleccionada();
    const butacas = this.butacasSeleccionadas;
    const pelicula = this.compra()?.pelicula;

    if (!funcion || !butacas.length || !pelicula) {
      return;
    }

    const agregada = this.carritoService.agregarEntrada({
      pelicula,
      funcionId: funcion.id,
      fecha: this.compra()?.fecha ?? '',
      horario: funcion.start_time?.slice(0, 5) ?? '',
      formato: funcion.format,
      butacas,
      preventa: this.compra()?.preventa ?? false,
    });

    if (!agregada) {
      this.error.set('Ya tenés una compra en curso');
      return;
    }

    this.close();
    this.router.navigate(['/candy']);
  }

  canjear() {
    const funcion = this.funcionSeleccionada();
    const butacas = this.butacasSeleccionadas;
    const pelicula = this.compra()?.pelicula;

    if (!funcion || !butacas.length || !pelicula) {
      return;
    }

    this.carritoService.canje.set({
      pelicula,
      funcionId: funcion.id,
      fecha: this.compra()?.fecha ?? '',
      horario: funcion.start_time?.slice(0, 5) ?? '',
      formato: funcion.format,
      butacas,
      preventa: false,
    });

    this.close();
    this.router.navigate(['/canjes']);
  }

  close() {
    this.modalService.close();
  }
}

interface FuncionesPorFormato {
  formato: string;
  funciones: Funcion[];
}
