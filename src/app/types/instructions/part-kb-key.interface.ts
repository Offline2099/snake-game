import { InstructionPartType } from '../../constants/instructions/instruction-part-type.enum';

export interface PartKey {
  type: InstructionPartType.key;
  icon: string;
  name: string;
}