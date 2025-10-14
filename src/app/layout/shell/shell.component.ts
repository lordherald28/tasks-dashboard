import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { OverlayContainer } from '@angular/cdk/overlay';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, MatSlideToggleModule, MatIcon],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent {
  constructor(private overlay: OverlayContainer) { }
  // toggleDark(on: boolean) {
  //   document.body.classList.toggle('dark-theme', on);
  //   const overlayEl = this.overlay.getContainerElement();
  //   overlayEl.classList.toggle('dark-theme', on);
  // }

  logout() {
    // lógica logout: limpiar estado, redirigir a login, etc.
    console.log('Logout clicked');
  }
}
