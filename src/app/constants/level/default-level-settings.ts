import { GameBlockType } from '../game/game-block-type.enum';
import { EnemyType } from '../enemies/enemy-type.enum';
import { FoodType } from '../food/food-type.enum';
import { ProtectionType } from '../game/protection-type.enum';
import { DEFAULT_ENTITY_PARAMETERS } from './default-entity-parameters';
import { DEFAULT_PROTECTED_MARGIN } from './default-protected-margin';
import { LevelData } from '../../types/level/level-data.interface';

export const DEFAULT_LEVEL_DATA: LevelData = {
  id: 1,
  instructions: ['Instructions'],
  perimeterProtection: { ...DEFAULT_PROTECTED_MARGIN },
  protectedMargins: {
    [GameBlockType.obstacle]: { ...DEFAULT_PROTECTED_MARGIN },
    [GameBlockType.portal]: { 
      [ProtectionType.noEnemySpawn]: 1,
      [ProtectionType.noFoodSpawn]: 1
    },
    [GameBlockType.enemy]: { ...DEFAULT_PROTECTED_MARGIN },
    [GameBlockType.food]: { ...DEFAULT_PROTECTED_MARGIN }
  },  
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