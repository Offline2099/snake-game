import { ProtectionType } from '../../constants/game/protection-type.enum';

export interface SnakeProtectionData {
  type: ProtectionType;
  margin: number;
  pathLength: number;
}