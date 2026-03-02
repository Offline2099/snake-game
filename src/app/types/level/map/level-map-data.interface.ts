import { GameBlockBase } from '../../game/space/game-block-base.interface';
import { Portal } from '../../general/portal.interface';
import { LevelMapArea } from './level-map-area.interface';
import { Wall } from './wall.interface';

export interface LevelMapData {
  entities?: Record<number, Record<number, GameBlockBase>>;
  areas?: LevelMapArea[];
  walls?: Wall[];
  portals?: Portal[];
}