import { Component, computed, input } from '@angular/core';
// Constants & Enums
import { GameBlockType } from '../../../constants/game/space-block/game-block-type.enum';
import { InstructionPartType } from '../../../constants/instructions/instruction-part-type.enum';
import { INSTRUCTIONS_KB_KEY } from '../../../constants/instructions/instructions-keb-key';
import { INSTRUCTIONS_BUTTON } from '../../../constants/instructions/instructions-button';
import { INSTRUCTIONS_ASSET_TYPE } from '../../../constants/instructions/instructions-asset-type';
import { INSTRUCTIONS_ENEMY_TYPE } from '../../../constants/instructions/instructions-enemy-type';
import { INSTRUCTIONS_FOOD_TYPE } from '../../../constants/instructions/instructions-food-type';
// Interfaces & Types
import { Level } from '../../../types/level/level.interface';
import { Instruction } from '../../../types/instructions/instruction.type';
import { InstructionPart } from '../../../types/instructions/instruction-part.type';
import { PartAsset } from '../../../types/instructions/part-asset.interface';
import { GameBlockSubType } from '../../../types/game/space-block/game-block-subtype.type';
// Components
import { AssetBlockComponent } from '../../shared/asset-block/asset-block.component';
// Services
import { GameBlockService } from '../../../services/game/game-block.service';

@Component({
  selector: 'app-game-instructions',
  imports: [AssetBlockComponent],
  templateUrl: './game-instructions.component.html',
  styleUrl: './game-instructions.component.scss',
})
export class GameInstructionsComponent {

  readonly InstructionPartType= InstructionPartType;

  level = input.required<Level>();

  instructions = computed<Instruction[]>(() => 
    this.parseInstructions(this.level().settings.instructions)
  );

  constructor(private gameBlock: GameBlockService) {}

  parseInstructions(instructionsAsStrings: string[]): Instruction[] {
    return instructionsAsStrings.map(instruction => 
      instruction.split(/[\[\]]/).map(part => this.parseInstructionPart(part))
    );
  }

  parseInstructionPart(string: string): InstructionPart {
    const [partType, entityType, entitySubType]: string[] = string.split('|');
    switch (partType) {
      case InstructionPartType.key:
        return INSTRUCTIONS_KB_KEY[entityType] || string;
      case InstructionPartType.button:
        return INSTRUCTIONS_BUTTON[entityType] || string;
      case InstructionPartType.asset:
        return this.parseAsset(entityType, entitySubType) || string;
      default:
        return string;
    }
  }

  parseAsset(typeString: string, subTypeString: string): PartAsset | null {
    if (!Object.keys(INSTRUCTIONS_ASSET_TYPE).includes(typeString)) return null;
    const type: GameBlockType = INSTRUCTIONS_ASSET_TYPE[typeString];
    let subType: GameBlockSubType | null = null;
    if (type === GameBlockType.food) subType = INSTRUCTIONS_FOOD_TYPE[subTypeString];
    if (type === GameBlockType.enemy) subType = INSTRUCTIONS_ENEMY_TYPE[subTypeString];
    if (subType === null) return null;
    return {
      type: InstructionPartType.asset,
      asset: { type, subType },
      assetName: this.gameBlock.blockName({ type, subType }, true)
    } as PartAsset;
  }

}
