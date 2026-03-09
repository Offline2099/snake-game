import { GameBlockType } from './game-block-type.enum';

export const BLOCK_TYPE_NAME: Record<GameBlockType, string> = {
  [GameBlockType.free]: 'Empty Block',
  [GameBlockType.obstacle]: 'Obstacle',
  [GameBlockType.portal]: 'Portal',
  [GameBlockType.enemy]: 'Enemy',
  [GameBlockType.food]: 'Food',
  [GameBlockType.snakeHead]: 'Snake Head',
  [GameBlockType.snakeBody]: 'Snake Body',
  [GameBlockType.snakeTail]: 'Snake Tail'
}
