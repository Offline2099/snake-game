import { Direction } from '../../../constants/general/direction.enum';
import { EnemyType } from '../../../constants/enemies/enemy-type.enum';
import { FoodType } from '../../../constants/food/food-type.enum';
import { BodyBlockType } from '../../../constants/snake/body-block-type.enum';

export type GameBlockSubType = EnemyType | FoodType | Direction | BodyBlockType;