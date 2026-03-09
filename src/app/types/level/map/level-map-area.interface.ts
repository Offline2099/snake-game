import { GameBlock } from '../../game/space-block/game-block.interface';
import { Area } from './area.interface';

export interface LevelMapArea extends Area {
  block: GameBlock;
}