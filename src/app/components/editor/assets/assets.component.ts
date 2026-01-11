import { Component, model } from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
// Constants & Enums
import { AssetPlacingModeId } from '../../../constants/editor/asset-placing-mode-id.enum';
import { ASSET_PLACING_MODES } from '../../../constants/editor/asset-placing-modes';
import { GameBlockType } from '../../../constants/game/game-block-type.enum';
import { DEFAULT_GAME_BLOCK } from '../../../constants/game/delault-game-block';
import { ObstacleType } from '../../../constants/obstacles/obstacle-type.enum';
import { EnemyType } from '../../../constants/enemies/enemy-type.enum';
import { FoodType } from '../../../constants/food/food-type.enum';
import { ENEMY_DATA } from '../../../constants/enemies/enemy-data';
import { FOOD_DATA } from '../../../constants/food/food-data';
// Interfaces & Types
import { GameBlockData } from '../../../types/game/space/game-block-data.interface';
// Components
import { AssetBlockComponent } from '../../shared/asset-block/asset-block.component';
import { GameBlockSubType } from '../../../types/game/space/game-block-subtype.type';

@Component({
  selector: 'app-assets',
  imports: [NgClass, NgTemplateOutlet, AssetBlockComponent],
  templateUrl: './assets.component.html',
  styleUrl: './assets.component.scss',
})
export class AssetsComponent {

  readonly ASSET_PLACING_MODES = ASSET_PLACING_MODES;

  selectedAsset = model.required<GameBlockData | null>();
  selectedModeId= model.required<AssetPlacingModeId>();

  obstacles: GameBlockData[] = Object.values(ObstacleType).filter(Number)
    .map(obstacleType => this.gameBlockData(GameBlockType.obstacle, Number(obstacleType)));

  enemies: GameBlockData[] = Object.keys(ENEMY_DATA)
    .map(enemyType => this.gameBlockData(GameBlockType.enemy, Number(enemyType)));

  food: GameBlockData[] = Object.keys(FOOD_DATA)
    .map(foodType => this.gameBlockData(GameBlockType.food, Number(foodType)));

  gameBlockData(type: GameBlockType, subType: GameBlockSubType): GameBlockData {
    return {
      type, subType, isProtected: { ...DEFAULT_GAME_BLOCK.isProtected }
    }
  }

  selectAsset(asset: GameBlockData): void {
    this.selectedAsset.set(asset);    
  }

  selectMode(modeId: AssetPlacingModeId): void {
    this.selectedModeId.set(modeId);
  }

}
