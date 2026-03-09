import { Injectable } from '@angular/core';
// Constants & Enums
import { GameState } from '../../constants/game/game-state.enum';
import { GameBlockType } from '../../constants/game/space-block/game-block-type.enum';
import { FoodType } from '../../constants/game/food/food-type.enum';
import { EnemyType } from '../../constants/game/enemies/enemy-type.enum';
import { FOOD_DATA } from '../../constants/game/food/food-data';
import { ENEMY_DATA } from '../../constants/game/enemies/enemy-data';
import { DEFAULT_FOOD_STATS } from '../../constants/game/stats/default-food-stats';
import { DEFAULT_ENEMY_STATS } from '../../constants/game/stats/default-enemy-stats';
import { EntityParameterId as Parameter } from '../../constants/level/entity-parameter-id.enum';
// Interfaces & Types
import { Position } from '../../types/general/position.interface';
import { Level } from '../../types/level/level.interface';
import { Game } from '../../types/game/game.interface';
import { GameBlock } from '../../types/game/space-block/game-block.interface';
import { FoodStats } from '../../types/game/stats/food-stats.interface';
import { EnemyStats } from '../../types/game/stats/enemy-stats.interface';
import { ProtectionType } from '../../constants/game/space-protection/protection-type.enum';
// Services
import { GameBlockService } from './game-block.service';
import { GameSnakeService } from './game-snake.service';
import { SpaceService } from './space.service';
import { LevelService } from '../level/level.service';

type EntityType = GameBlockType.enemy | GameBlockType.food;

interface Entity {
  type: EntityType;
  subType: EnemyType | FoodType;
}

@Injectable({
  providedIn: 'root'
})
export class GameEntityService {

  private readonly foodTypes: FoodType[];
  private readonly enemyTypes: EnemyType[];

  private readonly protectionMatch: Record<EntityType, ProtectionType> = {
    [GameBlockType.enemy]: ProtectionType.noEnemySpawn,
    [GameBlockType.food]: ProtectionType.noFoodSpawn
  };

  constructor(
    private gameBlock: GameBlockService,
    private gameSnake: GameSnakeService,
    private spaceService: SpaceService,
    private levelService: LevelService
  ) {
    this.foodTypes = this.gameBlock.allFoodTypes();
    this.enemyTypes = this.gameBlock.allEnemyTypes();
  }

  //===========================================================================
  //  Food
  //===========================================================================

  initialFoodStats(level: Level): Record<FoodType, FoodStats> {
    return this.foodTypes.reduce((acc, foodType) => {
      acc[foodType as FoodType] = {
        ...DEFAULT_FOOD_STATS,
        present: this.levelService.countEntities(level, this.food(foodType))
      };
      return acc;
    }, {} as Record<FoodType, FoodStats>);
  }

  spawnInitialFood(game: Game, level: Level): void {
    Object.entries(level.settings.food).forEach(([foodType, parameters]) => 
      this.spawnFood(game, level, Number(foodType), parameters[Parameter.initialAmount])
    );
  }

  spawnFood(game: Game, level: Level, foodType: FoodType, amount: number): void {
    this.spawnEntities(game, level, this.food(foodType), amount);
  }

  processFoodInteraction(game: Game, level: Level, position: Position, food: GameBlock): void {
    const foodType: FoodType = food.subType as FoodType;
    const foodValue: number = FOOD_DATA[foodType].value;
    const spawnAmount: number = level.settings.food[foodType][Parameter.spawnOnInteraction];
    this.recordFoodInteraction(game, level, foodType);
    this.gameSnake.growSnake(game.snake);
    game.delayedGrowth += foodValue - 1;
    this.spaceService.removeEntity(game.space, level, position, GameBlockType.food);
    this.spawnFood(game, level, foodType, spawnAmount);
  }

