import { Component, OnChanges, OnDestroy, inject, input, signal } from '@angular/core';
import { FuncionesService } from '../../services/funciones.service';

const LETRAS = 'ABCDEFGHIJKLMNOPQRS'.split('');
const FILA_DISCAPACIDAD = 'J';
const FILAS_VIP = ['Q', 'R', 'S'];

export function esVip(butaca: string): boolean {
  return FILAS_VIP.includes(butaca[0]);
}

@Component({
  imports: [],
  selector: 'app-mapa-sala',
  styleUrl: './mapa-sala.scss',
  templateUrl: './mapa-sala.html',
})
export class MapaSala implements OnChanges, OnDestroy {
  private readonly funcionesService = inject(FuncionesService);

  readonly funcionId = input.required<number>();

  readonly filas = crearFilas();
  ocupadas = signal<string[]>([]);
  seleccionadas = signal<string[]>([]);

  private dejarDeEscucharCallback?: () => void;

  // el mapa no se recrea al cambiar de funcion, solo cambia el input
  ngOnChanges() {
    const funcionId = this.funcionId();
    this.dejarDeEscucharCallback?.();
    this.seleccionadas.set([]);

    //cuando hay evento (ej insert a la tabla) recarga las ocupadas
    this.loadOcupadas(funcionId);
    //escuchar devuelve la funcion para cerrar el canal real time
    this.dejarDeEscucharCallback = this.funcionesService.escucharButacas(funcionId, () => this.loadOcupadas(funcionId));
  }

  ngOnDestroy() {
    this.dejarDeEscucharCallback?.();
  }

  async loadOcupadas(funcionId: number) {
    const ocupadas = await this.funcionesService.getButacasOcupadas(funcionId);
    this.ocupadas.set(ocupadas);
    // si otro compro una butaca que estaba seleccionada, se saca
    this.seleccionadas.update((seleccionadas) => seleccionadas.filter((butaca) => !ocupadas.includes(butaca)));
  }

  toggle(butaca: string) {
    const seleccionadas = this.seleccionadas();

    if (seleccionadas.includes(butaca)) {
      const sinLaButaca = seleccionadas.filter((item) => item !== butaca);
      this.seleccionadas.set(sinLaButaca);
    } else {
      const conLaButaca = [...seleccionadas, butaca];
      this.seleccionadas.set(conLaButaca);
    }
  }
}

function crearFilas(): Fila[] {
  const filas: Fila[] = [];

  for (const letra of LETRAS) {
    const discapacidad = letra === FILA_DISCAPACIDAD;
    filas.push({
      letra,
      discapacidad,
      vip: FILAS_VIP.includes(letra),
      bloques: discapacidad
        ? [crearButacas(letra, 1, 2), crearButacas(letra, 3, 12), crearButacas(letra, 13, 14)]
        : [crearButacas(letra, 1, 4), crearButacas(letra, 5, 24), crearButacas(letra, 25, 28)],
    });
  }

  return filas;
}

function crearButacas(letra: string, desde: number, hasta: number): Butaca[] {
  const butacas: Butaca[] = [];

  for (let numero = desde; numero <= hasta; numero++) {
    butacas.push({ codigo: letra + numero, numero });
  }

  return butacas;
}

interface Fila {
  letra: string;
  discapacidad: boolean;
  vip: boolean;
  bloques: Butaca[][];
}

interface Butaca {
  codigo: string;
  numero: number;
}
