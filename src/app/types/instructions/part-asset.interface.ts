import { InstructionPartType } from '../../constants/instructions/instruction-part-type.enum';
import { GameBlock } from '../game/space-block/game-block.interface';

export interface PartAsset {
  type: InstructionPartType.asset;
  asset: GameBlock;
  assetName: string;
}