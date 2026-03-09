import { ProtectionType } from './protection-type.enum';

export const PORTAL_PROTECTED_MARGIN: Record<ProtectionType, number> = {
  [ProtectionType.noEnemySpawn]: 1,
  [ProtectionType.noFoodSpawn]: 1
}