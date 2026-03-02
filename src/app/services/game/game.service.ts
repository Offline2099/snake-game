import { Injectable } from '@angular/core';
// Constants & Enums
import { Direction } from '../../constants/general/direction/direction.enum';
import { DIRECTION_BY_KEY } from '../../constants/general/direction/direction-by-key';
import { AREA_SIZE } from '../../constants/game/game-area';
import { DEFAULT_STEP_TIME } from '../../constants/game/default-step-time';
import { GameState } from '../../constants/game/game-state.enum';
import { FoodType } from '../../constants/food/food-type.enum';
import { EnemyType } from '../../constants/enemies/enemy-type.enum';
import { ENEMY_DATA } from '../../constants/enemies/enemy-data';
// Interfaces & Types
import { Position } from '../../types/general/position.interface';
import { Game } from '../../types/game/game.interface';
import { GameStats } from '../../types/game/stats/game-stats.interface';
import { Level } from '../../types/level/level.interface';
import { Snake } from '../../types/snake/snake.interface.ts';
import { GameBlockBase } from '../../types/game/space/game-block-base.interface';
import { GameBlockData } from '../../types/game/space/game-block-data.interface';
// Services
import { SpaceService } from '../space.service';
import { SnakeService } from '../snake.service';
import { GeometryService } from '../general/geometry.service';
import { GameBlockService } from './game-block.service';
import { GameSnakeService } from './game-snake.service';
import { GameEntityService } from './game-entity.service';
import { GameSpaceService } from './game-space.service';
import { AreaService } from '../level/area.service';
import { WallService } from '../level/wall.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(
    private geometry: GeometryService,
    private spaceService: SpaceService,
    private snakeService: SnakeService,
    private gameBlock: GameBlockService,
    private gameSpace: GameSpaceService,
    private gameSnake: GameSnakeService,
    private gameEntity: GameEntityService,
    private areaService: AreaService,
    private wallService: WallService
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
      stats: this.initialGameStats(level),
      portals: [],
      delayedGrowth: 0
    }
    this.setMap(game, level);
    this.gameSpace.protectPerimeterMargin(game, level);
    this.gameSnake.setSnake(game.space, snake);    
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

  private setMap(game: Game, level: Level): void {
    if (!level.settings.map) return;
    this.setMapEntities(game, level);
    this.setMapAreas(game, level);
    this.setWalls(game, level);
    this.setPortals(game, level);
  }

  private setMapEntities(game: Game, level: Level): void {
    if (!level.settings.map?.entities) return;
    Object.entries(level.settings.map.entities).forEach(([x, value]) => 
      Object.entries(value).forEach(([y, block]) => {
        const position: Position = { x: Number(x), y: Number(y) };
        this.setMapBlock(game, level, position, block);
      })
    );
  }

  private setMapAreas(game: Game, level: Level): void {
    if (!level.settings.map?.areas) return;
    level.settings.map.areas.forEach(area => 
      this.areaService.includedPositions(area).forEach(position => 
        this.setMapBlock(game, level, position, area.block)
      )
    );
  }

  private setWalls(game: Game, level: Level): void {
    if (!level.settings.map?.walls) return;
    level.settings.map.walls.forEach(wall => 
      this.areaService.includedPositions(wall).forEach(position => 
        this.setMapBlock(game, level, position, this.wallService.currentBlock(wall, position))
      )
    );
  }

  private setPortals(game: Game, level: Level): void {
    if (!level.settings.map?.portals) return;
    level.settings.map.portals.forEach(portal => {
      game.portals.push(portal);
      this.setMapBlock(game, level, portal.entrance, this.gameBlock.portalEntrance(portal.exit));
      this.setMapBlock(game, level, portal.exit, this.gameBlock.portalExit());
    });
  }

  private setMapBlock(game: Game, level: Level, position: Position, block: GameBlockBase): void {
    this.spaceService.setBlock(game.space, position, block as GameBlockData);
    this.gameSpace.protectEntity(game, level, position, block.type);
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
    const snakeHealth: number = snake.body.length + game.delayedGrowth;
    const damage: number = ENEMY_DATA[enemyType].damage;
    if (damage >= snake.body.length) {
      const overkill: number = damage - snake.body.length + 1;
      game.delayedGrowth = Math.max(0, game.delayedGrowth - overkill);
    }
    this.gameEntity.processEnemyInteraction(game, level, position, enemyType, snakeHealth);
    this.gameSnake.reduceSnake(game, level, snake, damage);
  }

  //===========================================================================
  //  Controls
  //===========================================================================

  changeSnakeDirection(game: Game, snake: Snake, key: string): void {
    const direction: Direction | undefined = DIRECTION_BY_KEY[key];
    if (direction) this.gameSnake.turnSnake(game, snake, direction);
  }

}


