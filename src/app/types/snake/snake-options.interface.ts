import { Direction } from '../../constants/general/direction.enum';
import { Position } from '../general/position.interface';

export interface SnakeOptions {
  headPosition: Position;
  snakeDirection: Direction;
  snakeLength: number;
}
