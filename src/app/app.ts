import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  isFullScreen: boolean = false;

  minimize(): void {
    window.electron.minimize();
  }

  toggleFullScreen(): void {
    this.isFullScreen = !this.isFullScreen;
    window.electron.toggleFullscreen();
  }

  closeApp(): void {
    window.electron.close();
  }
  
}
