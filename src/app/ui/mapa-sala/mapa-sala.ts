import { Component, effect, inject, input, signal } from '@angular/core';
import { FuncionesService } from '../../services/funciones.service';

const LETRAS = 'ABCDEFGHIJKLMNOPQRS'.split('');
const FILA_DISCAPACIDAD = 'J';

@Component({
  imports: [],
  selector: 'app-mapa-sala',
  styleUrl: './mapa-sala.scss',
  templateUrl: './mapa-sala.html',
})
export class MapaSala {
  private readonly funcionesService = inject(FuncionesService);

  readonly funcionId = input.required<number>();

  readonly filas = crearFilas();
  ocupadas = signal<string[]>([]);
  seleccionadas = signal<string[]>([]);

  constructor() {
    effect(() => {
      this.seleccionadas.set([]);
      this.loadOcupadas(this.funcionId());
    });
  }

  async loadOcupadas(funcionId: number) {
    this.ocupadas.set(await this.funcionesService.getButacasOcupadas(funcionId));
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
  bloques: Butaca[][];
}

interface Butaca {
  codigo: string;
  numero: number;
}
