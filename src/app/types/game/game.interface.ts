import { GameState } from '../../constants/game/game-state.enum';
import { Portal } from '../general/portal.interface';
import { Space } from './space/space.type';
import { GameStats } from './stats/game-stats.interface';

export interface Game {
  space: Space;
  state: GameState;
  stepTime: number;
  progress: number;
  stats: GameStats;
  portals: Portal[];
  delayedGrowth: number;
}