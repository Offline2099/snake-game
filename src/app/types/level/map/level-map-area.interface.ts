import { GameBlockBase } from '../../game/space/game-block-base.interface';
import { Area } from './area.interface';

export interface LevelMapArea extends Area {
  block: GameBlockBase;
}