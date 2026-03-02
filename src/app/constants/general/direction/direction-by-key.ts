import { Direction } from './direction.enum';

export const DIRECTION_BY_KEY: Record<string, Direction> = {
  ['ArrowUp']: Direction.up,
  ['ArrowDown']: Direction.down,
  ['ArrowLeft']: Direction.left,
  ['ArrowRight']: Direction.right,
  ['w']: Direction.up,
  ['s']: Direction.down,
  ['a']: Direction.left,
  ['d']: Direction.right
}