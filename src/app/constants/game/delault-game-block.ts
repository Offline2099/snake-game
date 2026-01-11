import { GameBlockType } from './game-block-type.enum';
import { ProtectionType } from './protection-type.enum';
import { GameBlockData } from '../../types/game/space/game-block-data.interface';

export const DEFAULT_GAME_BLOCK: GameBlockData = {
  type: GameBlockType.free,
  isProtected: {
    [ProtectionType.noEnemySpawn]: false,
    [ProtectionType.noFoodSpawn]: false
  }
}