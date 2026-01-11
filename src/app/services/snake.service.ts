import { Injectable } from '@angular/core';
// Constants & Enums
import { Direction } from '../constants/general/direction.enum';
import { DEFAULT_SNAKE } from '../constants/snake/default-snake';
import { BodyBlockType } from '../constants/snake/body-block-type.enum';
// Interfaces & Types
import { Position } from '../types/general/position.interface';
import { Rectangle } from '../types/general/rectangle.interface';
import { Snake } from '../types/snake/snake.interface.ts';
import { SnakeOptions } from '../types/snake/snake-options.interface';
import { SnakeBlock } from '../types/snake/blocks/snake-block.interface';
import { HeadBlock } from '../types/snake/blocks/head-block.interface';
import { BodyBlock } from '../types/snake/blocks/body-block.interface';
import { TailBlock } from '../types/snake/blocks/tail-block.interface';
// Services
import { GeometryService } from './geometry.service';

@Injectable({
  providedIn: 'root'
})
export class SnakeService {

  constructor(private geometry: GeometryService) {}

  //===========================================================================
  //  Snake Construction
  //===========================================================================

  createSnake(snakeOptions?: Partial<SnakeOptions>): Snake {
    const options: SnakeOptions = { ...DEFAULT_SNAKE, ...snakeOptions };
    const oppositeDirection: Direction = this.geometry.oppositeDirection(options.snakeDirection);
    const tailPosition: Position =
      this.geometry.shiftPosition(options.headPosition, oppositeDirection, options.snakeLength - 1);
    return {
      direction: options.snakeDirection,
      head: this.createHeadBlock(options.headPosition, options.snakeDirection),
      body: [...Array(options.snakeLength - 2).keys()].map(index => {
        const position: Position = 
          this.geometry.shiftPosition(options.headPosition, oppositeDirection, index + 1);
        return this.createBodyBlock(position, options.snakeDirection, oppositeDirection);
      }),
      tail: this.createTailBlock(tailPosition, options.snakeDirection)
    }
  }

  private createSnakeBlock(position: Position): SnakeBlock {
    return {
      currentPosition: { ...position },
      previousPosition: { ...position }
    }
  }

  private createHeadBlock(position: Position, direction: Direction): HeadBlock {
    return {
      ...this.createSnakeBlock(position),
      currentDirection: direction
    }
  }

  private createBodyBlock(position: Position, toPrevious: Direction, toNext: Direction): BodyBlock {
    return {
      ...this.createSnakeBlock(position),
      type: this.bodyBlockType(toPrevious, toNext)
    }
  }

  private createTailBlock(position: Position, direction: Direction): TailBlock {
    return {
      ...this.createSnakeBlock(position),
      currentDirection: direction,
      previousDirection: direction
    }
  }

  //===========================================================================
  //  Snake Utility
  //===========================================================================

  snakePathAhead(snake: Snake, pathLength: number): Rectangle {
    return this.geometry.rectangleFromTwoPoints(
      this.geometry.shiftPosition(snake.head.currentPosition, snake.head.currentDirection),
      this.geometry.shiftPosition(snake.head.currentPosition, snake.head.currentDirection, pathLength)
    );
  }

  private bodyBlockType(toPrevious: Direction, toNext: Direction): BodyBlockType {
    const toAdjacent: Direction[] = [toPrevious, toNext];
    const includesBoth = (a: Direction, b: Direction) => {
      return toAdjacent.includes(a) && toAdjacent.includes(b);
    }
    if (includesBoth(Direction.left, Direction.right)) return BodyBlockType.horizontal;
    if (includesBoth(Direction.up, Direction.down)) return BodyBlockType.vertical;
    if (includesBoth(Direction.up, Direction.left)) return BodyBlockType.betweenTopAndLeft;
    if (includesBoth(Direction.up, Direction.right)) return BodyBlockType.betweenTopAndRight;
    if (includesBoth(Direction.down, Direction.left)) return BodyBlockType.betweenBottomAndLeft;
    return BodyBlockType.betweenBottomAndRight;
  }

  //===========================================================================
  //  Snake Flow
  //===========================================================================

  moveSnake(snake: Snake): void {
    this.moveHeadBlock(snake);
    this.moveBodyBlocks(snake);
    this.moveTailBlock(snake);
  }

  private moveHeadBlock(snake: Snake): void {
    snake.head.previousPosition = { ...snake.head.currentPosition };
    snake.head.currentPosition = 
      this.geometry.shiftPosition(snake.head.currentPosition, snake.direction);
    snake.head.currentDirection = snake.direction;
  }

  private moveBodyBlocks(snake: Snake): void {
    snake.body.forEach((block, index) => {
      const previous: SnakeBlock = index ? snake.body[index - 1] : snake.head;
      block.previousPosition = { ...block.currentPosition };
      block.currentPosition = { ...previous.previousPosition };
      block.type = this.bodyBlockType(
        this.geometry.getDirection(block.currentPosition, previous.currentPosition),
        this.geometry.getDirection(block.currentPosition, block.previousPosition)
      );
    });
  }

  private moveTailBlock(snake: Snake): void {
    const lastBodyBlock: SnakeBlock = snake.body[snake.body.length - 1];
    snake.tail.previousPosition = { ...snake.tail.currentPosition };
    snake.tail.previousDirection = snake.tail.currentDirection;
    snake.tail.currentPosition = { ...lastBodyBlock.previousPosition };
    snake.tail.currentDirection = 
      this.geometry.getDirection(snake.tail.currentPosition, lastBodyBlock.currentPosition);
  }

  //===========================================================================
  //  Snake Modification
  //===========================================================================

  growSnake(snake: Snake): void {
    snake.body.push(this.createBodyBlock(
      snake.tail.currentPosition,
      snake.tail.currentDirection,
      this.geometry.getDirection(snake.tail.currentPosition, snake.tail.previousPosition)
    ));
    snake.tail = this.createTailBlock(snake.tail.previousPosition, snake.tail.previousDirection);
  }

  takeDamage(snake: Snake, amount: number): void {
    snake.body.splice(snake.body.length - Math.min(snake.body.length - 1, amount));
    this.moveTailBlock(snake);
  }

}