  private recordFoodInteraction(game: Game, level: Level, foodType: FoodType): void {
    const foodValue: number = FOOD_DATA[foodType].value
    game.stats.food[foodType].present--;
    game.stats.food[foodType].consumed++;
    game.stats.food[foodType].valueConsumed += foodValue;
    game.stats.totalFoodEaten++;
    game.stats.totalFoodValue += foodValue;
    this.updateGameProgress(game, level, foodValue);
  }

  private food(foodType: FoodType): Entity {
    return this.gameBlock.food(foodType) as Entity;
  }

  //===========================================================================
  //  Enemies
  //===========================================================================

  initialEnemyStats(level: Level): Record<EnemyType, EnemyStats> {
    return this.enemyTypes.reduce((acc, enemyType) => {
      acc[enemyType as EnemyType] = {
        ...DEFAULT_ENEMY_STATS,
        present: this.levelService.countEntities(level, this.enemy(enemyType))
      };
      return acc;
    }, {} as Record<EnemyType, EnemyStats>);
  }

  spawnInitialEnemies(game: Game, level: Level): void {
    Object.entries(level.settings.enemies).forEach(([enemyType, parameters]) => 
      this.spawnEnemies(game, level, Number(enemyType), parameters[Parameter.initialAmount])
    );
  }

  spawnEnemies(game: Game, level: Level, enemyType: EnemyType, amount: number): void {
    this.spawnEntities(game, level, this.enemy(enemyType), amount);
  }

  processEnemyInteraction(game: Game, level: Level, position: Position, enemy: GameBlock): void {
    const enemyType: EnemyType = enemy.subType as EnemyType;
    const damage: number = ENEMY_DATA[enemyType].damage;
    const snakeHealth: number = game.snake.body.length + game.delayedGrowth;
    this.recordEnemyInteraction(game, level, enemyType);
    if (damage >= game.snake.body.length) {
      const overkill: number = damage - game.snake.body.length + 1;
      game.delayedGrowth = Math.max(0, game.delayedGrowth - overkill);
    }
    this.gameSnake.reduceSnake(game.space, game.snake, level, damage);
    if (damage >= snakeHealth) {
      game.state = GameState.defeat;
      return;
    }
    const spawnAmount: number = level.settings.enemies[enemyType][Parameter.spawnOnInteraction];
    this.spaceService.removeEntity(game.space, level, position, GameBlockType.enemy);
    this.spawnEnemies(game, level, enemyType, spawnAmount);
  }

  private recordEnemyInteraction(game: Game, level: Level, enemyType: EnemyType): void {
    const damage: number = ENEMY_DATA[enemyType].damage;
    game.stats.enemies[enemyType].present--;
    game.stats.enemies[enemyType].hit++;
    game.stats.enemies[enemyType].damageTaken += damage;
    game.stats.totalEnemiesHit++;
    game.stats.totalDamageTaken += damage;
    this.updateGameProgress(game, level, -damage);
  }

  private enemy(enemyType: EnemyType): Entity {
    return this.gameBlock.enemy(enemyType) as Entity;
  }

  //===========================================================================
  //  Shared
  //===========================================================================

  private spawnEntities(game: Game, level: Level, entity: Entity, amount: number): void {
    for (let i = 0; i < amount; i++) {
      const position: Position | null = 
        this.spaceService.randomFreePosition(game.space, this.protectionMatch[entity.type]);
      if (!position) break;
      this.spaceService.setBlock(game.space, position, entity);
      this.spaceService.protectEntity(game.space, level, position, entity.type);
      this.recordEntitySpawn(game, entity);
    }
  }

  private recordEntitySpawn(game: Game, entity: Entity): void {
    switch (entity.type) {
      case GameBlockType.food:
        game.stats.food[entity.subType as FoodType].present++;
        break;
      case GameBlockType.enemy:
        game.stats.enemies[entity.subType as EnemyType].present++;
        break;
    }
  }

  private updateGameProgress(game: Game, level: Level, change: number): void {
    game.progress += change;
    if (game.progress > level.settings.goal) game.progress = level.settings.goal;
    if (game.progress < 0) game.progress = 0;
  }

}