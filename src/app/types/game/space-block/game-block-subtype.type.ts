import { Direction } from '../../../constants/general/direction.enum';
import { ObstacleType } from '../../../constants/game/obstacles/obstacle-type.enum';
import { PortalType } from '../../../constants/game/portals/portal-type.enum';
import { EnemyType } from '../../../constants/game/enemies/enemy-type.enum';
import { FoodType } from '../../../constants/game/food/food-type.enum';
import { BodyBlockType } from '../../../constants/snake/body-block-type.enum';

export type GameBlockSubType = 
  ObstacleType | PortalType | EnemyType | FoodType | Direction | BodyBlockType;