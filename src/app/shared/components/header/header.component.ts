import { Component, OnInit } from "@angular/core";
import { AuthService } from "../../../core/services/auth.service";
import { Router, RouterModule } from "@angular/router";
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { Observable } from "rxjs";
import { CommonModule } from "@angular/common";
import { User } from "../../../core/models/auth";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatMenuModule } from '@angular/material/menu';
import { ImageNotFoundPipe } from "../../pipes/image-not-found.pipe";
import { MatButtonModule } from "@angular/material/button";


@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: true,
    imports: [MatIcon, CommonModule, RouterModule, MatTooltipModule, MatMenuModule, ImageNotFoundPipe, MatButtonModule, MatIconModule]
})
export class HeaderComponent implements OnInit {
    public isLoggedIn$: Observable<any> = new Observable<any>();
    public currentUser$: Observable<User | null> = new Observable<User | null>();

    constructor(private authService: AuthService, private router: Router) {
        this.isLoggedIn$ = this.authService.isAuthenticated$;
    }



    ngOnInit(): void {
        this.currentUser$ = this.authService.currentUser$;
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    // Manejo seguro de errores de imagen
    handleImageError(event: Event): any {
        // Verificar que el target existe y es una imagen
        if (!event.target || !(event.target instanceof HTMLImageElement)) {
            return;
        }

        const img = event.target as HTMLImageElement;
        console.warn('Error cargando avatar, usando imagen por defecto');

        // Cambiar a avatar por defecto de forma segura
        img.src = 'img/default-avatar.jpg';

        // Prevenir bucles de error eliminando el event handler
        img.onerror = null;
    }

}