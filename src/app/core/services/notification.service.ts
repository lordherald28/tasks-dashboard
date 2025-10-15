import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject } from 'rxjs';
import { Notification } from '../models/notification';

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

    getNotifications(): Observable<Notification> {
        return this.notificationSubject.asObservable();
    }

    private showSnackbar(notification: Notification): void {
        const panelClass = ['snackbar-custom-theme', `snackbar-${notification.type}`];

        this.snackBar.open(notification.message, 'Cerrar', {
            duration: notification.duration || 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: panelClass
        });
    }
}