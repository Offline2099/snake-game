import { SnakeProtectionData } from '../../types/snake/snake-protection-data.interface';
import { ProtectionType } from '../game/protection-type.enum';

export const SNAKE_PROTECTION_DATA: SnakeProtectionData = {
  type: ProtectionType.noEnemySpawn,
  margin: 1,
  pathLength: 15
}