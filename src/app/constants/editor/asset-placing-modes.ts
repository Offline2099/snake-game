import { AssetPlacingModeId } from './asset-placing-mode-id.enum';
import { AssetPlacingMode } from '../../types/editor/asset-placing-mode.interface';

export const ASSET_PLACING_MODE_LIST: AssetPlacingMode[] = [
  { id: AssetPlacingModeId.single, name: 'Single Block' },
  { id: AssetPlacingModeId.area, name: 'Area' }
];