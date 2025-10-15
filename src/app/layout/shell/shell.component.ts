import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { OverlayContainer } from '@angular/cdk/overlay';
import { MatIcon } from "@angular/material/icon";
import { RouterLink } from "../../../../node_modules/@angular/router/index";
import { HeaderComponent } from "../../shared/components/header/header.component";

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, MatSlideToggleModule, HeaderComponent],
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

}
