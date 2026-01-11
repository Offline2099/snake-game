import { EnemyType } from '../enemies/enemy-type.enum';
import { FoodType } from '../food/food-type.enum';
import { Direction } from '../general/direction.enum';
import { BodyBlockType } from '../snake/body-block-type.enum';
import { GameBlockType } from './game-block-type.enum';

export const BLOCK_CLASS: Record<number, Record<number, string>> = {
  // [GameBlockType.obstacle]: {
  //   [ObstacleType.rock]: 'rock',
  //   [ObstacleType.wallHorizontal]: 'wall horizontal',
  //   [ObstacleType.wallVertical]: 'wall vertical',
  //   [ObstacleType.wallEndTop]: 'wall end-top',
  //   [ObstacleType.wallEndBottom]: 'wall end-bottom',
  //   [ObstacleType.wallEndLeft]: 'wall end-left',
  //   [ObstacleType.wallEndRight]: 'wall end-right'
  // },
  // [GameBlockType.portal]: {
  //   [PortalType.entrance]: 'portal-entrance',
  //   [PortalType.exit]: 'portal-exit'
  // },
  [GameBlockType.snakeHead]: {
    [Direction.up]: 'snake-block head up',
    [Direction.down]: 'snake-block head down',
    [Direction.left]: 'snake-block head left',
    [Direction.right]: 'snake-block head right'
  },
  [GameBlockType.snakeBody]: {
    [BodyBlockType.horizontal]: 'snake-block horizontal',
    [BodyBlockType.vertical]: 'snake-block vertical',
    [BodyBlockType.betweenTopAndLeft]: 'snake-block round-bottom-right',
    [BodyBlockType.betweenTopAndRight]: 'snake-block round-bottom-left',
    [BodyBlockType.betweenBottomAndLeft]: 'snake-block round-top-right',
    [BodyBlockType.betweenBottomAndRight]: 'snake-block round-top-left'
  },
  [GameBlockType.snakeTail]: {
    [Direction.up]: 'snake-block tail up',
    [Direction.down]: 'snake-block tail down',
    [Direction.left]: 'snake-block tail left',
    [Direction.right]: 'snake-block tail right'
  },
  [GameBlockType.enemy]: {
    [EnemyType.shit]: 'shit',
    [EnemyType.fire]: 'fire'
  },
  [GameBlockType.food]: {
    [FoodType.normal]: 'food normal',
    [FoodType.yummy]: 'food yummy',
    [FoodType.delicious]: 'food delicious'
  }
}