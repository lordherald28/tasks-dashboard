import { Component } from "@angular/core";
import { AuthService } from "../../../core/services/auth.service";
import { Router } from "@angular/router";
import { MatIcon } from "@angular/material/icon";
import { Observable, Subscription } from "rxjs";


@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: true,
    imports: [MatIcon]
})
export class HeaderComponent {
    public isLoggedIn: boolean = false;
    private isLoggedIn$: Observable<any> = new Observable<any>();
    private subscription$: Subscription = new Subscription();

    constructor(private authService: AuthService, private router: Router) {
        this.isLoggedIn$ = this.authService.isAuthenticated$;
        this.subscription$ = this.isLoggedIn$.subscribe(isLoggedIn => {
            this.isLoggedIn = isLoggedIn;
        });
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
        this.isLoggedIn = false;
        this.subscription$.unsubscribe();
    }

}