import { Position } from '../../general/position.interface';
import { Portal } from '../../general/portal.interface';

export interface SnakeBlock {
  currentPosition: Position;
  previousPosition: Position;
  teleportedBy?: Portal;
}