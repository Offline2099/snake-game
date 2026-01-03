import { GameBlockData } from '../game/game-block-data.interface';
import { Position } from '../general/position.interface';

export interface EntityData {
  position: Position;
  block: GameBlockData;
}