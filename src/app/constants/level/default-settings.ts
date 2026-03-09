import { GameBlockType } from '../game/space-block/game-block-type.enum';
import { FoodType } from '../game/food/food-type.enum';
import { EnemyType } from '../game/enemies/enemy-type.enum';
import { DEFAULT_PROTECTED_MARGIN } from '../game/space-protection/default-protected-margin';
import { PORTAL_PROTECTED_MARGIN } from '../game/space-protection/portal-protected-margin';
import { DEFAULT_ENTITY_PARAMETERS } from './default-entity-parameters';
import { LevelSettings } from '../../types/level/level-settings.interface';

export const DEFAULT_SETTINGS: LevelSettings = {
  instructions: ['Instructions'],
  goal: 5,
  perimeterProtection: { ...DEFAULT_PROTECTED_MARGIN },
  protectedMargins: {
    [GameBlockType.obstacle]: { ...DEFAULT_PROTECTED_MARGIN },
    [GameBlockType.portal]: { ...PORTAL_PROTECTED_MARGIN },
    [GameBlockType.enemy]: { ...DEFAULT_PROTECTED_MARGIN },
    [GameBlockType.food]: { ...DEFAULT_PROTECTED_MARGIN }
  },
  food: {
    [FoodType.normal]: { ...DEFAULT_ENTITY_PARAMETERS },
    [FoodType.yummy]: { ...DEFAULT_ENTITY_PARAMETERS },
    [FoodType.delicious]: { ...DEFAULT_ENTITY_PARAMETERS }
  },
  enemies: {
    [EnemyType.shit]: { ...DEFAULT_ENTITY_PARAMETERS },
    [EnemyType.fire]: { ...DEFAULT_ENTITY_PARAMETERS }
  }
}