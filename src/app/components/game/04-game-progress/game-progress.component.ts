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
  latestChange = input.required<number>();
  goal = input.required<number>();

  percentage = computed(() => Math.floor(100 * this.progress() / this.goal()));
  latestProgress: number = 0;
  
  constructor() {
    effect(() => {
      if (this.latestChange()) this.latestProgress = this.latestChange();
    });
  }

}
