import { inject, Injectable } from '@angular/core';
import { API_URL } from '../config/api';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Task } from '../models/task';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private base = inject(API_URL);

  constructor(
    private readonly http: HttpClient,
    private localStorageService: LocalStorageService
  ) { }

  public list(): Observable<Task[]> {
    return this.http.get<Task[]>(this.base).pipe(
      map(tasks => tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())),
      // Sincronizar con localStorage cuando el servidor responde
      switchMap(serverTasks => {
        this.localStorageService.syncWithServer(serverTasks);
        return of(serverTasks);
      }),
      // Si el servidor falla, usar localStorage
      catchError(() => {
        console.log('Server unavailable, using localStorage data');
        return this.localStorageService.getTasks().pipe(
          map(tasks => tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
        );
      })
    );
  }

  public get(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.base}/${id}`).pipe(
      // Si el servidor falla, buscar en localStorage
      catchError(() =>
        this.localStorageService.getTasks().pipe(
          map(tasks => {
            const task = tasks.find(t => t.id === id);
            if (!task) throw new Error('Task not found');
            return task;
          })
        )
      )
    );
  }

  public create(body: Omit<Task, 'id'>): Observable<Task> {
    return this.http.post<Task>(`${this.base}`, body).pipe(
      // Actualizar localStorage cuando el servidor responde
      switchMap(newTask =>
        this.localStorageService.getTasks().pipe(
          switchMap(localTasks => {
            const updatedTasks = [newTask, ...localTasks];
            return forkJoin([
              of(newTask),
              this.localStorageService.saveTasks(updatedTasks)
            ]);
          }),
          map(([newTask]) => newTask)
        )
      ),
      // Si el servidor falla, guardar solo en localStorage
      catchError(() => {
        const newTask: Task = {
          ...body,
          id: this.generateId()
        };

        return this.localStorageService.getTasks().pipe(
          switchMap(localTasks => {
            const updatedTasks = [newTask, ...localTasks];
            return this.localStorageService.saveTasks(updatedTasks).pipe(
              map(() => newTask)
            );
          })
        );
      })
    );
  }

  public update(id: string, body: Partial<Omit<Task, 'id'>>): Observable<Task> {
    return this.http.put<Task>(`${this.base}/${id}`, body).pipe(
      // Actualizar localStorage cuando el servidor responde
      switchMap(updatedTask =>
        this.localStorageService.getTasks().pipe(
          switchMap(localTasks => {
            const updatedTasks = localTasks.map(task =>
              task.id === id ? { ...task, ...body } : task
            );
            return forkJoin([
              of(updatedTask),
              this.localStorageService.saveTasks(updatedTasks)
            ]);
          }),
          map(([updatedTask]) => updatedTask)
        )
      ),
      // Si el servidor falla, actualizar solo en localStorage
      catchError(() =>
        this.localStorageService.getTasks().pipe(
          switchMap(localTasks => {
            const taskIndex = localTasks.findIndex(task => task.id === id);
            if (taskIndex === -1) {
              throw new Error('Task not found');
            }

            const updatedTask = { ...localTasks[taskIndex], ...body };
            localTasks[taskIndex] = updatedTask;

            return this.localStorageService.saveTasks(localTasks).pipe(
              map(() => updatedTask)
            );
          })
        )
      )
    );
  }

  public remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`).pipe(
      // Actualizar localStorage cuando el servidor responde
      switchMap(() =>
        this.localStorageService.getTasks().pipe(
          switchMap(localTasks => {
            const updatedTasks = localTasks.filter(task => task.id !== id);
            return this.localStorageService.saveTasks(updatedTasks);
          })
        )
      ),
      // Si el servidor falla, eliminar solo de localStorage
      catchError(() =>
        this.localStorageService.getTasks().pipe(
          switchMap(localTasks => {
            const updatedTasks = localTasks.filter(task => task.id !== id);
            if (localTasks.length === updatedTasks.length) {
              throw new Error('Task not found');
            }
            return this.localStorageService.saveTasks(updatedTasks);
          })
        )
      )
    );
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }
}