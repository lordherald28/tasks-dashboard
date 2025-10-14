import { inject, Injectable } from '@angular/core';
import { API_URL } from '../config/api';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Task } from '../models/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private base = inject(API_URL);

  constructor(
    private readonly http: HttpClient
  ) { }

  public list(): Observable<Task[]> {
    return this.http.get<Task[]>(this.base).pipe(
      map(tasks => tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    );
  }

  public get(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.base}/${id}`);
  }

  public create(body: Omit<Task, 'id'>): Observable<Task> {
    return this.http.post<Task>(`${this.base}`, body);
  }

  public update(id: string, body: Partial<Omit<Task, 'id'>>): Observable<Task> {
    return this.http.put<Task>(`${this.base}/${id}`, body);
  }

  public remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
