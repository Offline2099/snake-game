import { Injectable } from '@angular/core';
// Constants & Enums
import { Direction } from '../constants/general/direction.enum';
import { AREA_SIZE } from '../constants/game/game-area';
import { GameBlockType } from '../constants/game/game-block-type.enum';
import { ProtectionType } from '../constants/game/protection-type.enum';
import { EntityParameterId } from '../constants/level/entity-parameter-id.enum';
import { FoodType } from '../constants/food/food-type.enum';
import { EnemyType } from '../constants/enemies/enemy-type.enum';
import { FOOD_DATA } from '../constants/food/food-data';
import { ENEMY_DATA } from '../constants/enemies/enemy-data';
import { SNAKE_PROTECTION } from '../constants/snake/snake-protection';
import { DEFAULT_STEP_TIME } from '../constants/game/default-step-time';
import { DEFAULT_FOOD_STATS } from '../constants/game/default-food-stats';
import { DEFAULT_ENEMY_STATS } from '../constants/game/default-enemy-stats';
// Interfaces & Types
import { Position } from '../types/general/position.interface';
import { Rectangle } from '../types/general/rectangle.interface';
import { Game } from '../types/game/game.interface';
import { Level } from '../types/level/level.interface';
import { Snake } from '../types/snake/snake.interface.ts';
import { Space } from '../types/game/space/space.type';
import { GameBlockData } from '../types/game/space/game-block-data.interface';
import { Protection } from '../types/game/space/protection.type';
import { Portal } from '../types/general/portal.interface';
import { FoodStats } from '../types/game/stats/food-stats.interface';
import { EnemyStats } from '../types/game/stats/enemy-stats.interface';
// Services
import { SpaceService } from './space.service';
import { SnakeService } from './snake.service';
import { GeometryService } from './geometry.service';
import { UtilityService } from './utility.service';
import { PortalType } from '../constants/portals/portal-type.enum';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(
    private spaceService: SpaceService,
    private snakeService: SnakeService,
    private geometry: GeometryService,
    private utility: UtilityService
  ) {}

  //===========================================================================
  //  Initial Setup
  //===========================================================================

  initialize(snake: Snake, level: Level): Game {
    const game: Game = {
      space: this.spaceService.createSpace(AREA_SIZE, AREA_SIZE),
      isDefeat: false,
      isVictory: false,
      progress: 0,
      stepTime: DEFAULT_STEP_TIME,
      stats: {
        stepsDone: 0,
        elapsedTime: 0,
        food: this.initialFoodStats(level),
        enemies: this.initialEnemyStats(level),
        totalFoodEaten: 0,
        totalFoodValue: 0,
        totalEnemiesHit: 0,
        totalDamageTaken: 0
      },
      portals: [],
      delayedGrowth: 0
    }
    this.setEntities(game, level);
    this.protectPerimeterMargin(game, level);
    this.setSnake(game.space, snake);    
    this.spawnInitialEnemies(game, level);
    this.spawnInitialFood(game, level);
    return game;
  }

  private initialFoodStats(level: Level): Record<FoodType, FoodStats> {
    return this.foodTypes().reduce((acc, foodType) => {
      const foodPresent: number = level.settings.entities.reduce((acc, entity) => {
        acc += entity.block.type === GameBlockType.food && entity.block.subType === foodType ? 1 : 0;
        return acc;
      }, 0);
      acc[foodType as FoodType] = { ...DEFAULT_FOOD_STATS, present: foodPresent };
      return acc;
    }, {} as Record<FoodType, FoodStats>);
  }

  private initialEnemyStats(level: Level): Record<EnemyType, EnemyStats> {
    return this.enemyTypes().reduce((acc, enemyType) => {
      const enemiesPresent: number = level.settings.entities.reduce((acc, entity) => {
        acc += entity.block.type === GameBlockType.enemy  && entity.block.subType === enemyType ? 1 : 0;
        return acc;
      }, 0);
      acc[enemyType as EnemyType] = { ...DEFAULT_ENEMY_STATS, present: enemiesPresent };
      return acc;
    }, {} as Record<EnemyType, EnemyStats>);
  }

  private foodTypes(): FoodType[] {
    return Object.values(FoodType).filter(Number) as FoodType[];
  }

  private enemyTypes(): EnemyType[] {
    return Object.values(EnemyType).filter(Number) as EnemyType[];
  }

  private setEntities(game: Game, level: Level): void {
    level.settings.entities.forEach(entity => {
      this.spaceService.setBlock(game.space, entity.position, entity.block);
      this.protectEntity(game, level, entity.position, entity.block.type);
      if (entity.block.type === GameBlockType.portal && entity.block.portalTo)
        game.portals.push({ entrance: entity.position, exit: entity.block.portalTo });
    });
  }

  //===========================================================================
  //  Game Step
  //===========================================================================

  processStep(game: Game, snake: Snake, level: Level): void {
    if (game.progress >= level.settings.goal) {
      game.isVictory = true;
      return;
    }
    game.stats.stepsDone++;
    game.stats.elapsedTime = Math.floor(game.stepTime * game.stats.stepsDone / 1000);
    const length: number = snake.body.length;
    const positionAhead: Position = 
      this.geometry.shiftPosition(snake.head.currentPosition, snake.direction);
    this.processCollisionDetection(game, positionAhead);
    this.processFoodInteraction(game, level, snake, positionAhead);
    this.processEnemyInteraction(game, level, snake, positionAhead);
    if (game.isDefeat || game.isVictory) return;
    if (snake.body.length === length && game.delayedGrowth > 0) {
      this.snakeService.growSnake(snake);
      game.delayedGrowth--;
    } 
    this.moveSnake(game, level, snake);
  }

  private processCollisionDetection(game: Game, position: Position): void {
    if (this.spaceService.isCollisionAhead(game.space, position)) game.isDefeat = true;
  }

  private updateGameProgress(game: Game, level: Level, change: number): void {
    game.progress += change;
    if (game.progress > level.settings.goal) game.progress = level.settings.goal;
    if (game.progress < 0) game.progress = 0;
  }

  //===========================================================================
  //  Space Protection Management
  //===========================================================================

  private protectionTypes(): ProtectionType[] {
    return Object.values(ProtectionType).filter(Number) as ProtectionType[];
  }

  private protectPerimeterMargin(game: Game, level: Level): void {
    this.protectionTypes().forEach(protectionType => {
      const margin: number = level.settings.perimeterProtection[protectionType];
      this.spaceService.protectPerimeter(game.space, margin, protectionType);
    });
  }

  private protectEntity(game: Game, level: Level, position: Position, blockType: GameBlockType): void {
    this.protectionTypes().forEach(protectionType => {
      const margin: number = level.settings.protectedMargins[blockType]![protectionType];
      this.protectMargin(game.space, position, margin, protectionType);
    });
  }

  private removeEntity(game: Game, level: Level, position: Position, blockType: GameBlockType): void {
    this.setFreeBlock(game.space, level, position);
    this.protectionTypes().forEach(protectionType => {
      const margin: number = level.settings.protectedMargins[blockType]![protectionType];
      this.unprotectMargin(game.space, level, position, margin);
    });
  }

  private protectMargin(space: Space, center: Position, margin: number, type: ProtectionType): void {
    this.spaceService.setMarginProtectionState(space, center, margin, type, true);
  }

  private protectArea(space: Space, area: Rectangle, type: ProtectionType): void {
    this.spaceService.setAreaProtectionState(space, area, type, true);
  }

  private unprotectArea(space: Space, level: Level, area: Rectangle): void {
    this.unprotectPositions(space, level, this.geometry.positionsWithinArea(area));
  }

  private unprotectMargin(space: Space, level: Level, center: Position, margin: number): void {
    this.unprotectPositions(space, level, this.geometry.positionsWithinMargin(center, margin));
  }

  private unprotectPositions(space: Space, level: Level, positions: Position[]): void {
    positions.forEach(position => {
      if (!this.spaceService.isOfType(space, position, GameBlockType.free)) return;
      this.setFreeBlock(space, level, position);
    });
  }

  private setFreeBlock(space: Space, level: Level, position: Position): void {
    for (let entity of level.settings.entities) {
      if (!this.geometry.isSamePosition(position, entity.position)) continue;
      if (entity.block.subType !== PortalType.exit) continue;
      this.spaceService.setBlock(space, position, entity.block);
      return;
    }
    const protection: Protection = this.spaceService.defaultBlock().isProtected;
    this.protectionTypes().forEach(protectionType => {
      const perimeterMargin: number = level.settings.perimeterProtection[protectionType];
      if (this.geometry.isNearPerimeter(this.spaceService.toRectangle(space), position, perimeterMargin)) {
        protection[protectionType] = true;
        return;
      }
      [GameBlockType.obstacle, GameBlockType.portal, GameBlockType.enemy, GameBlockType.food].forEach(blockType => {
        const margin: number = level.settings.protectedMargins[blockType]![protectionType];
        if (this.spaceService.isBlockNearby(space, position, blockType, margin)) {
          protection[protectionType] = true;
        }
      });
    });
    const block = { 
      ...this.spaceService.defaultBlock(),
      isProtected: { ...protection }
    }
    this.spaceService.setBlock(space, position, block);
  }

  //===========================================================================
  //  Food
  //===========================================================================
  
  private spawnInitialFood(game: Game, level: Level): void {
    Object.entries(level.settings.food).forEach(([type, parameters]) => {
      this.spawnFood(game, level, Number(type), parameters[EntityParameterId.initialAmount]);
    });
  }

  private spawnFood(game: Game, level: Level, foodType: FoodType, amount: number): void {
    [...Array(amount)].forEach(() => {
      const availablePositions: Position[] = 
        this.spaceService.availableSpace(game.space, ProtectionType.noFoodSpawn);
      if (!availablePositions.length) return;
      const position = this.utility.randomFromArray(availablePositions);
      const food: GameBlockData = this.spaceService.createBlock(GameBlockType.food, foodType);
      this.spaceService.setBlock(game.space, position, food);
      this.protectEntity(game, level, position, GameBlockType.food);
      game.stats.food[foodType].present++;
    });
  }

  private processFoodInteraction(game: Game, level: Level, snake: Snake, position: Position): void {
    const foodType: FoodType | null = this.spaceService.foodTypeAhead(game.space, position);
    if (foodType === null) return;
    game.stats.food[foodType].present--;
    game.stats.food[foodType].consumed++;
    game.stats.food[foodType].valueConsumed += FOOD_DATA[foodType].value;
    game.stats.totalFoodEaten++;
    game.stats.totalFoodValue += FOOD_DATA[foodType].value;
    game.delayedGrowth += FOOD_DATA[foodType].value - 1;
    this.removeEntity(game, level, position, GameBlockType.food);
    const amount: number = level.settings.food[foodType][EntityParameterId.spawnOnInteraction];
    this.spawnFood(game, level, foodType, amount);
    this.snakeService.growSnake(snake);
    this.updateGameProgress(game, level, FOOD_DATA[foodType].value);
  }

  //===========================================================================
  //  Enemies
  //===========================================================================

  private spawnInitialEnemies(game: Game, level: Level): void {
    Object.entries(level.settings.enemies).forEach(([type, parameters]) => {
      this.spawnEnemies(game, level, Number(type), parameters[EntityParameterId.initialAmount]);
    });
  }

  private spawnEnemies(game: Game, level: Level, enemyType: EnemyType, amount: number): void {
    [...Array(amount)].forEach(() => {
      const availablePositions: Position[] = 
        this.spaceService.availableSpace(game.space, ProtectionType.noEnemySpawn);
      if (!availablePositions.length) return;
      const position = this.utility.randomFromArray(availablePositions);
      const enemy: GameBlockData = this.spaceService.createBlock(GameBlockType.enemy, enemyType);
      this.spaceService.setBlock(game.space, position, enemy);
      this.protectEntity(game, level, position, GameBlockType.enemy);
      game.stats.enemies[enemyType].present++;
    });
  }

  private processEnemyInteraction(game: Game, level: Level, snake: Snake,  position: Position): void {
    const enemyType: EnemyType | null = this.spaceService.enemyTypeAhead(game.space, position);
    if (enemyType === null) return;
    const damage: number = ENEMY_DATA[enemyType].damage;
    const lengthBeforeDamage: number = snake.body.length;
    game.stats.enemies[enemyType].present--;
    game.stats.enemies[enemyType].hit++;
    game.stats.enemies[enemyType].damageTaken += damage;
    game.stats.totalEnemiesHit++;
    game.stats.totalDamageTaken += damage;
    const amount: number = level.settings.enemies[enemyType][EntityParameterId.spawnOnInteraction];
    this.spawnEnemies(game, level, enemyType, amount);
    this.reduceSnake(game.space, level, snake, damage);
    this.updateGameProgress(game, level, -damage);
    if (damage >= lengthBeforeDamage) {
      game.isDefeat = true;
      return;
    }
    this.removeEntity(game, level, position, GameBlockType.enemy);
  }

  //===========================================================================
  //  Snake
  //===========================================================================

  changeSnakeDirection(game: Game, snake: Snake, direction: Direction): void {
    if (snake.head.currentDirection === this.geometry.oppositeDirection(direction)) return;
    const nextHeadPosition: Position = 
      this.geometry.shiftPosition(snake.head.currentPosition, direction);
    if (this.spaceService.isCollisionAhead(game.space, nextHeadPosition)) return;
    snake.direction = direction;
  }

  changeSnakeDirectionByKey(game: Game, snake: Snake, key: string): void {
    switch (key) {
      case 'ArrowUp':
        this.changeSnakeDirection(game, snake, Direction.up)
        break;
      case 'ArrowDown':
        this.changeSnakeDirection(game, snake, Direction.down)
        break;
      case 'ArrowLeft':
        this.changeSnakeDirection(game, snake, Direction.left)
        break;
      case 'ArrowRight':
        this.changeSnakeDirection(game, snake, Direction.right)
        break;
    }
  }

  private setSnake(space: Space, snake: Snake): void {
    this.setSnakeHead(space, snake);
    this.setSnakeBody(space, snake);
    this.setSnakeTail(space, snake);
    this.protectSnake(space, snake);
  }

  private setSnakeBlock(space: Space, position: Position, block: GameBlockData): void {
    if (this.spaceService.isOfType(space, position, GameBlockType.portal, PortalType.entrance)) return;
    this.spaceService.setBlock(space, position, block);
  }

  private setSnakeHead(space: Space, snake: Snake): void {
    const head: GameBlockData = 
      this.spaceService.createBlock(GameBlockType.snakeHead, snake.head.currentDirection);
    this.setSnakeBlock(space, snake.head.currentPosition, head);
  }

  private setSnakeBody(space: Space, snake: Snake): void {
    snake.body.forEach(block => {
      const blockData: GameBlockData = 
        this.spaceService.createBlock(GameBlockType.snakeBody, block.type);
      this.setSnakeBlock(space, block.currentPosition, blockData);
    });
  }

  private setSnakeTail(space: Space, snake: Snake): void {
    const tail: GameBlockData = 
      this.spaceService.createBlock(GameBlockType.snakeTail, snake.tail.currentDirection);
    this.setSnakeBlock(space, snake.tail.currentPosition, tail);
  }

  private protectSnake(space: Space, snake: Snake): void {
    [snake.head, ...snake.body, snake.tail].forEach(block => 
      this.protectMargin(space, block.currentPosition, SNAKE_PROTECTION.margin, ProtectionType.noEnemySpawn)
    );
    const path: Rectangle = this.snakeService.snakePathAhead(snake, SNAKE_PROTECTION.pathLength);
    this.protectArea(space, path, ProtectionType.noEnemySpawn);
  }

  private moveSnake(game: Game, level: Level, snake: Snake): void {
    if (snake.direction !== snake.head.currentDirection) {
      const path: Rectangle = this.snakeService.snakePathAhead(snake, SNAKE_PROTECTION.pathLength);
      this.unprotectArea(game.space, level, path);
    }
    this.unprotectMargin(game.space, level, snake.tail.currentPosition, SNAKE_PROTECTION.pathLength);
    this.snakeService.moveSnake(snake, game.portals);
    this.setFreeBlock(game.space, level, snake.tail.previousPosition);
    this.setSnake(game.space, snake);
  }

  private reduceSnake(space: Space, level: Level, snake: Snake, amount: number): void {
    const positionsToCut: Position[] = [
      ...snake.body.slice(Math.max(snake.body.length - 1 - amount, 1))
        .map(block => block.currentPosition),
      snake.tail.currentPosition
    ];
    positionsToCut.forEach(position => {
      this.setFreeBlock(space, level, position);
      this.unprotectMargin(space, level, position, SNAKE_PROTECTION.margin);
    });
    this.snakeService.takeDamage(snake, amount);
    this.setSnake(space, snake);
  }

}


