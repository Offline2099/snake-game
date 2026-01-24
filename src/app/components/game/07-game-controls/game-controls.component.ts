import { Component, input, computed, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { GameState } from '../../../constants/game/game-state.enum';
import { Game } from '../../../types/game/game.interface';
import { Level } from '../../../types/level/level.interface';
import { SecondsAsTimePipe } from '../../../pipes/seconds-as-time.pipe';

@Component({
  selector: 'app-game-controls',
  imports: [NgClass,SecondsAsTimePipe],
  templateUrl: './game-controls.component.html',
  styleUrl: './game-controls.component.scss',
})
export class GameControlsComponent {

  readonly GameState = GameState;

  game = input.required<Game>();
  level = input.required<Level>();
  isLastLevel = input.required<boolean>();

  start = output<void>();
  pause = output<void>();
  reset = output<void>();
  toMenu = output<void>();

  isNewBestAttempt = computed<boolean>(() => 
    this.game().state === GameState.defeat && this.game().progress > this.bestAttempt
  );
  isNewBestTime = computed<boolean>(() => 
    this.bestAttempt === this.level().settings.goal && // is not the 1st victory
      this.game().state === GameState.victory && this.game().stats.elapsedTime < this.bestTime
  );

  bestAttempt: number = 0;
  bestTime: number = 0;

  ngOnInit(): void {
    this.updateBestScore();
  }

  startGame(): void {
    this.start.emit();
  }

  pauseGame(): void {
    this.pause.emit();
  }

  resetGame(): void {
    this.reset.emit();
    this.updateBestScore();
  }

  showMenu(): void {
    this.toMenu.emit();
  }

  updateBestScore(): void {
    this.bestAttempt = this.level().progression.bestProgress;
    this.bestTime = this.level().progression.bestTime;
  }

}
