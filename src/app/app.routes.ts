import { Routes } from '@angular/router';
import { TaskListComponent } from './features/tasks/pages/task-list/task-list.component';
import { TaskFormComponent } from './features/tasks/pages/task-form/task-form.component';

// export const routes: Routes = [
//     { path: '', redirectTo: 'tasks', pathMatch: 'full' },
//     { path: 'tasks', component: TaskListComponent },
//     { path: 'tasks/new', component: TaskFormComponent },
//     { path: 'tasks/:id', component: TaskFormComponent },
//     { path: '**', redirectTo: 'tasks' }
// ];

export const routes: Routes = [
    {
        path: 'tasks',
        loadComponent: () => import('./features/tasks/pages/task-list/task-list.component')
            .then(c => c.TaskListComponent)
    },
    {
        path: 'tasks/new',
        loadComponent: () => import('./features/tasks/pages/task-edit/task-edit-page.component')
            .then(c => c.TaskEditPageComponent)
    },
    {
        path: 'tasks/:id/edit',
        loadComponent: () => import('./features/tasks/pages/task-edit/task-edit-page.component')
            .then(c => c.TaskEditPageComponent)
    },
    { path: '', redirectTo: '/tasks', pathMatch: 'full' }
];