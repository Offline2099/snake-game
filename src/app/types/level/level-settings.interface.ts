import { GameBlockType } from '../../constants/game/space-block/game-block-type.enum';
import { EnemyType } from '../../constants/game/enemies/enemy-type.enum';
import { FoodType } from '../../constants/game/food/food-type.enum';
import { EntityParameterId } from '../../constants/level/entity-parameter-id.enum';
import { ProtectedMargin } from '../game/space-protection/protected-margin.type';
import { LevelMapData } from './map/level-map-data.interface';

export interface LevelSettings {
  instructions: string[];
  goal: number;
  perimeterProtection: ProtectedMargin;
  protectedMargins: Partial<Record<GameBlockType, ProtectedMargin>>;
  food: Record<FoodType, Record<EntityParameterId, number>>;
  enemies: Record<EnemyType, Record<EntityParameterId, number>>;
  map?: LevelMapData;
}