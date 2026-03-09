import { InstructionPartType } from './instruction-part-type.enum';
import { PartKey } from '../../types/instructions/part-kb-key.interface';

export const INSTRUCTIONS_KB_KEY: Record<string, PartKey> = {
  ['space']: {
    type: InstructionPartType.key,
    icon: 'space',
    name: 'Space'
  }
}