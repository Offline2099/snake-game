import { GameBlockType } from '../game/space-block/game-block-type.enum';
import { FoodType } from '../game/food/food-type.enum';
import { GameBlock } from '../../types/game/space-block/game-block.interface';

export const DEFAULT_SELECTED_ASSET: GameBlock = {
  type: GameBlockType.food,
  subType: FoodType.normal
}