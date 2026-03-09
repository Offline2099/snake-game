import { BackgroundSettings } from './background-settings.interface';

export interface VoronoiSettings extends BackgroundSettings {
  seedCount: number;
  tileSizePx: number;
}