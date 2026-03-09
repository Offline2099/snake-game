import { ProtectionType } from '../game/space-protection/protection-type.enum';
import { SnakeProtectionData } from '../../types/snake/snake-protection-data.interface';

export const SNAKE_PROTECTION_DATA: SnakeProtectionData = {
  type: ProtectionType.noEnemySpawn,
  margin: 1,
  pathLength: 15
}