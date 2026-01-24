import { Component, input, effect } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
// Constants & Enums
import { AREA_SIZE, BLOCK_SIZE } from '../../../constants/game/game-area';
import { GameState } from '../../../constants/game/game-state.enum';
import { GameBlockType } from '../../../constants/game/game-block-type.enum';
// Interfaces & Types
import { Position } from '../../../types/general/position.interface';
import { Space } from '../../../types/game/space/space.type';
// Components
import { AssetBlockComponent } from '../../shared/asset-block/asset-block.component';

const MAX_CHANGES_LENGTH: number = 15;

interface ProgressChange {
  id: number;
  position: Position;
  value: number;
}

@Component({
  selector: 'app-game-area',
  imports: [NgClass, NgStyle, AssetBlockComponent],
  templateUrl: './game-area.component.html',
  styleUrl: './game-area.component.scss',
})
export class GameAreaComponent {

  readonly AREA_SIZE = AREA_SIZE;
  readonly BLOCK_SIZE = BLOCK_SIZE;
  readonly GameState = GameState;
  readonly GameBlockType = GameBlockType;

  space = input.required<Space>();
  gameState = input.required<GameState>();
  progress = input.required<number>();
  headPosition = input.required<Position>();

  previousProgress!: number;
  latestChange!: number;
  latestChangeId!: number;
  progressChanges!: ProgressChange[];

  constructor() {
    this.resetProgressChanges();
    effect(() => 
      this.updateProgressChanges(this.gameState(), this.progress(), this.headPosition())
    );
  }

  resetProgressChanges(): void {
    this.previousProgress = 0;
    this.latestChange = 0;
    this.latestChangeId = 0;
    this.progressChanges = [];
  }

  updateProgressChanges(gameState: GameState, progress: number, position: Position): void {
    if (gameState === GameState.ready) {
      this.resetProgressChanges();
      return;
    }
    this.latestChange = progress - this.previousProgress;
    this.previousProgress = progress;
    if (this.latestChange !== 0) {
      this.latestChangeId++;
      this.progressChanges.push({
        id: this.latestChangeId,
        position: { ...position },
        value: this.latestChange
      });
    }
    if (this.progressChanges.length > MAX_CHANGES_LENGTH)
      this.progressChanges.shift();
  }

}
