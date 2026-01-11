import { ProtectionType } from '../game/protection-type.enum';

export const DEFAULT_PROTECTED_MARGIN: Record<ProtectionType, number> = {
  [ProtectionType.noEnemySpawn]: 0,
  [ProtectionType.noFoodSpawn]: 0
}