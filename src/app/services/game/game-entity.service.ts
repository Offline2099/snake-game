import { Injectable } from '@angular/core';
// Constants & Enums
import { GameBlockType } from '../../constants/game/game-block-type.enum';
import { FoodType } from '../../constants/food/food-type.enum';
import { EnemyType } from '../../constants/enemies/enemy-type.enum';
import { ProtectionType } from '../../constants/game/protection-type.enum';
import { EntityParameterId } from '../../constants/level/entity-parameter-id.enum';
import { DEFAULT_FOOD_STATS } from '../../constants/game/default-food-stats';
import { DEFAULT_ENEMY_STATS } from '../../constants/game/default-enemy-stats';
import { FOOD_DATA } from '../../constants/food/food-data';
import { ENEMY_DATA } from '../../constants/enemies/enemy-data';
// Interfaces & Types
import { Position } from '../../types/general/position.interface';
import { GameBlockData } from '../../types/game/space/game-block-data.interface';
import { Game } from '../../types/game/game.interface';
import { Level } from '../../types/level/level.interface';
import { FoodStats } from '../../types/game/stats/food-stats.interface';
import { EnemyStats } from '../../types/game/stats/enemy-stats.interface';
// Services
import { UtilityService } from '../general/utility.service';
import { SpaceService } from '../space.service';
import { GameSpaceService } from './game-space.service';

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

  private readonly spaceExclusionMatch: Record<EntityType, ProtectionType> = {
    [GameBlockType.enemy]: ProtectionType.noEnemySpawn,
    [GameBlockType.food]: ProtectionType.noFoodSpawn
  }

  constructor(
    private utility: UtilityService,
    private spaceService: SpaceService,
    private gameSpace: GameSpaceService
  ) {
    this.foodTypes = Object.values(FoodType).filter(Number) as FoodType[];
    this.enemyTypes = Object.values(EnemyType).filter(Number) as EnemyType[];
  }

  //===========================================================================
  //  Food
  //===========================================================================

  initialFoodStats(level: Level): Record<FoodType, FoodStats> {
    return this.foodTypes.reduce((acc, foodType) => {
      acc[foodType as FoodType] = {
        ...DEFAULT_FOOD_STATS,
        present: this.countInitialEntities(level, this.food(foodType))
      }
      return acc;
    }, {} as Record<FoodType, FoodStats>);
  }

  spawnInitialFood(game: Game, level: Level): void {
    Object.entries(level.settings.food).forEach(([foodType, parameters]) => {
      this.spawnFood(game, level, Number(foodType), parameters[EntityParameterId.initialAmount]);
    });
  }

  spawnFood(game: Game, level: Level, foodType: FoodType, amount: number): void {
    this.spawnEntities(game, level, this.food(foodType), amount);
  }

  processFoodInteraction(game: Game, level: Level, position: Position, foodType: FoodType): void {
    const foodValue: number = FOOD_DATA[foodType].value;
    const spawnAmount: number = level.settings.food[foodType][EntityParameterId.spawnOnInteraction];
    game.delayedGrowth += foodValue - 1;
    this.gameSpace.removeEntity(game, level, position, GameBlockType.food);
    this.spawnFood(game, level, foodType, spawnAmount);
    this.recordFoodInteraction(game, level, foodType);    
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
    return {
      type: GameBlockType.food,
      subType: foodType
    }
  }

  //===========================================================================
  //  Enemies
  //===========================================================================

  initialEnemyStats(level: Level): Record<EnemyType, EnemyStats> {
    return this.enemyTypes.reduce((acc, enemyType) => {
      acc[enemyType as EnemyType] = {
        ...DEFAULT_ENEMY_STATS,
        present: this.countInitialEntities(level, this.enemy(enemyType))
      }
      return acc;
    }, {} as Record<EnemyType, EnemyStats>);
  }

  spawnInitialEnemies(game: Game, level: Level): void {
    Object.entries(level.settings.enemies).forEach(([enemyType, parameters]) => {
      this.spawnEnemies(game, level, Number(enemyType), parameters[EntityParameterId.initialAmount]);
    });
  }

  spawnEnemies(game: Game, level: Level, enemyType: EnemyType, amount: number): void {
    this.spawnEntities(game, level, this.enemy(enemyType), amount);
  }

  processEnemyInteraction(
    game: Game,
    level: Level,
    position: Position,
    enemyType: EnemyType,
    snakeHealth: number
  ): void {
    const damage: number = ENEMY_DATA[enemyType].damage;
    this.recordEnemyInteraction(game, level, enemyType);
    if (damage >= snakeHealth) {
      game.isDefeat = true;
      return;
    }
    const spawnAmount: number = level.settings.enemies[enemyType][EntityParameterId.spawnOnInteraction];
    this.gameSpace.removeEntity(game, level, position, GameBlockType.enemy);
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
    return {
      type: GameBlockType.enemy,
      subType: enemyType
    }
  }

  //===========================================================================
  //  Shared
  //===========================================================================

  private countInitialEntities(level: Level, entity: Entity): number {
    return level.settings.entities.reduce((acc, data) => {
      acc += data.block.type === entity.type  && data.block.subType === entity.subType ? 1 : 0;
      return acc;
    }, 0);
  }

  private spawnEntities(game: Game, level: Level, entity: Entity, amount: number): void {
    [...Array(amount)].forEach(() => {
      const availablePositions: Position[] = 
        this.spaceService.availableSpace(game.space, this.spaceExclusionMatch[entity.type]);
      if (!availablePositions.length) return;
      const position: Position = this.utility.randomFromArray(availablePositions);
      const food: GameBlockData = this.spaceService.createBlock(entity.type, entity.subType);
      this.spaceService.setBlock(game.space, position, food);
      this.gameSpace.protectEntity(game, level, position, entity.type);
      this.recordEntitySpawn(game, entity);
    });
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