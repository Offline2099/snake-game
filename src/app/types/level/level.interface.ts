import { LevelBase } from './level-base.interface';
import { LevelProgression } from './level-progression.interface';
import { LevelSettings } from './level-settings.type';

export interface Level extends LevelBase {
  progression: LevelProgression;
  settings: LevelSettings;
}