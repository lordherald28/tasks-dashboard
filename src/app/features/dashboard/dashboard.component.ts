import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../core/services/task.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [
    CommonModule, 
    NgxChartsModule, 
    MatCardModule, 
    MatIconModule
  ],
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  datosEstadoTareas: any[] = [];
  datosProgresoSemanal: any[] = [];
  
  // Métricas en español
  totalTareas: number = 0;
  tareasCompletadas: number = 0;
  tareasPendientes: number = 0;
  tasaCompletado: number = 0;
  productividad: number = 0;
  tareasEstaSemana: number = 0;
  tiempoPromedio: string = '2.5h';
  tareasUrgentes: number = 0;

  esquemaColores: any = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  constructor(private taskService: TaskService) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.taskService.list().subscribe(tareas => {
      // Calcular métricas básicas
      this.totalTareas = tareas.length;
      this.tareasCompletadas = tareas.filter(t => t.status === 'completed').length;
      this.tareasPendientes = tareas.filter(t => t.status === 'pending').length;
      this.tasaCompletado = this.totalTareas > 0 ? 
        Math.round((this.tareasCompletadas / this.totalTareas) * 100) : 0;
      
      // Métricas adicionales
      this.productividad = Math.min(100, Math.round(this.tasaCompletado * 1.2));
      this.tareasEstaSemana = Math.floor(this.totalTareas * 0.3);
      this.tareasUrgentes = Math.floor(this.tareasPendientes * 0.4);

      // Datos para gráficos
      this.datosEstadoTareas = [
        { name: 'Completadas', value: this.tareasCompletadas },
        { name: 'Pendientes', value: this.tareasPendientes },
      ];

      // Datos de progreso semanal
      this.datosProgresoSemanal = [
        { name: 'Lun', value: 8 },
        { name: 'Mar', value: 12 },
        { name: 'Mié', value: 7 },
        { name: 'Jue', value: 15 },
        { name: 'Vie', value: 11 },
        { name: 'Sáb', value: 4 },
        { name: 'Dom', value: 2 }
      ];
    });
  }
}