import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Task } from '../models/task';

@Injectable({
  providedIn: 'root'
})
export class OfflineBackupService {
  private storageKey = 'tasks-backup';

  // Solo se usa cuando el servidor falla
  getBackup(): Task[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  // Se actualiza cuando el servidor responde exitosamente
  updateBackup(tasks: Task[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
  }

  // Limpiar cuando ya no se necesita
  clearBackup(): void {
    localStorage.removeItem(this.storageKey);
  }
}