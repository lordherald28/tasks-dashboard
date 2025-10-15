import { Component } from "@angular/core";
import { AuthService } from "../../../core/services/auth.service";
import { Router, RouterModule } from "@angular/router";
import { MatIcon } from "@angular/material/icon";
import { Observable } from "rxjs";
import { CommonModule } from "@angular/common";


@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: true,
    imports: [MatIcon, CommonModule, RouterModule]
})
export class HeaderComponent {
    public isLoggedIn$: Observable<any> = new Observable<any>();

    constructor(private authService: AuthService, private router: Router) {
        this.isLoggedIn$ = this.authService.isAuthenticated$;
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }

}