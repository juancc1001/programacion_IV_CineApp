import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Roles } from '../../../types/roles';
import { Pelicula, PeliculaProxima, PeliculasService } from '../../services/peliculas.service';
import { FuncionesService } from '../../services/funciones.service';
import { CarritoService } from '../../services/carrito.service';
import { Button } from '../../ui/button/button';
import { InputComponent } from '../../ui/input/input';
import { ModalService } from '../../services/modal.service';
import { CompraEntradasModal } from '../compra-entradas-modal/compra-entradas-modal';
import { ReviewsService } from '../../services/reviews.service';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { EdadMinima } from '../../directives/edad-minima';

@Component({
  imports: [Button, FormsModule, InputComponent, RouterLink, DecimalPipe, DatePipe, EdadMinima],
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
  private readonly reviewsService = inject(ReviewsService);

  readonly userInformation = this.authService.userInformation;
  destacadas = signal<Pelicula[]>([]);
  proximamente = signal<PeliculaProxima[]>([]);

  readonly diasCartelera = this.crearDiasCartelera();
  diaSeleccionado = signal(this.diasCartelera[0]);
  cartelera = signal<PeliculaEnCartelera[]>([]);
  carteleraFiltrada = signal<PeliculaEnCartelera[]>([]);
  busqueda = '';
  promedios = signal(new Map<number, number>());

  filtrarCartelera() {
    const termino = this.busqueda.toLowerCase().trim();
    if (!termino) {
      this.carteleraFiltrada.set(this.cartelera());
      return;
    }
    this.carteleraFiltrada.set(
      this.cartelera().filter(
        (item) =>
          item.pelicula.title?.toLowerCase().includes(termino) ||
          item.pelicula.genres?.toLowerCase().includes(termino),
      ),
    );
  }
  
  constructor() {
    this.loadPeliculasDestacadas();
    this.loadProximamente().then(() => this.loadCartelera());
    this.loadPromedios();
  }

  async loadPromedios() {
    this.promedios.set(await this.reviewsService.getPromedios());
  }

  async loadPeliculasDestacadas() {
    this.destacadas.set(await this.moviesService.getPeliculasMasVistas(3));
  }

  async loadProximamente() {
    this.proximamente.set(await this.moviesService.getProximamente(aFechaIso(new Date())));
  }

  // la preventa abre 7 dias antes del estreno
  aperturaPreventa(estreno: string): Date {
    const fecha = aFecha(estreno);
    fecha.setDate(fecha.getDate() - 7);
    return fecha;
  }

  aFecha(fecha: string): Date {
    return aFecha(fecha);
  }

  // una card por pelicula, con todos los horarios de ese dia
  async loadCartelera() {
    const funciones = await this.funcionesService.getFuncionesPorFecha(
      aFechaIso(this.diaSeleccionado()),
    );
    const peliculaDict = new Map<number, PeliculaEnCartelera>();
    const proximas = this.proximamente().map((item) => item.pelicula.id);

    for (const funcion of funciones) {
      if (!funcion.movies || !funcion.start_time || proximas.includes(funcion.movies.id)) {
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
    this.filtrarCartelera();
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
      preventa: false,
    });
    this.modalService.open(CompraEntradasModal);
  }

  abrirPreventa(proxima: PeliculaProxima) {
    this.carritoService.compraSeleccionada.set({
      pelicula: proxima.pelicula,
      fecha: proxima.estreno,
      preventa: true,
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

function aFecha(fechaIso: string): Date {
  const [anio, mes, dia] = fechaIso.split('-').map(Number);

  return new Date(anio, mes - 1, dia);
}
