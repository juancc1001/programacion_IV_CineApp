import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Roles } from '../../../types/roles';
import { Pelicula, PeliculasService } from '../../services/peliculas.service';
import { FuncionesService } from '../../services/funciones.service';
import { CarritoService } from '../../services/carrito.service';
import { Button } from '../../ui/button/button';
import { ModalService } from '../../services/modal.service';
import { CompraEntradasModal } from '../compra-entradas-modal/compra-entradas-modal';

@Component({
  imports: [Button],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home {
  private readonly authService = inject(AuthService);
  private readonly moviesService = inject(PeliculasService);
  private readonly funcionesService = inject(FuncionesService);
  private readonly carritoService = inject(CarritoService);
  private readonly modalService = inject(ModalService);

  readonly userInformation = this.authService.userInformation;
  destacadas = signal<Pelicula[]>([]);

  readonly diasCartelera = this.crearDiasCartelera();
  diaSeleccionado = signal(this.diasCartelera[0]);
  cartelera = signal<PeliculaEnCartelera[]>([]);
  
  constructor() {
    this.loadPeliculasDestacadas();
    this.loadCartelera();
  }

  async loadPeliculasDestacadas() {
    this.destacadas.set(await this.moviesService.getPeliculasDestacadas(4));
  }

  // una card por pelicula, con todos los horarios de ese dia
  async loadCartelera() {
    const funciones = await this.funcionesService.getFuncionesPorFecha(
      aFechaIso(this.diaSeleccionado()),
    );
    const peliculaDict = new Map<number, PeliculaEnCartelera>();

    for (const funcion of funciones) {
      if (!funcion.movies || !funcion.start_time) {
        continue;
      }

      const enCartelera = peliculaDict.get(funcion.movies.id) ?? {
        pelicula: funcion.movies,
        horarios: [],
      };
      const horario = funcion.start_time.slice(0, 5);
      const formato = funcion.format;
      const lenguaje = funcion.language;

      const horarioDuplicado = enCartelera.horarios.some(
        (item) =>
          item.horario === horario &&
          item.formato === formato &&
          item.language === lenguaje,
      );

      if (!horarioDuplicado) {
        enCartelera.horarios.push({
          horario,
          language: lenguaje,
          formato,
        });
      }

      peliculaDict.set(funcion.movies.id, enCartelera);
    }

    this.cartelera.set([...peliculaDict.values()]);
  }

  nombreDia(dia: Date): string {
    return ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][dia.getDay()];
  }

  crearDiasCartelera(): Date[] {
    const dias: Date[] = [];

    for (let indice = 0; indice < 7; indice++) {
      const dia = new Date();
      dia.setDate(dia.getDate() + indice);
      dias.push(dia);
    }

    return dias;
  }

  mesAbreviado(dia: Date): string {
    return ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][
      dia.getMonth()
    ];
  }

  abrirCompra(pelicula: Pelicula) {
    this.carritoService.compraSeleccionada.set({
      pelicula,
      fecha: aFechaIso(this.diaSeleccionado()),
    });
    this.modalService.open(CompraEntradasModal);
  }

  seleccionarDia(dia: Date) {
    this.diaSeleccionado.set(dia);
    this.loadCartelera();
  }

  get userFullName(): string {
    const information = this.userInformation();

    if (!information) {
      return 'Usuario';
    }

    const name = information.name ?? 'Usuario';
    const surname = information.surname ?? '';

    return `${name}${surname ? ` ${surname}` : ''}`.trim();
  }

  get roleLabel(): string {
    const information = this.userInformation();

    if (!information) {
      return 'Sin rol';
    }

    return information.role === Roles.Admin ? 'Administrador' : 'Cliente';
  }
}

interface PeliculaEnCartelera {
  pelicula: Pelicula;
  horarios: HorarioFuncion[];
}

interface HorarioFuncion {
  horario: string;
  formato: string;
  language: string;
}

function aFechaIso(dia: Date): string {
  const mes = `${dia.getMonth() + 1}`.padStart(2, '0');
  const numero = `${dia.getDate()}`.padStart(2, '0');

  return `${dia.getFullYear()}-${mes}-${numero}`;
}
