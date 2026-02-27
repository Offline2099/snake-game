import { GameBlockType } from '../game/game-block-type.enum';
import { FoodType } from '../food/food-type.enum';
import { GameBlockBase } from '../../types/game/space/game-block-base.interface';

export const DEFAULT_SELECTED_ASSET: GameBlockBase = {
  type: GameBlockType.food,
  subType: FoodType.normal
}