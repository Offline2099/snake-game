import { GameState } from '../../constants/game/game-state.enum';
import { Snake } from '../snake/snake.interface';
import { Space } from './space.type';
import { GameStats } from './stats/game-stats.interface';

export interface Game {
  snake: Snake;
  space: Space;
  state: GameState;
  stepTime: number;
  progress: number;
  stats: GameStats;
  delayedGrowth: number;
}