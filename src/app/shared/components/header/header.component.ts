import { Component, OnDestroy, OnInit } from "@angular/core";
import { AuthService } from "../../../core/services/auth.service";
import { Router, RouterModule } from "@angular/router";
import { MatIcon } from "@angular/material/icon";
import { Observable, Subscription } from "rxjs";
import { CommonModule } from "@angular/common";
import { User } from "../../../core/models/auth";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatMenuModule } from '@angular/material/menu';
import { ImageNotFoundPipe } from "../../pipes/image-not-found.pipe";


@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: true,
    imports: [MatIcon, CommonModule, RouterModule, MatTooltipModule, MatMenuModule, ImageNotFoundPipe]
})
export class HeaderComponent implements OnInit, OnDestroy {
    public isLoggedIn$: Observable<any> = new Observable<any>();
    public currentUser$: Observable<User | null> = new Observable<User | null>();
    public avatarError: boolean = false;
    public currentAvatarUrl: string = '';
    public subscriptions: Subscription = new Subscription();

    constructor(private authService: AuthService, private router: Router) {
        this.isLoggedIn$ = this.authService.isAuthenticated$;
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    ngOnInit(): void {
        this.currentUser$ = this.authService.currentUser$;

        // Suscribirse para detectar cambios en el usuario
        this.subscriptions = this.currentUser$.subscribe(user => {
            if (user?.avatar) {
                this.currentAvatarUrl = user.avatar;
                this.avatarError = false;

                // Precargar la imagen para verificar si existe
                // this.preloadImage(user.avatar);
            }
        });
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
        this.subscriptions.unsubscribe();
    }

    // // Precargar imagen para verificar si existe
    // preloadImage(url: string): void {
    //     const img = new Image();
    //     img.onload = () => {
    //         console.log('Avatar existe y se puede cargar:', url);
    //         this.avatarError = false;
    //     };
    //     img.onerror = () => {
    //         console.warn('Avatar no encontrado en el servidor:', url);
    //         this.avatarError = true;
    //     };
    //     img.src = url;
    // }

    // Manejar error de carga de imagen
    // handleImageError(event: Event): void {
    //     const img = event.target as HTMLImageElement;
    //     console.warn('Error cargando avatar, usando imagen por defecto');
    //     this.avatarError = true;

    //     // Cambiar a avatar por defecto
    //     img.src = 'img/default-avatar.jpg';

    //     // Prevenir bucles de error
    //     img.onerror = null;
    // }

    // // Obtener la URL correcta del avatar
    // getAvatarUrl(): string {
    //     if (this.avatarError || !this.currentAvatarUrl) {
    //         return 'img/default-avatar.jpg';
    //     }
    //     return this.currentAvatarUrl;
    // }

}