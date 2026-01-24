import { Injectable } from '@angular/core';
// Constants & Enums
import { Direction } from '../../constants/general/direction.enum';
import { AREA_SIZE } from '../../constants/game/game-area';
import { DEFAULT_STEP_TIME } from '../../constants/game/default-step-time';
import { GameState } from '../../constants/game/game-state.enum';
import { GameBlockType } from '../../constants/game/game-block-type.enum';
import { FoodType } from '../../constants/food/food-type.enum';
import { EnemyType } from '../../constants/enemies/enemy-type.enum';
import { ENEMY_DATA } from '../../constants/enemies/enemy-data';
// Interfaces & Types
import { Position } from '../../types/general/position.interface';
import { Game } from '../../types/game/game.interface';
import { Level } from '../../types/level/level.interface';
import { Snake } from '../../types/snake/snake.interface.ts';
// Services
import { SpaceService } from '../space.service';
import { SnakeService } from '../snake.service';
import { GeometryService } from '../general/geometry.service';
import { GameSnakeService } from './game-snake.service';
import { GameEntityService } from './game-entity.service';
import { GameSpaceService } from './game-space.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(
    private geometry: GeometryService,
    private spaceService: SpaceService,
    private snakeService: SnakeService,
    private gameSpace: GameSpaceService,
    private gameSnake: GameSnakeService,
    private gameEntity: GameEntityService
  ) {}

  //===========================================================================
  //  Initial Setup
  //===========================================================================

  initialize(snake: Snake, level: Level): Game {
    const game: Game = {
      space: this.spaceService.createSpace(AREA_SIZE, AREA_SIZE),
      state: GameState.ready,
      progress: 0,
      stepTime: DEFAULT_STEP_TIME,
      stats: {
        stepsDone: 0,
        elapsedTime: 0,
        food: this.gameEntity.initialFoodStats(level),
        enemies: this.gameEntity.initialEnemyStats(level),
        totalFoodEaten: 0,
        totalFoodValue: 0,
        totalEnemiesHit: 0,
        totalDamageTaken: 0
      },
      portals: [],
      delayedGrowth: 0
    }
    this.setInitialEntities(game, level);
    this.gameSpace.protectPerimeterMargin(game, level);
    this.gameSnake.setSnake(game.space, snake);    
    this.gameEntity.spawnInitialEnemies(game, level);
    this.gameEntity.spawnInitialFood(game, level);
    return game;
  }

  private setInitialEntities(game: Game, level: Level): void {
    level.settings.entities.forEach(entity => {
      this.spaceService.setBlock(game.space, entity.position, entity.block);
      this.gameSpace.protectEntity(game, level, entity.position, entity.block.type);
      if (entity.block.type === GameBlockType.portal && entity.block.portalTo)
        game.portals.push({ entrance: entity.position, exit: entity.block.portalTo });
    });
  }

  //===========================================================================
  //  Game Step
  //===========================================================================

  processStep(game: Game, snake: Snake, level: Level): void {
    if (game.progress >= level.settings.goal) {
      game.state = GameState.victory;
      return;
    }
    game.stats.stepsDone++;
    game.stats.elapsedTime = Math.floor(game.stepTime * game.stats.stepsDone / 1000);
    const lengthBeforeInteractions: number = snake.body.length;
    const positionAhead: Position = 
      this.geometry.shiftPosition(snake.head.currentPosition, snake.direction);
    this.processCollisionDetection(game, positionAhead);
    this.processFoodInteraction(game, level, snake, positionAhead);
    this.processEnemyInteraction(game, level, snake, positionAhead);
    if (game.state === GameState.defeat || game.state === GameState.victory) return;
    if (snake.body.length <= lengthBeforeInteractions && game.delayedGrowth > 0) {
      this.snakeService.growSnake(snake);
      game.delayedGrowth--;
    } 
    this.gameSnake.moveSnake(game, level, snake);
  }

  private processCollisionDetection(game: Game, position: Position): void {
    if (this.spaceService.isCollisionAhead(game.space, position)) game.state = GameState.defeat;
  }

  private processFoodInteraction(game: Game, level: Level, snake: Snake, position: Position): void {
    const foodType: FoodType | null = this.spaceService.foodTypeAhead(game.space, position);
    if (foodType === null) return;
    this.gameEntity.processFoodInteraction(game, level, position, foodType)
    this.snakeService.growSnake(snake);
  }

  private processEnemyInteraction(game: Game, level: Level, snake: Snake,  position: Position): void {
    const enemyType: EnemyType | null = this.spaceService.enemyTypeAhead(game.space, position);
    if (enemyType === null) return;
    this.gameEntity.processEnemyInteraction(game, level, position, enemyType, snake.body.length);
    this.gameSnake.reduceSnake(game, level, snake, ENEMY_DATA[enemyType].damage);
  }

  //===========================================================================
  //  Controls
  //===========================================================================

  changeSnakeDirection(game: Game, snake: Snake, key: string): void {
    const directions: Record<string, Direction> = {
      ['ArrowUp']: Direction.up,
      ['ArrowDown']: Direction.down,
      ['ArrowLeft']: Direction.left,
      ['ArrowRight']: Direction.right
    }
    this.gameSnake.turnSnake(game, snake, directions[key]);
  }

}


