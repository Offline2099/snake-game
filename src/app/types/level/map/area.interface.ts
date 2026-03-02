import { Position } from '../../general/position.interface';
import { Rectangle } from '../../general/rectangle.interface';

export interface Area {
  rectangle: Rectangle;
  excludePositions?: Position[];
  excludeRectangles?: Rectangle[];
}