import { Level } from '../../types/level/level.interface';
import { EnemyType } from '../enemies/enemy-type.enum';
import { FoodType } from '../food/food-type.enum';
import { DEFAULT_ENTITY_PARAMETERS } from './default-entity-parameters';
import { DEFAULT_PROTECTED_MARGIN } from './default-protected-margin';

export const DEFAULT_LEVEL: Level = {
  id: 1,
  name: 'Level Name',
  instructions: ['Instructions'],
  protectedBoundaryMargin: { ...DEFAULT_PROTECTED_MARGIN },
  protectedObstacleMargin: { ...DEFAULT_PROTECTED_MARGIN },  
  goal: 5,
  food: {
    [FoodType.normal]: { ...DEFAULT_ENTITY_PARAMETERS },
    [FoodType.yummy]: { ...DEFAULT_ENTITY_PARAMETERS },
    [FoodType.delicious]: { ...DEFAULT_ENTITY_PARAMETERS }
  },
  enemies: {
    [EnemyType.shit]: { ...DEFAULT_ENTITY_PARAMETERS },
    [EnemyType.fire]: { ...DEFAULT_ENTITY_PARAMETERS }
  },
  entities: []
}