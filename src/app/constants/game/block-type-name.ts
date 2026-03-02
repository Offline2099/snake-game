import { GameBlockType as Type } from './game-block-type.enum';

export const BLOCK_TYPE_NAME: Record<Type, string> = {
  [Type.free]: 'Empty Block',
  [Type.obstacle]: 'Obstacle',
  [Type.portal]: 'Portal',
  [Type.enemy]: 'Enemy',
  [Type.food]: 'Food',
  [Type.snakeHead]: 'Snake Head',
  [Type.snakeBody]: 'Snake Body',
  [Type.snakeTail]: 'Snake Tail'
}
