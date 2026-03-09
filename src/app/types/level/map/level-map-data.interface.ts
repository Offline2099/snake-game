import { Portal } from '../../general/portal.interface';
import { GameBlock } from '../../game/space-block/game-block.interface';
import { LevelMapArea } from './level-map-area.interface';
import { Wall } from './wall.interface';

export interface LevelMapData {
  entities?: Record<number, Record<number, GameBlock>>;
  areas?: LevelMapArea[];
  walls?: Wall[];
  portals?: Portal[];
}