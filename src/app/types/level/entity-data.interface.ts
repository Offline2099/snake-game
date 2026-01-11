import { Position } from '../general/position.interface';
import { GameBlockData } from '../game/space/game-block-data.interface';

export interface EntityData {
  position: Position;
  block: GameBlockData;
}