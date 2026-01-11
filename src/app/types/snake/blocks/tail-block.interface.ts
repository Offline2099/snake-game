import { Direction } from '../../../constants/general/direction.enum';
import { SnakeBlock } from './snake-block.interface';

export interface TailBlock extends SnakeBlock {
  currentDirection: Direction;
  previousDirection: Direction;
}