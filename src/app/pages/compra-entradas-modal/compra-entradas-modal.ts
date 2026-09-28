import { Component, inject, signal, viewChild } from '@angular/core';
import { CarritoService } from '../../services/carrito.service';
import { Funcion, FuncionesService } from '../../services/funciones.service';
import { ModalService } from '../../services/modal.service';
import { MapaSala } from '../../ui/mapa-sala/mapa-sala';
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

  readonly compra = this.carritoService.compraSeleccionada;
  readonly mapaSala = viewChild(MapaSala);

  funcionesPorFormato = signal<FuncionesPorFormato[]>([]);
  funcionSeleccionada = signal<Funcion | null>(null);

  constructor() {
    this.loadFunciones();
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

    this.carritoService.agregar({
      pelicula,
      funcionId: funcion.id,
      horario: funcion.start_time?.slice(0, 5) ?? '',
      formato: funcion.format,
      butacas,
    });

    this.close();
  }

  close() {
    this.modalService.close();
  }
}

interface FuncionesPorFormato {
  formato: string;
  funciones: Funcion[];
}
