import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, MatSlideToggleModule],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent {
  toggleDark(on: boolean) { document.body.classList.toggle('dark-theme', on); }
}
