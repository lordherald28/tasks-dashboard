import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, Observable, shareReplay, startWith } from 'rxjs';
import { TaskService } from '../../../../core/services/task.service';
import { Task } from '../../../../core/models/task';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReusableTableComponent, TableColumn } from "../../../../shared/components/reusable-table.component";

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule, 
    // RouterLink,
    MatTooltipModule,
    ReusableTableComponent
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskListComponent implements OnInit {

  // Observables para filtros
  private q$ = new BehaviorSubject<string>('');
  private status$ = new BehaviorSubject<string>('');
  
  // Datos filtrados
  public filteredTasks$!: Observable<Task[]>;
  
  // Configuración de la tabla
  public tableColumns: TableColumn[] = [
    { key: 'title', header: 'Título', type: 'text' },
    { key: 'description', header: 'Descripción', type: 'text' },
    { key: 'status', header: 'Estado', type: 'badge' }
  ];

  constructor(private readonly taskService: TaskService) { }

  ngOnInit(): void {
    this.loadData();
  }

  // Métodos públicos para manejar eventos del componente reutilizable
  setQuery(searchTerm: string): void { 
    this.q$.next(searchTerm); 
  }

  setStatus(status: string): void { 
    this.status$.next(status); 
  }

  remove(task: Task): void {
    if (confirm(`¿Estás seguro de que quieres eliminar la tarea "${task.title}"?`)) {
      this.taskService.remove(task.id).subscribe(() => {
        // Recargar datos manteniendo los filtros actuales
        this.loadData();
      });
    }
  }

  // Método privado para cargar y filtrar datos
  private loadData(): void {
    const tasks$ = this.taskService.list().pipe(
      startWith([] as Task[]), 
      shareReplay(1)
    );
    
    this.filteredTasks$ = combineLatest([
      tasks$,
      this.q$.pipe(
        map(search => search.trim().toLowerCase()), 
        debounceTime(300), // Un poco más de debounce para mejor UX
        distinctUntilChanged()
      ),
      this.status$
    ]).pipe(
      map(([tasks, searchTerm, statusFilter]) =>
        tasks.filter(task =>
          // Filtro por estado
          (statusFilter ? task.status === statusFilter : true) &&
          // Filtro por búsqueda en título y descripción
          (searchTerm ? 
            (task.title + ' ' + task.description).toLowerCase().includes(searchTerm) 
            : true)
        )
      )
    );
  }
}