import { GameBlockType } from '../../constants/game/game-block-type.enum';
import { FoodType } from '../../constants/food/food-type.enum';
import { EnemyType } from '../../constants/enemies/enemy-type.enum';
import { EntityParameterId } from '../../constants/level/entity-parameter-id.enum';
import { EntityData } from './entity-data.interface';
import { ProtectedMargin } from './protected-margin.type';

export interface LevelData {
  id: number;
  instructions: string[];
  perimeterProtection: ProtectedMargin;
  protectedMargins: Partial<Record<GameBlockType, ProtectedMargin>>;
  goal: number;
  food: Record<FoodType, Record<EntityParameterId, number>>;
  enemies: Record<EnemyType, Record<EntityParameterId, number>>;
  entities: EntityData[];
}