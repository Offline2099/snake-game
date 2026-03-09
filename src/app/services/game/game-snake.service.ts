import { Injectable } from '@angular/core';
// Constants & Enums
import { Direction } from '../../constants/general/direction.enum';
import { GameBlockType } from '../../constants/game/space-block/game-block-type.enum';
import { PortalType } from '../../constants/game/portals/portal-type.enum';
import { SNAKE_PROTECTION_DATA } from '../../constants/snake/snake-protection-data';
// Interfaces & Types
import { Position } from '../../types/general/position.interface';
import { Rectangle } from '../../types/general/rectangle.interface';
import { Level } from '../../types/level/level.interface';
import { Snake } from '../../types/snake/snake.interface';
import { Space } from '../../types/game/space.type';
import { GameBlock } from '../../types/game/space-block/game-block.interface';
// Services
import { GeometryService } from '../general/geometry.service';
import { GameBlockService } from './game-block.service';
import { SnakeService } from './snake.service';
import { SpaceService } from './space.service';

@Injectable({
  providedIn: 'root'
})
export class GameSnakeService {

  constructor(
    private geometry: GeometryService,
    private gameBlock: GameBlockService,
    private snakeService: SnakeService,
    private spaceService: SpaceService
  ) {}

  //===========================================================================
  //  Snake Setup
  //===========================================================================

  createSnake(): Snake {
    return this.snakeService.createSnake();
  }

  setSnake(space: Space, snake: Snake): void {
    this.setSnakeHead(space, snake);
    this.setSnakeBody(space, snake);
    this.setSnakeTail(space, snake);
    this.protectSnake(space, snake);
  }

  private setSnakeBlock(space: Space, position: Position, block: GameBlock): void {
    if (this.spaceService.isOfType(space, position, GameBlockType.portal, PortalType.entrance)) 
      return;
    this.spaceService.setBlock(space, position, block);
  }

  private setSnakeHead(space: Space, snake: Snake): void {
    const head: GameBlock = 
      this.gameBlock.createBlock(GameBlockType.snakeHead, snake.head.currentDirection);
    this.setSnakeBlock(space, snake.head.currentPosition, head);
  }

  private setSnakeBody(space: Space, snake: Snake): void {
    snake.body.forEach(bodyBlock => {
      const block: GameBlock = 
        this.gameBlock.createBlock(GameBlockType.snakeBody, bodyBlock.type);
      this.setSnakeBlock(space, bodyBlock.currentPosition, block);
    });
  }

  private setSnakeTail(space: Space, snake: Snake): void {
    const tail: GameBlock = 
      this.gameBlock.createBlock(GameBlockType.snakeTail, snake.tail.currentDirection);
    this.setSnakeBlock(space, snake.tail.currentPosition, tail);
  }

  private protectSnake(space: Space, snake: Snake): void {
    const path: Rectangle = 
      this.snakeService.snakePathAhead(snake, SNAKE_PROTECTION_DATA.pathLength);
    this.spaceService.setAreaProtectionState(space, path, SNAKE_PROTECTION_DATA.type, true);
    this.snakeService.allBlocks(snake).forEach(block => 
      this.spaceService.setMarginProtectionState(
        space,
        block.currentPosition,
        SNAKE_PROTECTION_DATA.margin,
        SNAKE_PROTECTION_DATA.type,
        true
      )
    );
  }

  //===========================================================================
  //  Snake Update
  //===========================================================================

  positionAhead(snake: Snake): Position {
    return this.geometry.shiftPosition(snake.head.currentPosition, snake.direction);
  }

  turnSnake(space: Space, snake: Snake, direction: Direction): void {
    const headPositionIfTurned: Position = 
      this.geometry.shiftPosition(snake.head.currentPosition, direction);
    const block: GameBlock | null = this.spaceService.getBlock(space, headPositionIfTurned);
    if (this.gameBlock.isCausingCollision(block)) return;
    snake.direction = direction;
  }

  moveSnake(space: Space, snake: Snake, level: Level, positionAhead: Position): void {
    if (
      snake.direction !== snake.head.currentDirection 
        || this.spaceService.isOfType(space, positionAhead, GameBlockType.portal, PortalType.entrance)
    ) {
      const path: Rectangle = this.snakeService.snakePathAhead(snake, SNAKE_PROTECTION_DATA.pathLength);
      this.spaceService.unprotectArea(space, level, path);
    }
    this.spaceService.unprotectMargin(space, level, snake.tail.currentPosition, SNAKE_PROTECTION_DATA.margin);
    this.snakeService.moveSnake(snake, level.settings.map?.portals || []);
    this.spaceService.setEmptyBlock(space, level, snake.tail.previousPosition);
    this.setSnake(space, snake);
  }

  growSnake(snake: Snake): void {
    this.snakeService.growSnake(snake);
  }

  reduceSnake(space: Space, snake: Snake, level: Level, amount: number): void {
    const positionsToCut: Position[] = [
      ...snake.body
        .slice(Math.max(snake.body.length - 1 - amount, 1))
        .map(block => block.currentPosition),
      snake.tail.currentPosition
    ];
    positionsToCut.forEach(position => {
      this.spaceService.setEmptyBlock(space, level, position);
      this.spaceService.unprotectMargin(space, level, position, SNAKE_PROTECTION_DATA.margin);
    });
    this.snakeService.takeDamage(snake, amount);
    this.setSnake(space, snake);
  }

}