import { inject, Injectable } from '@angular/core';
import { API_URL } from '../config/api';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Task } from '../models/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private base = inject(API_URL);
  private readonly STORAGE_KEY = 'tasks';
  private cache$ = new BehaviorSubject<Task[]>([]);

  constructor(private readonly http: HttpClient) {
    // Cargar datos iniciales desde localStorage
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const tasks = JSON.parse(stored);
        this.cache$.next(tasks);
      } catch (e) {
        this.cache$.next([]);
      }
    }
  }

  private saveToStorage(tasks: Task[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
    this.cache$.next(tasks);
  }

  public list(): Observable<Task[]> {
    // Primero intentar con la API, si falla usar localStorage
    return this.http.get<Task[]>(this.base).pipe(
      map(tasks => tasks.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )),
      tap(tasks => this.saveToStorage(tasks)), // Guardar en localStorage
      catchError(() => {
        // Si la API falla, usar datos de localStorage
        return of(this.cache$.value);
      })
    );
  }

  public get(id: string): Observable<Task> {
    // Buscar primero en localStorage como fallback
    const cachedTask = this.cache$.value.find(task => task.id === id);
    if (cachedTask) {
      return of(cachedTask);
    }

    return this.http.get<Task>(`${this.base}/${id}`).pipe(
      catchError(() => {
        throw new Error('Task not found in API or cache');
      })
    );
  }

  public create(body: Omit<Task, 'id'>): Observable<Task> {
    const newTask: Task = {
      ...body,
      id: Date.now().toString(), // Generar ID único
      createdAt: new Date().toISOString()
    };


    const updatedTasks = [...this.cache$.value, newTask];
    this.saveToStorage(updatedTasks);


    return this.http.post<Task>(this.base, newTask).pipe(
      catchError(() => {
        return of(newTask);
      })
    );
  }

  public update(id: string, body: Partial<Omit<Task, 'id'>>): Observable<Task> {
    // Actualizar localStorage primero
    const updatedTasks = this.cache$.value.map(task =>
      task.id === id ? { ...task, ...body } : task
    );
    this.saveToStorage(updatedTasks);

    const updatedTask = updatedTasks.find(task => task.id === id)!;

    // Intentar con la API
    return this.http.put<Task>(`${this.base}/${id}`, body).pipe(
      catchError(() => {
        return of(updatedTask);
      })
    );
  }

  public remove(id: string): Observable<void> {
    // Eliminar de localStorage primero
    const updatedTasks = this.cache$.value.filter(task => task.id !== id);
    this.saveToStorage(updatedTasks);

    // Intentar con la API
    return this.http.delete<void>(`${this.base}/${id}`).pipe(
      catchError(() => {
        console.warn('Fallo al borrar, usar localStorage');
        return of(void 0);
      })
    );
  }
}