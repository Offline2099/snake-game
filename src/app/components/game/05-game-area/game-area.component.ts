import { Component, input, effect } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
// Constants & Enums
import { BLOCK_SIZE_PX } from '../../../constants/game/game-space';
import { GameBlockType } from '../../../constants/game/space-block/game-block-type.enum';
import { GameState } from '../../../constants/game/game-state.enum';
// Interfaces & Types
import { Position } from '../../../types/general/position.interface';
import { Space } from '../../../types/game/space.type';
// Components
import { AssetBlockComponent } from '../../shared/asset-block/asset-block.component';

const MAX_CHANGE_LENGTH: number = 15;

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

  readonly BLOCK_SIZE_PX = BLOCK_SIZE_PX;
  readonly GameBlockType = GameBlockType;
  readonly GameState = GameState;

  space = input.required<Space>();
  gameState = input.required<GameState>();
  latestChange = input.required<number>();
  headPosition = input.required<Position>();

  latestChangeId: number = 0;
  progressChanges: ProgressChange[] = [];

  constructor() {
    effect(() => 
      this.updateProgressChanges(this.gameState(), this.latestChange(), this.headPosition())
    );
  }

  updateProgressChanges(gameState: GameState, latestChange: number, position: Position): void {
    if (gameState === GameState.ready) {
      this.latestChangeId = 0;
      this.progressChanges = [];
      return;
    }
    if (latestChange !== 0) {
      this.latestChangeId++;
      this.progressChanges.push({
        id: this.latestChangeId,
        position: { ...position },
        value: latestChange
      });
    }
    if (this.progressChanges.length > MAX_CHANGE_LENGTH) this.progressChanges.shift();
  }

}
