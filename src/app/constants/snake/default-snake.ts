import { Direction } from '../general/direction.enum';
import { SnakeOptions } from '../../types/snake/snake-options.interface';

export const DEFAULT_SNAKE: SnakeOptions = {
  headPosition: {
    x: 2,
    y: 0
  },
  snakeDirection: Direction.right,
  snakeLength: 3
}