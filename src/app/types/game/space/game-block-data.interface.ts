import { GameBlockBase } from './game-block-base.interface';
import { Protection } from './protection.type';

export interface GameBlockData extends GameBlockBase {
  isProtected: Protection;
}