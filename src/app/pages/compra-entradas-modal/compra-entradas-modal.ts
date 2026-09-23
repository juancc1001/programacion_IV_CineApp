import { Component, inject, signal } from '@angular/core';
import { CarritoService } from '../../services/carrito.service';
import { Funcion, FuncionesService } from '../../services/funciones.service';
import { ModalService } from '../../services/modal.service';
import { MapaSala } from '../../ui/mapa-sala/mapa-sala';

@Component({
  imports: [MapaSala],
  selector: 'app-compra-entradas-modal',
  styleUrl: './compra-entradas-modal.scss',
  templateUrl: './compra-entradas-modal.html',
})
export class CompraEntradasModal {
  private readonly funcionesService = inject(FuncionesService);
  private readonly modalService = inject(ModalService);

  readonly compra = inject(CarritoService).compraSeleccionada;
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

  close() {
    this.modalService.close();
  }
}

interface FuncionesPorFormato {
  formato: string;
  funciones: Funcion[];
}
