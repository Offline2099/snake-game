import { Direction } from '../../../constants/general/direction.enum';
import { ObstacleType } from '../../../constants/obstacles/obstacle-type.enum';
import { PortalType } from '../../../constants/portals/portal-type.enum';
import { EnemyType } from '../../../constants/enemies/enemy-type.enum';
import { FoodType } from '../../../constants/food/food-type.enum';
import { BodyBlockType } from '../../../constants/snake/body-block-type.enum';

export type GameBlockSubType = 
  ObstacleType | PortalType | EnemyType | FoodType | Direction | BodyBlockType;