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
import { NotificationService } from '../../../../core/services/notification.service';

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
  changeDetection: ChangeDetectionStrategy.Default
})
export class TaskListComponent implements OnInit {
  // Observables simples
  private q$ = new BehaviorSubject<string>('');
  private status$ = new BehaviorSubject<string>('');
  public filteredTasks$!: Observable<Task[]>;

  public taksList = new Array<Task>();

  // Configuración de la tabla
  public tableColumns: TableColumn[] = [
    { key: 'title', header: 'Título', type: 'text' },
    { key: 'description', header: 'Descripción', type: 'text' },
    {
      key: 'createdAt',
      header: 'Creada',
      type: 'text',
      pipe: 'relativeTime'
    },
    { key: 'status', header: 'Estado', type: 'badge' }
  ];

  constructor(
    private readonly taskService: TaskService,
    private dialog: MatDialog,
    private router: Router,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  // Métodos simples
  onAddClick(): void {
    this.openCreateModal();
  }

  onEditClick(task: Task): void {
    this.router.navigate(['/tasks', task.id, 'edit']);
  }

  onDeleteClick(task: Task): void {
    this.remove(task);
  }

  openCreateModal(): void {
    const dialogRef = this.dialog.open(TaskModalComponent, {
      width: '90vw',
      maxWidth: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe((result: Task) => {
      if (result) {
        this.taskService.create(result).subscribe({
          next: (value: Task) => {
            console.log('value: ', value)

            this.loadData(); // Recarga simple
            this.notificationService.success('Tarea creada exitosamente');
          },
          error: () => {
            this.notificationService.error('Error al crear la tarea');
          }
        });
      }
    });
  }

  setQuery(searchTerm: string): void {
    this.q$.next(searchTerm);
  }

  setStatus(status: string): void {
    this.status$.next(status);
  }

  remove(task: Task): void {
    if (confirm(`¿Estás seguro de eliminar "${task.title}"?`)) {
      this.taskService.remove(task.id).subscribe({
        next: () => {
          this.loadData(); // Recarga simple después de eliminar
          this.notificationService.success('Tarea eliminada');
        },
        error: () => {
          this.notificationService.error('Error al eliminar la tarea');
        }
      });
    }
  }

  private loadData(): void {
    this.filteredTasks$ = combineLatest([
      this.taskService.list(),
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
    this.filteredTasks$.subscribe(value => this.taksList = value)
  }
}