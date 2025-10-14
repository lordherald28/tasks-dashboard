import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Task } from '../models/task';

@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {
    private storageKey: string = 'tasks-backup';

    public getTasks(): Observable<Task[]> {
        try {
            const data: any = localStorage.getItem(this.storageKey);
            const tasks: any = data ? JSON.parse(data) : [];
            return of(tasks);
        } catch (error) {
            return throwError(() => new Error('Error loading tasks from localStorage'));
        }
    }

    public saveTasks(tasks: Task[]): Observable<void> {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(tasks));
            return of(void 0);
        } catch (error) {
            return throwError(() => new Error('Error saving tasks to localStorage'));
        }
    }

    // Sincronizar cuando el servidor responda exitosamente
    public syncWithServer(tasks: Task[]): void {
        this.saveTasks(tasks).subscribe();
    }
}