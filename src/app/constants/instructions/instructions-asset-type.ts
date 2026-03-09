import { GameBlockType } from '../game/space-block/game-block-type.enum';

export const INSTRUCTIONS_ASSET_TYPE: Record<string, GameBlockType> = {
  ['food']: GameBlockType.food,
  ['enemy']: GameBlockType.enemy
}