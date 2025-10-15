import { Component, OnInit } from "@angular/core";
import { AuthService } from "../../../core/services/auth.service";
import { Router, RouterModule } from "@angular/router";
import { MatIcon } from "@angular/material/icon";
import { Observable } from "rxjs";
import { CommonModule } from "@angular/common";
import { User } from "../../../core/models/auth";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatMenuModule } from '@angular/material/menu';


@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: true,
    imports: [MatIcon, CommonModule, RouterModule, MatTooltipModule, MatMenuModule]
})
export class HeaderComponent implements OnInit {
    public isLoggedIn$: Observable<any> = new Observable<any>();
    public currentUser$: Observable<User | null> = new Observable<User | null>();

    constructor(private authService: AuthService, private router: Router) {
        this.isLoggedIn$ = this.authService.isAuthenticated$;
    }

    ngOnInit(): void {
        this.currentUser$ = this.authService.currentUser$
    }
    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }

}