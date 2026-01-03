import { ProtectedMarginTypeId } from '../../constants/level/protected-margin-type-id.enum';
import { EntityParameterId } from '../../constants/level/entity-parameter-id.enum';
import { FoodType } from '../../constants/food/food-type.enum';
import { EnemyType } from '../../constants/enemies/enemy-type.enum';
import { EntityData } from './entity-data.interface';

export interface Level {
  id: number;
  name: string;
  instructions: string[];
  protectedBoundaryMargin: Record<ProtectedMarginTypeId, number>;
  protectedObstacleMargin: Record<ProtectedMarginTypeId, number>;
  goal: number;
  food: Record<FoodType, Record<EntityParameterId, number>>;
  enemies: Record<EnemyType, Record<EntityParameterId, number>>;
  entities: EntityData[];
}