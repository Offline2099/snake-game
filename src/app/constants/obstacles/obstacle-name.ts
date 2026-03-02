import { ObstacleType as Type } from './obstacle-type.enum';

export const OBSTACLE_NAME: Record<Type, string> = {
  [Type.rock]: 'Rock',
  [Type.wallHorizontal]: 'Horizontal wall',
  [Type.wallVertical]: 'Vertical wall',
  [Type.wallEndTop]: 'Wall end (top)',
  [Type.wallEndBottom]: 'Wall end (bottom)',
  [Type.wallEndLeft]: 'Wall end (left)',
  [Type.wallEndRight]: 'Wall end (right)'
}