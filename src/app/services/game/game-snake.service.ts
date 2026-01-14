import { Injectable } from '@angular/core';
// Constants & Enums
import { Direction } from '../../constants/general/direction.enum';
import { GameBlockType } from '../../constants/game/game-block-type.enum';
import { PortalType } from '../../constants/portals/portal-type.enum';
import { SNAKE_PROTECTION_DATA } from '../../constants/snake/snake-protection-data';
// Interfaces & Types
import { Position } from '../../types/general/position.interface';
import { Rectangle } from '../../types/general/rectangle.interface';
import { Game } from '../../types/game/game.interface';
import { Level } from '../../types/level/level.interface';
import { Snake } from '../../types/snake/snake.interface.ts';
import { Space } from '../../types/game/space/space.type';
import { GameBlockData } from '../../types/game/space/game-block-data.interface';
// Services
import { GeometryService } from '../general/geometry.service';
import { SpaceService } from '../space.service';
import { GameSpaceService } from './game-space.service';
import { SnakeService } from '../snake.service';

@Injectable({
  providedIn: 'root'
})
export class GameSnakeService {

  constructor(
    private geometry: GeometryService,
    private spaceService: SpaceService,
    private gameSpace: GameSpaceService,
    private snakeService: SnakeService
  ) {}

  //===========================================================================
  //  Snake Setup
  //===========================================================================

  setSnake(space: Space, snake: Snake): void {
    this.setSnakeHead(space, snake);
    this.setSnakeBody(space, snake);
    this.setSnakeTail(space, snake);
    this.protectSnake(space, snake);
  }

  private setSnakeBlock(space: Space, position: Position, block: GameBlockData): void {
    if (this.spaceService.isOfType(space, position, GameBlockType.portal, PortalType.entrance)) 
      return;
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
    const path: Rectangle = 
      this.snakeService.snakePathAhead(snake, SNAKE_PROTECTION_DATA.pathLength);
    this.gameSpace.protectArea(space, path, SNAKE_PROTECTION_DATA.type);
    this.snakeService.allBlocks(snake).forEach(block => 
      this.gameSpace.protectMargin(
        space,
        block.currentPosition,
        SNAKE_PROTECTION_DATA.margin,
        SNAKE_PROTECTION_DATA.type
      )
    );
  }

  //===========================================================================
  //  Snake Update
  //===========================================================================

  turnSnake(game: Game, snake: Snake, direction: Direction): void {
    const headPositionIfTurned: Position = 
      this.geometry.shiftPosition(snake.head.currentPosition, direction);
    if (this.spaceService.isCollisionAhead(game.space, headPositionIfTurned)) return;
    snake.direction = direction;
  }

  moveSnake(game: Game, level: Level, snake: Snake): void {
    if (snake.direction !== snake.head.currentDirection) {
      const path: Rectangle = this.snakeService.snakePathAhead(snake, SNAKE_PROTECTION_DATA.pathLength);
      this.gameSpace.unprotectArea(game, level, path);
    }
    this.gameSpace.unprotectMargin(game, level, snake.tail.currentPosition, SNAKE_PROTECTION_DATA.margin);
    this.snakeService.moveSnake(snake, game.portals);
    this.gameSpace.setFreeBlock(game, level, snake.tail.previousPosition);
    this.setSnake(game.space, snake);
  }

  reduceSnake(game: Game, level: Level, snake: Snake, amount: number): void {
    const positionsToCut: Position[] = [
      ...snake.body
        .slice(Math.max(snake.body.length - 1 - amount, 1))
        .map(block => block.currentPosition),
      snake.tail.currentPosition
    ];
    positionsToCut.forEach(position => {
      this.gameSpace.setFreeBlock(game, level, position);
      this.gameSpace.unprotectMargin(game, level, position, SNAKE_PROTECTION_DATA.margin);
    });
    this.snakeService.takeDamage(snake, amount);
    this.setSnake(game.space, snake);
  }

}
