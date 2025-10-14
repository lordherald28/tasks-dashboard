import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject } from 'rxjs';

export interface Notification {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    action?: string;
    duration?: number;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private notificationSubject = new Subject<Notification>();

    constructor(private snackBar: MatSnackBar) {
        // Escuchar las notificaciones y mostrarlas
        this.notificationSubject.subscribe(notification => {
            this.showSnackbar(notification);
        });
    }

    // Método para emitir notificaciones
    notify(notification: Notification): void {
        this.notificationSubject.next(notification);
    }

    // Métodos de conveniencia
    success(message: string): void {
        this.notify({ message, type: 'success' });
    }

    error(message: string): void {
        this.notify({ message, type: 'error' });
    }

    info(message: string): void {
        this.notify({ message, type: 'info' });
    }

    warning(message: string): void {
        this.notify({ message, type: 'warning' });
    }

    // Obtener observable para componentes que quieran escuchar (opcional)
    getNotifications(): Observable<Notification> {
        return this.notificationSubject.asObservable();
    }

    private showSnackbar(notification: Notification): void {
        const panelClass = `snackbar-${notification.type}`;

        this.snackBar.open(notification.message, 'Cerrar', {
            duration:600000 /* notification.duration || 10000 */,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: [panelClass]
        });
    }
}