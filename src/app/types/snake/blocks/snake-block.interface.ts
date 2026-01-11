import { Position } from '../../general/position.interface';

export interface SnakeBlock {
  currentPosition: Position;
  previousPosition: Position;
}