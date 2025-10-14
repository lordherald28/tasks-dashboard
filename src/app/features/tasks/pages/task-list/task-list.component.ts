import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, Observable, shareReplay, startWith } from 'rxjs';
import { TaskService } from '../../../../core/services/task.service';
import { Task } from '../../../../core/models/task';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReusableTableComponent, TableColumn } from "../../../../shared/components/table/reusable-table.component";

import { MatDialog } from '@angular/material/dialog';
import { TaskModalComponent } from '../../../../shared/components/task-modal/task-modal.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
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
    {
      key: 'createdAt',
      header: 'Creada',
      type: 'text',
      pipe: 'relativeTime' // Nueva propiedad para identificar el pipe
    },
    { key: 'status', header: 'Estado', type: 'badge' }
  ];

  constructor(
    private readonly taskService: TaskService,
    private dialog: MatDialog,
    private router: Router

  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  onAddClick(): void {
    this.openCreateModal();
  }

  onEditClick(task: Task): void {
    // Navegar a la página de edición
    this.router.navigate(['/tasks', task.id, 'edit']);
  }

  onDeleteClick(task: Task): void {
    this.remove(task);
  }

  // Método para abrir modal de creación

  private openCreateModal(): void {
    const dialogRef = this.dialog.open(TaskModalComponent, {
      width: '90vw',
      maxWidth: '600px',
      data: {} // Sin task = creación
    });

    dialogRef.afterClosed().subscribe((result: Task) => {
      if (result) {
        this.taskService.create(result).subscribe({
          next: () => {
            this.loadData(); 
          },
          error: (error: any) => {
            // Manejar error
            console.error('Error al crear la tarea:', error);
            // Mostrar snackbar de error
          }
        });
      }
    });
  }
  // Métodos públicos para manejar eventos del componente reutilizable
  setQuery(searchTerm: string): void {
    this.q$.next(searchTerm);
  }

  setStatus(status: string): void {
    this.status$.next(status);
  }

  private remove(task: Task): void {
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