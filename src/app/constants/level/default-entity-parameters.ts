import { EntityParameterId as Parameter } from './entity-parameter-id.enum';

export const DEFAULT_ENTITY_PARAMETERS: Record<Parameter, number> = {
  [Parameter.initialAmount]: 0,
  [Parameter.spawnOnInteraction]: 0
}