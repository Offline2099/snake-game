import { Component, input, output } from '@angular/core';
import { Game } from '../../../types/game/game.interface';

@Component({
  selector: 'app-game-controls',
  imports: [],
  templateUrl: './game-controls.component.html',
  styleUrl: './game-controls.component.scss',
})
export class GameControlsComponent {

  game = input.required<Game>();

  start = output<void>();
  pause = output<void>();
  reset = output<void>();
  toMenu = output<void>();

  startGame(): void {
    this.start.emit();
  }

  pauseGame(): void {
    this.pause.emit();
  }

  resetGame(): void {
    this.reset.emit();
  }

  showMenu(): void {
    this.toMenu.emit();
  }

}
