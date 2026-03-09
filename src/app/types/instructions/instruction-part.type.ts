import { PartKey } from './part-kb-key.interface';
import { PartButton } from './part-button.interface';
import { PartAsset } from './part-asset.interface';

export type InstructionPart = string | PartKey | PartButton | PartAsset;