import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DashboardService, Ranking } from '../../../services/dashboard.service';
import { Log, LogService } from '../../../services/log.service';

@Component({
  imports: [DatePipe],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly dashboardService = inject(DashboardService);
  private readonly logService = inject(LogService);

  peliculasSemana = signal<Ranking[]>([]);
  peliculasMes = signal<Ranking[]>([]);
  productos = signal<Ranking[]>([]);
  logs = signal<Log[]>([]);

  constructor() {
    this.loadDashboard();
  }

  async loadDashboard() {
    this.peliculasSemana.set(await this.dashboardService.getPeliculasMasVistas(haceDias(7), 3));
    this.peliculasMes.set(await this.dashboardService.getPeliculasMasVistas(haceDias(30), 3));
    this.productos.set(await this.dashboardService.getProductosMasVendidos(3));
    this.logs.set(await this.logService.getLogs());
  }
}

function haceDias(dias: number): Date {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  return fecha;
}
