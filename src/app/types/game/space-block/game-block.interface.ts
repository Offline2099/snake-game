import { GameBlockType } from '../../../constants/game/space-block/game-block-type.enum';
import { Position } from '../../general/position.interface';
import { GameBlockSubType } from './game-block-subtype.type';
import { Protection } from '../space-protection/protection.type';

export interface GameBlock {
  type: GameBlockType;
  subType?: GameBlockSubType;
  portalTo?: Position;
  isProtected?: Protection;
}