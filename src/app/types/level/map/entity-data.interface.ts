import { Position } from '../../general/position.interface';
import { GameBlock } from '../../game/space-block/game-block.interface';

export interface EntityData {
  position: Position;
  block: GameBlock;
}