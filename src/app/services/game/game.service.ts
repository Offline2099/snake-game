import { Injectable } from '@angular/core';
// Constants & Enums
import { Direction } from '../../constants/general/direction.enum';
import { DIRECTION_BY_KEY } from '../../constants/general/direction-by-key';
import { SPACE_HEIGHT, SPACE_WIDTH } from '../../constants/game/game-space';
import { DEFAULT_STEP_TIME_MS } from '../../constants/game/step-time';
import { GameState } from '../../constants/game/game-state.enum';
// Interfaces & Types
import { Game } from '../../types/game/game.interface';
import { Level } from '../../types/level/level.interface';
import { GameStats } from '../../types/game/stats/game-stats.interface';
import { GameBlock } from '../../types/game/space-block/game-block.interface';
// Services
import { SpaceService } from './space.service';
import { LevelService } from '../level/level.service';
import { GameBlockService } from './game-block.service';
import { GameEntityService } from './game-entity.service';
import { GameSnakeService } from './game-snake.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(
    private spaceService: SpaceService,
    private levelService: LevelService,
    private gameBlock: GameBlockService,
    private gameEntity: GameEntityService,
    private gameSnake: GameSnakeService
  ) {}

  //===========================================================================
  //  Initial Setup
  //===========================================================================

  initialize(level: Level): Game {
    const game: Game = {
      snake: this.gameSnake.createSnake(),
      space: this.spaceService.createSpace(SPACE_WIDTH, SPACE_HEIGHT),
      state: GameState.ready,
      progress: 0,
      stepTime: DEFAULT_STEP_TIME_MS,
      stats: this.initialGameStats(level),
      delayedGrowth: 0
    }
    this.levelService.setLevelMap(game.space, level);
    this.spaceService.protectPerimeterMargin(game.space, level);
    this.gameSnake.setSnake(game.space, game.snake);    
    this.gameEntity.spawnInitialEnemies(game, level);
    this.gameEntity.spawnInitialFood(game, level);
    return game;
  }

  private initialGameStats(level: Level): GameStats {
    return {
      stepsDone: 0,
      elapsedTime: 0,
      food: this.gameEntity.initialFoodStats(level),
      enemies: this.gameEntity.initialEnemyStats(level),
      totalFoodEaten: 0,
      totalFoodValue: 0,
      totalEnemiesHit: 0,
      totalDamageTaken: 0
    }
  }

  //===========================================================================
  //  Game Flow
  //===========================================================================

  changeSnakeDirection(game: Game, key: string): void {
    const direction: Direction | undefined = DIRECTION_BY_KEY[key];
    if (direction) this.gameSnake.turnSnake(game.space, game.snake, direction);
  }

  processStep(game: Game, level: Level): void {
    if (game.progress >= level.settings.goal) {
      game.state = GameState.victory;
      return;
    }
    game.stats.stepsDone++;
    game.stats.elapsedTime = Math.floor(game.stepTime * game.stats.stepsDone / 1000);
    const lengthBeforeInteractions: number = game.snake.body.length;
    const positionAhead = this.gameSnake.positionAhead(game.snake);
    const blockAhead: GameBlock | null = this.spaceService.getBlock(game.space, positionAhead);
    if (this.gameBlock.isCausingCollision(blockAhead)) game.state = GameState.defeat;
    if (this.gameBlock.isFood(blockAhead)) 
      this.gameEntity.processFoodInteraction(game, level, positionAhead, blockAhead!);
    if (this.gameBlock.isEnemy(blockAhead))
      this.gameEntity.processEnemyInteraction(game, level, positionAhead, blockAhead!);
    if (this.hasEnded(game)) return;
    if (game.snake.body.length <= lengthBeforeInteractions && game.delayedGrowth > 0) {
      this.gameSnake.growSnake(game.snake);
      game.delayedGrowth--;
    } 
    this.gameSnake.moveSnake(game.space, game.snake, level, positionAhead);
  }

  hasEnded(game: Game): boolean {
    return game.state === GameState.defeat || game.state === GameState.victory;
  }

}