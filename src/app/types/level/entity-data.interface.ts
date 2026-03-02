import { Position } from '../general/position.interface';
import { GameBlockBase } from '../game/space/game-block-base.interface';

export interface EntityData {
  position: Position;
  block: GameBlockBase;
}