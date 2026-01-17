import { Component, input, computed } from '@angular/core';
// Constants & Enums
import { GameBlockType } from '../../../constants/game/game-block-type.enum';
import { FoodType } from '../../../constants/food/food-type.enum';
import { EnemyType } from '../../../constants/enemies/enemy-type.enum';
import { FOOD_DATA } from '../../../constants/food/food-data';
import { ENEMY_DATA } from '../../../constants/enemies/enemy-data';
import { EntityParameterId } from '../../../constants/level/entity-parameter-id.enum';
// Interfaces & Types
import { Game } from '../../../types/game/game.interface';
import { Level } from '../../../types/level/level.interface';
import { Snake } from '../../../types/snake/snake.interface.ts';
// Components
import { AssetBlockComponent } from '../../shared/asset-block/asset-block.component';
// Pipes
import { SecondsAsTimePipe } from '../../../pipes/seconds-as-time.pipe';

@Component({
  selector: 'app-game-stats',
  imports: [SecondsAsTimePipe, AssetBlockComponent],
  templateUrl: './game-stats.component.html',
  styleUrl: './game-stats.component.scss',
})
export class GameStatsComponent {

  readonly GameBlockType = GameBlockType;
  readonly FOOD_DATA = FOOD_DATA;
  readonly ENEMY_DATA = ENEMY_DATA;

  game = input.required<Game>();
  level = input.required<Level>();
  snake = input.required<Snake>();

  levelHasEnemies = computed<boolean>(() => 
    Object.values(this.game().stats.enemies).reduce((acc, data) => {
      acc += data.present + data.hit;
      return acc;
    }, 0) > 0
  );

  foodTypes: FoodType[];
  enemyTypes: EnemyType[];

  constructor() {
    this.foodTypes = Object.values(FoodType).filter(Number) as FoodType[];
    this.enemyTypes = Object.values(EnemyType).filter(Number) as EnemyType[];
  }

}
