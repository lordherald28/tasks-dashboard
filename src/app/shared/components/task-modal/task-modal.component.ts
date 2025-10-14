import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TaskFormComponent } from '../task-form/task-form.component';
import { Task } from '../../../core/models/task';
import { MatIconModule } from '@angular/material/icon';


export interface TaskModalData {
    task?: Task; // Para edición en modal
}

@Component({
    selector: 'app-task-modal',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        TaskFormComponent,
        MatIconModule
    ],
    template: `
    <div class="modal-header">
      <h2 mat-dialog-title>
        {{ data.task ? 'Editar Tarea' : 'Nueva Tarea' }}
      </h2>
    </div>
    
    <mat-dialog-content>
      <app-task-form 
        [task]="data.task"
        [isModal]="true"
        (formSubmit)="onSubmit($event)"
        (formCancel)="onCancel()">
      </app-task-form>
    </mat-dialog-content>
  `,
    styleUrls: ['./task-modal.component.scss']
})
export class TaskModalComponent {
    constructor(
        public dialogRef: MatDialogRef<TaskModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: TaskModalData
    ) { }

    onSubmit(task: Task): void {
        this.dialogRef.close(task);
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}