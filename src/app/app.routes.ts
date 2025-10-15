import { Routes } from '@angular/router';
import { AuthGuard } from './core/guard/auth.guard';
import { publicGuard } from './core/guard/public.guard';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { NotFoundComponent } from './features/page-not-found/page-not-found.component';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component')
            .then(c => c.LoginComponent),
        title: 'Login',
        canActivate: [publicGuard]
    },
    {
        path: 'tasks',
        loadComponent: () => import('./features/tasks/pages/task-list/task-list.component')
            .then(c => c.TaskListComponent),
        title: 'Lista de Tareas',
        canActivate: [AuthGuard],
        data: { roles: ['user', 'admin'] }
    },
    {
        path: 'tasks/:id/edit',
        loadComponent: () => import('./features/tasks/pages/task-edit/task-edit-page.component')
            .then(c => c.TaskEditPageComponent),
        title: 'Editar Tarea',
        canActivate: [AuthGuard],
        data: { roles: ['admin'] }
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component')
            .then(c => c.DashboardComponent),
        title: 'Visión General',
        canActivate: [AuthGuard]
    },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    // Ruta 404 - debe ser la última
    {
        path: '**',
        component: NotFoundComponent
    }
];