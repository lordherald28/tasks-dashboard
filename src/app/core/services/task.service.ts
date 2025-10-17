import { inject, Injectable, OnDestroy } from '@angular/core';
import { API_URL, MOCK_API, MOCK_API_LOGIN } from '../config/api';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, Subscription } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Task } from '../models/task';
import { AuthService } from './auth.service';
import { selectTaskById } from '../utils/utils.funtions';

@Injectable({
  providedIn: 'root'
})
export class TaskService implements OnDestroy {
  private readonly STORAGE_KEY = 'tasks';
  private cache$ = new BehaviorSubject<Task[]>([]);
  private readonly url_user_api: string = MOCK_API_LOGIN;
  private readonly url_task_api: string = MOCK_API;

  private userSubscription: Subscription = new Subscription();

  constructor(private readonly http: HttpClient, private readonly authService: AuthService) {

    // Suscribirse a cambios del usuario
    this.userSubscription = this.authService.currentUser$.subscribe(() => {
      // Cargar datos iniciales desde localStorage
      this.loadFromStorage();
    });
  }


  ngOnDestroy() {
    // Limpiar suscripción
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  private getCurrentUserId(): number {
    return this.authService.currentUser?.id as number;
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        // Filtrar aquellas tareas que solo tenga el id del usuario logeado
        const currentUserId: number = this.getCurrentUserId();
        const tasks = selectTaskById(JSON.parse(stored), currentUserId) as Task[];
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
    const currentUserId: number = this.getCurrentUserId();
    // Primero intentar con la API, si falla usar localStorage /users/{userId}/tasks
    return this.http.get<Task[]>(this.url_user_api + '/' + currentUserId + '/tasks').pipe(
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

    return this.http.get<Task>(`${this.url_task_api}/${id}`).pipe(
      catchError(() => {
        throw new Error('Task not found in API or cache');
      })
    );
  }

  public create(body: Omit<Task, 'id'>): Observable<Task> {
    const newTask: Task = {
      ...body,
      id: Date.now().toString(), // Generar ID único,
      createdAt: new Date().toISOString()
    };


    const updatedTasks = [...this.cache$.value, newTask];
    const currentUserId: number = this.getCurrentUserId();
    const taskFiltred: Task[] = selectTaskById(updatedTasks, currentUserId) as Task[];
    this.saveToStorage(taskFiltred);


    return this.http.post<Task>(`${this.url_user_api}/${currentUserId}/tasks`, newTask).pipe(
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
    return this.http.put<Task>(`${this.url_task_api}/${id}`, body).pipe(
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
    const currentUserId: number = this.getCurrentUserId();
    return this.http.delete<any>(`${this.url_user_api}/${currentUserId}/tasks/${id}`, { headers: { 'Content-Type': 'application/json' } }).pipe(
      catchError((e) => {
        console.warn('Fallo al borrar, usar localStorage: ', e);
        return of(void 0);
      })
    );
  }
}