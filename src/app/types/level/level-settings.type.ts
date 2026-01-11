import { LevelData } from './level-data.interface';

export type LevelSettings = Omit<LevelData, 'id'>;