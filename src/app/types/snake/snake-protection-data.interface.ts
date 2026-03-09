import { ProtectionType } from '../../constants/game/space-protection/protection-type.enum';

export interface SnakeProtectionData {
  type: ProtectionType;
  margin: number;
  pathLength: number;
}