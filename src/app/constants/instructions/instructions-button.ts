import { InstructionPartType } from './instruction-part-type.enum';
import { PartButton } from '../../types/instructions/part-button.interface';

export const INSTRUCTIONS_BUTTON: Record<string, PartButton> = {
  ['start']: {
    type: InstructionPartType.button,
    icon: 'start',
    name: 'Start'
  }
}