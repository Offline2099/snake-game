import { AssetPlacingModeId } from './asset-placing-mode-id.enum';
import { AssetPlacingMode } from '../../types/editor/asset-placing-mode.interface';

export const ASSET_PLACING_MODES: AssetPlacingMode[] = [
  { id: AssetPlacingModeId.single, name: 'Single' },
  { id: AssetPlacingModeId.area, name: 'Area' }
];