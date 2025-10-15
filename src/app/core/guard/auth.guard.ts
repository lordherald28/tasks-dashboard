// src/app/core/guards/public.guard.ts
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../models/auth';
import { NotificationService } from '../services/notification.service';

export const AuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {

    const authService: AuthService = inject(AuthService);
    const router: Router = inject(Router);
    const notificationService: NotificationService = inject(NotificationService);
    const role: string[] = route.data['roles'];
    const currentUser: User | null = authService.currentUser;

    // Si no está autenticado, redirigir al login
    if (!authService.isAuthenticated) {
        router.navigate(['/login']);
        return false;
    }

    // Si la ruta no requiere roles específicos, permitir acceso
    const requiredRoles: string[] = route.data['roles'];

    if (!requiredRoles || requiredRoles.length === 0) {
        return true;
    }

    // Verificar si el usuario tiene alguno de los roles requeridos
    const hasRequiredRole: boolean = requiredRoles.includes(currentUser?.role || '');

    if (!hasRequiredRole) {
        notificationService.warning('Lo siento, no tiene permisos para esta ruta')
        router.navigate(['/tasks']);
        return false;
    }

    return true;
};