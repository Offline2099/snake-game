import { Component, input, computed, effect } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { GameState } from '../../../constants/game/game-state.enum';

@Component({
  selector: 'app-game-progress',
  imports: [NgClass, NgStyle],
  templateUrl: './game-progress.component.html',
  styleUrl: './game-progress.component.scss',
})
export class GameProgressComponent {

  readonly GameState = GameState;

  gameState = input.required<GameState>();
  progress = input.required<number>();
  goal = input.required<number>();

  percentage = computed(() => Math.floor(100 * this.progress() / this.goal()));

  previousProgress: number = 0;
  latestChange: number = 0;

  constructor() {
    effect(() => {
      this.latestChange = this.progress() - this.previousProgress;
      this.previousProgress = this.progress();
    });
  }

}
