import { Position } from '../../general/position.interface';
import { GameBlockType } from '../../../constants/game/game-block-type.enum';
import { GameBlockSubType } from './game-block-subtype.type';
import { Protection } from './protection.type';

export interface GameBlockData {
  type: GameBlockType;
  subType?: GameBlockSubType;
  isProtected: Protection;
  portalTo?: Position;
}