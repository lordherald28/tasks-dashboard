import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  // template: `
  //   <header class="toolbar">Tasks Dashboard</header>
  //   <main class="container"><router-outlet /></main>
  // `,
  // styles: [`
  //   .toolbar { padding:12px 16px; font-weight:600; border-bottom:1px solid #eee; }
  //   .container { padding:16px; max-width:1024px; margin:0 auto; }
  // `]
})
export class ShellComponent {}
