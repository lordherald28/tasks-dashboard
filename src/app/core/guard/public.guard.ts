import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const publicGuard: CanActivateFn = () => {
    const authService: AuthService = inject(AuthService);
    const router: Router = inject(Router);

    // Si ya está autenticado, redirigir a dashboard
    if (authService.isAuthenticated) {
        router.navigate(['/dashboard']);
        return false;
    }

    return true;
};