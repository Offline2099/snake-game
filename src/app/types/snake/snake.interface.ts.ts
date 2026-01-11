
import { Direction } from '../../constants/general/direction.enum';
import { HeadBlock } from './blocks/head-block.interface';
import { BodyBlock } from './blocks/body-block.interface';
import { TailBlock } from './blocks/tail-block.interface';

export interface Snake {
  direction: Direction;
  head: HeadBlock;
  body: BodyBlock[];
  tail: TailBlock;
}