import { Component, ChangeDetectorRef, input } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { AREA_SIZE, BLOCK_SIZE } from '../../../constants/game/game-area';
import { DEFAULT_STEP_TIME } from '../../../constants/game/default-step-time';
import { GameBlockType } from '../../../constants/game/game-block-type.enum';
import { Game } from '../../../types/game/game.interface';
import { AssetBlockComponent } from '../../shared/asset-block/asset-block.component';

@Component({
  selector: 'app-game-area',
  imports: [NgClass, NgStyle, AssetBlockComponent],
  templateUrl: './game-area.component.html',
  styleUrl: './game-area.component.scss',
})
export class GameAreaComponent {

  readonly AREA_SIZE = AREA_SIZE;
  readonly BLOCK_SIZE = BLOCK_SIZE;
  readonly GameBlockType = GameBlockType;

  game = input.required<Game>();

  constructor(private cdr: ChangeDetectorRef) {
    interval(DEFAULT_STEP_TIME).pipe(takeUntilDestroyed()).subscribe(() => this.cdr.markForCheck());
  }

}
