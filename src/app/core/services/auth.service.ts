import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { NotificationService, Notification } from './notification.service';
import { LoginResponse, User, UserWithPassword } from '../models/auth';
import { BIN_ID, JSONBIN_BASE_URL, MASTER_KEY } from '../utils/const';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private notificationSuccess: Notification = {
        message: 'Exito',
        type: 'success',
        action: 'Cerrar',
        duration: 10000
    };
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();
    public isAuthenticated$ = new BehaviorSubject<boolean>(false);

    constructor(private notificationService: NotificationService, private http: HttpClient) {
        this.checkStoredAuth();
    }

    /**
     * Login usando JSONBin.io como backend simulado
     */
    login(email: string, password: string): Observable<LoginResponse> {
        return this.http.get<LoginResponse>(`${JSONBIN_BASE_URL}/${BIN_ID}`, {
            headers: {
                'X-Master-Key': MASTER_KEY
            }
        }).pipe(
            map((binData: any) => {
                const users: UserWithPassword[] = binData.record?.users || [];
                const user = users.find(u => u.email === email && u.password === password);

                if (user) {
                    // Simular token JWT
                    const token = btoa(JSON.stringify({
                        userId: user.id,
                        email: user.email,
                        exp: Date.now() + (24 * 60 * 60 * 1000)
                    }));

                    // Remover password del objeto user que retornamos
                    const { password: _, ...userWithoutPassword } = user;

                    return {
                        success: true,
                        token,
                        user: userWithoutPassword
                    } as LoginResponse;
                } else {
                    return {
                        success: false,
                        message: 'Credenciales incorrectas'
                    } as LoginResponse;
                }
            }),
            tap((response: LoginResponse) => {
                if (response.success && response.token && response.user) {
                    this.setAuthData(response.token, response.user);
                    this.notificationSuccess = { message: `Bienvenido, ${response.user.name}!`, type: 'success', action: 'Cerrar', duration: 5000 };
                    this.notificationService.notify(this.notificationSuccess);
                    this.isAuthenticated$.next(true);
                } else if (!response.success) {
                    this.notificationService.error(response.message || 'Error en el login');
                }
            }),
            catchError((error: HttpErrorResponse) => {
                console.error('Error en login:', error.error.message);
                return of({
                    success: false,
                    message: error.error.message ?? 'Error de conexión con el servidor'
                } as LoginResponse);
            })
        );
    }

    logout(): void {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
        this.currentUserSubject.next(null);
        this.isAuthenticated$.next(false);
        this.notificationService.info('Sesión cerrada');
    }

    get currentUser(): User | null {
        return this.currentUserSubject.value;
    }

    get isAuthenticated(): boolean {
        const token = localStorage.getItem('auth_token');
        if (!token) return false;

        try {
            const tokenData = JSON.parse(atob(token));
            return tokenData.exp > Date.now();
        } catch {
            return false;
        }
    }

    get authToken(): string | null {
        return localStorage.getItem('auth_token');
    }

    private setAuthData(token: string, user: User): void {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('current_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
        this.isAuthenticated$.next(true);
    }

    private checkStoredAuth(): void {
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('current_user');

        if (token && userStr && this.isAuthenticated) {
            try {
                const user = JSON.parse(userStr);
                this.currentUserSubject.next(user);
                this.isAuthenticated$.next(true);
            } catch {
                this.clearAuthData();
            }
        } else {
            this.clearAuthData();
        }
    }

    private clearAuthData(): void {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
        this.currentUserSubject.next(null);
        this.isAuthenticated$.next(false);
    }
}