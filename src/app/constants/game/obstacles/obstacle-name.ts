import { ObstacleType } from '../obstacles/obstacle-type.enum';

export const OBSTACLE_NAME: Record<ObstacleType, string> = {
  [ObstacleType.rock]: 'Rock',
  [ObstacleType.wallHorizontal]: 'Horizontal wall',
  [ObstacleType.wallVertical]: 'Vertical wall',
  [ObstacleType.wallEndTop]: 'Wall end (top)',
  [ObstacleType.wallEndBottom]: 'Wall end (bottom)',
  [ObstacleType.wallEndLeft]: 'Wall end (left)',
  [ObstacleType.wallEndRight]: 'Wall end (right)'
}