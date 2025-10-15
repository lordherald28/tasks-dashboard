import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Task } from '../../../core/models/task';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnChanges {
  @Input() task?: Task; // Para edición
  @Input() isModal: boolean = false; // Si se usa en modal
  @Output() formSubmit = new EventEmitter<Task>();
  @Output() formCancel = new EventEmitter<void>();

  taskForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.taskForm = this.createForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task'] && this.task) {
      this.taskForm.patchValue(this.task);
    }
  }


  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
      status: ['pending', Validators.required],
      estimatedDuration: [30, [Validators.required, Validators.min(1), Validators.max(480)]]
    });
  }

  onSubmit(): void {
    if (this.taskForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const formData: any = this.taskForm.value;
      const taskData: Task = {
        id: this.task?.id || this.generateId(),
        ...formData,
        createdAt: this.task?.createdAt || new Date().toISOString()
      };

      this.formSubmit.emit(taskData);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    if (this.isModal) {
      this.formCancel.emit();
    } else {
      this.router.navigate(['/tasks']);
    }
  }

  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.taskForm.controls).forEach(key => {
      this.taskForm.get(key)?.markAsTouched();
    });
  }

  // Helpers para el template
  get title() { return this.taskForm.get('title'); }
  get description() { return this.taskForm.get('description'); }
  get estimatedDuration() { return this.taskForm.get('estimatedDuration'); }
}