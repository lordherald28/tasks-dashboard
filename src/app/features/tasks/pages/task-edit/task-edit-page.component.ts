import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskFormComponent } from '../../../../shared/components/task-form/task-form.component';
import { Task } from '../../../../core/models/task';
import { TaskService } from '../../../../core/services/task.service';


@Component({
    selector: 'app-task-edit-page',
    standalone: true,
    imports: [CommonModule, TaskFormComponent],
    template: `
    <div class="edit-page-container">
      <div class="page-header">
        <h1>{{ task ? 'Editar Tarea' : 'Nueva Tarea' }}</h1>
      </div>
      
      <div class="form-container">
        <app-task-form 
          [task]="task"
          (formSubmit)="onSubmit($event)"
          (formCancel)="onCancel()">
        </app-task-form>
      </div>
    </div>
  `,
    styleUrls: ['./task-edit-page.component.scss']
})
export class TaskEditPageComponent implements OnInit {
    task?: Task;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private taskService: TaskService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        const taskId = this.route.snapshot.params['id'];
        if (taskId && taskId !== 'new') {
            this.loadTask(taskId);
        }
    }

    private loadTask(id: string): void {
        this.taskService.get(id).subscribe({
            next: (task) => this.task = task,
            error: () => {
                this.snackBar.open('Tarea no encontrada', 'Cerrar', { duration: 3000 });
                this.router.navigate(['/tasks']);
            }
        });
    }

    onSubmit(updatedTask: Task): void {
        const operation = this.task ? this.taskService.update(updatedTask.id, updatedTask) : this.taskService.create(updatedTask);

        operation.subscribe({
            next: () => {
                const message = this.task ? 'Tarea actualizada' : 'Tarea creada';
                this.snackBar.open(message, 'Cerrar', { duration: 3000 });
                this.router.navigate(['/tasks']);
            },
            error: () => {
                this.snackBar.open('Error al guardar la tarea', 'Cerrar', { duration: 3000 });
            }
        });
    }

    onCancel(): void {
        this.router.navigate(['/tasks']);
    }
}