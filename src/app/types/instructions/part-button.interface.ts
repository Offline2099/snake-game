import { InstructionPartType } from '../../constants/instructions/instruction-part-type.enum';

export interface PartButton {
  type: InstructionPartType.button;
  icon: string;
  name: string;
}