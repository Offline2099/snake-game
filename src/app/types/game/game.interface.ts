import { Space } from './space/space.type';
import { GameStats } from './stats/game-stats.interface';
import { Portal } from '../general/portal.interface';

export interface Game {
  space: Space;
  isDefeat: boolean;
  isVictory: boolean;
  stepTime: number;
  progress: number;
  stats: GameStats;
  portals: Portal[];
  delayedGrowth: number;
}