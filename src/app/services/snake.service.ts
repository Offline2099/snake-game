import { Injectable } from '@angular/core';
// Constants & Enums
import { Direction } from '../constants/general/direction.enum';
import { DEFAULT_SNAKE } from '../constants/snake/default-snake';
import { BodyBlockType } from '../constants/snake/body-block-type.enum';
// Interfaces & Types
import { Position } from '../types/general/position.interface';
import { Rectangle } from '../types/general/rectangle.interface';
import { Portal } from '../types/general/portal.interface';
import { Snake } from '../types/snake/snake.interface.ts';
import { SnakeOptions } from '../types/snake/snake-options.interface';
import { SnakeBlock } from '../types/snake/blocks/snake-block.interface';
import { HeadBlock } from '../types/snake/blocks/head-block.interface';
import { BodyBlock } from '../types/snake/blocks/body-block.interface';
import { TailBlock } from '../types/snake/blocks/tail-block.interface';
// Services
import { GeometryService } from './general/geometry.service';

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

  allBlocks(snake: Snake): SnakeBlock[] {
    return [snake.head, ...snake.body, snake.tail];
  }

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

  moveSnake(snake: Snake, portals: Portal[]): void {
    this.moveHeadBlock(snake, portals);
    this.moveBodyBlocks(snake);
    this.moveTailBlock(snake);
    const snakeArray: SnakeBlock[] = this.allBlocks(snake);
    for (let i = 0; i < snakeArray.length; i ++) {
      if (snakeArray[i].teleportedBy && i !== snakeArray.length - 1) {
        snakeArray[i + 1].teleportedBy = { ...snakeArray[i].teleportedBy } as Portal;
        snakeArray[i].teleportedBy = undefined;
        i++;
      }
    }
  }

  private moveHeadBlock(snake: Snake, portals: Portal[]): void {
    snake.head.previousPosition = { ...snake.head.currentPosition };
    let nextPosition: Position = this.geometry.shiftPosition(snake.head.currentPosition, snake.direction);
    const portal: Portal | undefined = 
      portals.find(portal => this.geometry.isSamePosition(nextPosition, portal.entrance));
    if (portal) {
      nextPosition = this.geometry.shiftPosition(portal.exit, snake.direction);
      snake.head.teleportedBy = portal;
    }
    snake.head.currentPosition = nextPosition;
    snake.head.currentDirection = snake.direction;
  }

  private moveBodyBlocks(snake: Snake): void {
    snake.body.forEach((block, index) => {
      const previousBlock: SnakeBlock = index ? snake.body[index - 1] : snake.head;
      block.previousPosition = { ...block.currentPosition };
      block.currentPosition = { ...previousBlock.previousPosition };
      const previousBlockPosition: Position = previousBlock.teleportedBy
        ? previousBlock.teleportedBy.entrance
        : previousBlock.currentPosition;
      const nextBlockPosition: Position = block.teleportedBy
        ? block.teleportedBy.exit
        : block.previousPosition;
      const toPrevious: Direction = this.geometry.getDirection(block.currentPosition, previousBlockPosition);
      const toNext: Direction = this.geometry.getDirection(block.currentPosition, nextBlockPosition);
      block.type = this.bodyBlockType(toPrevious, toNext);
    });
  }

  private moveTailBlock(snake: Snake): void {
    const lastBodyBlock: SnakeBlock = snake.body[snake.body.length - 1];
    snake.tail.previousPosition = { ...snake.tail.currentPosition };
    snake.tail.previousDirection = snake.tail.currentDirection;
    snake.tail.currentPosition = { ...lastBodyBlock.previousPosition };
    const previousBlockPosition: Position = lastBodyBlock.teleportedBy
      ? lastBodyBlock.teleportedBy.entrance
      : lastBodyBlock.currentPosition;
    snake.tail.currentDirection = 
      this.geometry.getDirection(snake.tail.currentPosition, previousBlockPosition);
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