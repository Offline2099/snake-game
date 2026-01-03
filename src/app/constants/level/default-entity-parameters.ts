import { EntityParameterId } from './entity-parameter-id.enum';

export const DEFAULT_ENTITY_PARAMETERS: Record<EntityParameterId, number> = {
  [EntityParameterId.initialAmount]: 1,
  [EntityParameterId.spawnOnInteraction]: 1,
  [EntityParameterId.protectedMargin]: 0
}