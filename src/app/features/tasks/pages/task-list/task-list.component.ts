import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, Observable, shareReplay, startWith, switchMap } from 'rxjs';
import { TaskService } from '../../../../core/services/task.service';
import { Task } from '../../../../core/models/task';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskListComponent implements OnInit {

  private q$ = new BehaviorSubject<string>(''); // = todos
  private status$ = new BehaviorSubject<string>(''); // '' = todos
  private tasks$!: Observable<Task[]>;

  public displayedColumns = ['title', 'description', 'status', 'actions'];
  public filtered$!: Observable<Task[]>;
  
  constructor(private readonly taskService: TaskService) {
  }

  ngOnInit(): void {
    const base$ = this.taskService.list().pipe(startWith([] as Task[]), shareReplay(1));
    this.tasks$ = base$ as Observable<Task[]>;
    this.filtered$ = combineLatest([
      base$,
      this.q$.pipe(map(s => s.trim().toLowerCase()), debounceTime(200), distinctUntilChanged()),
      this.status$
    ]).pipe(
      map(([items, q, st]) =>
        items.filter(t => (st ? t.status === st : true) &&
          (q ? (t.title + ' ' + t.description).toLowerCase().includes(q) : true))
      )
    );
  }

  setQuery(v: string) { this.q$.next(v); }
  setStatus(v: string) { this.status$.next(v); }

  remove(t: Task) {
    this.taskService.remove(t.id)
      .pipe(switchMode => this.taskService.list()) // opcional: reproveer lista
      .subscribe(() => {
        this.q$.next(this.q$.value);
        this.status$.next(this.status$.value);
      });
  }
}
