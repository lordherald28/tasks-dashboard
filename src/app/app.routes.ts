import { Routes } from '@angular/router';
import { TaskListComponent } from './features/tasks/pages/task-list/task-list.component';
import { TaskFormComponent } from './features/tasks/pages/task-form/task-form.component';

export const routes: Routes = [
    { path: '', redirectTo: 'tasks', pathMatch: 'full' },
    { path: 'tasks', component: TaskListComponent },
    { path: 'tasks/new', component: TaskFormComponent },
    { path: 'tasks/:id', component: TaskFormComponent },
    { path: '**', redirectTo: 'tasks' }
];
