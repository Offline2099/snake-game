import { GameBlockType } from './game-block-type.enum';
import { EnemyType } from '../enemies/enemy-type.enum';
import { BodyBlockType } from '../../snake/body-block-type.enum';

export const BLOCK_IMAGE: Record<number, Record<number, string> | string> = {
  [GameBlockType.enemy]: {
    [EnemyType.shit]: 'shit',
    [EnemyType.fire]: 'fire'
  },
  [GameBlockType.portal]: 'portal',
  [GameBlockType.snakeHead]: 'snake-head',
  [GameBlockType.snakeBody]: {
    [BodyBlockType.horizontal]: 'snake-body',
    [BodyBlockType.vertical]: 'snake-body',
    [BodyBlockType.betweenTopAndLeft]: 'snake-body-turn',
    [BodyBlockType.betweenTopAndRight]: 'snake-body-turn',
    [BodyBlockType.betweenBottomAndLeft]: 'snake-body-turn',
    [BodyBlockType.betweenBottomAndRight]: 'snake-body-turn'
  },
  [GameBlockType.snakeTail]: 'snake-tail'
}