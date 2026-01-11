import { Space } from './space/space.type';
import { GameStats } from './stats/game-stats.interface';

export interface Game {
  space: Space;
  isDefeat: boolean;
  isVictory: boolean;
  stepTime: number;
  progress: number;
  stats: GameStats;
  delayedGrowth: 0;
}