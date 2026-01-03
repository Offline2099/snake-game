import { ProtectedMarginTypeId } from './protected-margin-type-id.enum';

export const DEFAULT_PROTECTED_MARGIN: Record<ProtectedMarginTypeId, number> = {
  [ProtectedMarginTypeId.noEnemySpawn]: 0,
  [ProtectedMarginTypeId.noFoodSpawn]: 0
}