import { Position } from '../../general/position.interface';
import { GameBlockType } from '../../../constants/game/game-block-type.enum';
import { GameBlockSubType } from './game-block-subtype.type';

export interface GameBlockBase {
  type: GameBlockType;
  subType?: GameBlockSubType;
  portalTo?: Position;
}