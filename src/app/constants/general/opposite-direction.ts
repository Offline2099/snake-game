import { Direction } from './direction.enum';

export const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  [Direction.up]: Direction.down,
  [Direction.down]: Direction.up,
  [Direction.left]: Direction.right,
  [Direction.right]: Direction.left
}