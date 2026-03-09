import { Component, input, computed } from '@angular/core';
// Constants & Enums
import { GameBlockType } from '../../../constants/game/space-block/game-block-type.enum';
import { FoodType } from '../../../constants/game/food/food-type.enum';
import { EnemyType } from '../../../constants/game/enemies/enemy-type.enum';
import { FOOD_DATA } from '../../../constants/game/food/food-data';
import { ENEMY_DATA } from '../../../constants/game/enemies/enemy-data';
// Interfaces & Types
import { Game } from '../../../types/game/game.interface';
// Components
import { AssetBlockComponent } from '../../shared/asset-block/asset-block.component';
// Pipes
import { SecondsAsTimePipe } from '../../../pipes/seconds-as-time.pipe';
// Services
import { GameBlockService } from '../../../services/game/game-block.service';

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

  levelHasEnemies = computed<boolean>(() => 
    Object.values(this.game().stats.enemies).reduce((acc, data) => {
      acc += data.present + data.hit;
      return acc;
    }, 0) > 0
  );

  foodTypes: FoodType[];
  enemyTypes: EnemyType[];

  constructor(private gameBlock: GameBlockService) {
    this.foodTypes = this.gameBlock.allFoodTypes();
    this.enemyTypes = this.gameBlock.allEnemyTypes();
  }

}
