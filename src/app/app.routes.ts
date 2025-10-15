import { Routes } from '@angular/router';
import { AuthGuard } from './core/guard/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component')
            .then(c => c.LoginComponent),
        title: 'Login',
        canActivate: [AuthGuard]
    },
    {
        path: 'tasks',
        loadComponent: () => import('./features/tasks/pages/task-list/task-list.component')
            .then(c => c.TaskListComponent),
        title: 'Lista de Tareas'
    },
    {
        path: 'tasks/:id/edit',
        loadComponent: () => import('./features/tasks/pages/task-edit/task-edit-page.component')
            .then(c => c.TaskEditPageComponent),
        title: 'Editar Tarea'
    },
    { path: '', redirectTo: '/login', pathMatch: 'full' }
];