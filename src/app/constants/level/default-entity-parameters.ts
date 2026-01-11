import { EntityParameterId } from './entity-parameter-id.enum';

export const DEFAULT_ENTITY_PARAMETERS: Record<EntityParameterId, number> = {
  [EntityParameterId.initialAmount]: 0,
  [EntityParameterId.spawnOnInteraction]: 0
}