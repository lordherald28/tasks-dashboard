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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTooltipModule,
    MatSnackBarModule,
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
  private tasks$!: Observable<Task[]>;
  private localUpdates$ = new BehaviorSubject<Task[]>([]);

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
    private router: Router,
    private snackBar: MatSnackBar

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
  openCreateModal(): void {
    const dialogRef = this.dialog.open(TaskModalComponent, {
      width: '90vw',
      maxWidth: '600px',
      data: {},
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((result: Task) => {
      if (result) {
        this.taskService.create(result).subscribe({
          next: (newTask) => {
            // Agregar la nueva tarea tanto localmente como recargando
            this.addTaskLocally(newTask);
            this.showNotification('Tarea creada exitosamente', 'success');

          },
          error: (error: any) => {
            // En caso de error, recargar toda la lista
            this.loadData();
            console.error('Error creating task:', error);
            this.showNotification('Error al crear la tarea', 'error');
          }
        });
      }
    });
  }

  private addTaskLocally(newTask: Task): void {
    // Agregar la tarea a las actualizaciones locales
    const currentLocalTasks = this.localUpdates$.value;
    this.localUpdates$.next([newTask, ...currentLocalTasks]);
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
      this.taskService.remove(task.id).subscribe({
        next: () => {
          this.removeTaskLocally(task.id);
          this.showNotification('Tarea eliminada', 'success');
        },
        error: (error) => {
          console.error('Error deleting task:', error);
          this.showNotification('Error al eliminar la tarea', 'error');
        }
      });
    }
  }

  // Método helper para notificaciones (ya lo tenías)
  private showNotification(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'success' ? ['snackbar-success'] : ['snackbar-error']
    });
  }

  private removeTaskLocally(taskId: string): void {
    const currentLocalTasks = this.localUpdates$.value;
    this.localUpdates$.next(currentLocalTasks.filter(task => task.id !== taskId));
  }

  // Método privado para cargar y filtrar datos
  private loadData(): void {
    const serverTasks$ = this.taskService.list().pipe(
      map(tasks => tasks.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )),
      startWith([] as Task[]),
      shareReplay(1)
    );

    // Combinar tareas del servidor con actualizaciones locales
    this.tasks$ = combineLatest([
      serverTasks$,
      this.localUpdates$
    ]).pipe(
      map(([serverTasks, localTasks]) => {
        // Filtrar tareas locales que ya no existen en el servidor (por si se borraron)
        const validLocalTasks = localTasks.filter(localTask =>
          !serverTasks.some(serverTask => serverTask.id === localTask.id)
        );
        return [...validLocalTasks, ...serverTasks].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }),
      shareReplay(1)
    );

    this.filteredTasks$ = combineLatest([
      this.tasks$,
      this.q$.pipe(
        map(s => s.trim().toLowerCase()),
        debounceTime(300),
        distinctUntilChanged()
      ),
      this.status$
    ]).pipe(
      map(([tasks, searchTerm, statusFilter]) =>
        tasks.filter(task =>
          (statusFilter ? task.status === statusFilter : true) &&
          (searchTerm ?
            (task.title + ' ' + task.description).toLowerCase().includes(searchTerm)
            : true)
        )
      )
    );
  }

}