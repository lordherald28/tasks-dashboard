import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TaskService } from '../../../../core/services/task.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskListComponent implements OnInit {
  count = 0;
  constructor(private readonly TaskService: TaskService) { }

  ngOnInit() { this.TaskService.list().subscribe(xs => this.count = xs.length); }

}
