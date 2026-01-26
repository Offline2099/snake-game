import { Component, computed, input } from '@angular/core';
// Constants & Enums
import { GameBlockType } from '../../../constants/game/game-block-type.enum';
import { FoodType } from '../../../constants/food/food-type.enum';
import { EnemyType } from '../../../constants/enemies/enemy-type.enum';
import { FOOD_DATA } from '../../../constants/food/food-data';
import { ENEMY_DATA } from '../../../constants/enemies/enemy-data';
// Inerfaces & Types
import { Level } from '../../../types/level/level.interface';
import { GameBlockSubType } from '../../../types/game/space/game-block-subtype.type';
// Components
import { AssetBlockComponent } from '../../shared/asset-block/asset-block.component';

enum InstructionPartType {
  key = 'key',
  button = 'button',
  asset = 'asset'
}

interface InstructionPartKey {
  type: InstructionPartType.key,
  icon: string;
  name: string;
}

interface InstructionPartButton {
  type: InstructionPartType.button,
  icon: string;
  name: string;
}

interface InstructionPartAsset {
  type: InstructionPartType.asset,
  assetType: GameBlockType;
  assetSubType: GameBlockSubType;
  assetName: string;
}

type InstructionPart = string | InstructionPartKey | InstructionPartButton | InstructionPartAsset;
type Instruction = InstructionPart[];

const KB_KEYS: Record<string, InstructionPartKey> = {
  ['space']: {
    type: InstructionPartType.key,
    icon: 'space',
    name: 'Space'
  }
}

const BUTTONS: Record<string, InstructionPartButton> = {
  ['start']: {
    type: InstructionPartType.button,
    icon: 'start',
    name: 'Start'
  }
}

const ASSET_TYPE_MAP: Record<string, GameBlockType> = {
  ['food']: GameBlockType.food,
  ['enemy']: GameBlockType.enemy
}

const FOOD_TYPE_MAP: Record<string, GameBlockSubType> = {
  ['normal']: FoodType.normal,
  ['yummy']: FoodType.yummy,
  ['delicious']: FoodType.delicious
}

const ENEMY_TYPE_MAP: Record<string, GameBlockSubType> = {
  ['shit']: EnemyType.shit,
  ['fire']: EnemyType.fire
}

@Component({
  selector: 'app-game-instructions',
  imports: [AssetBlockComponent],
  templateUrl: './game-instructions.component.html',
  styleUrl: './game-instructions.component.scss',
})
export class GameInstructionsComponent {

  readonly InstructionPartType = InstructionPartType;

  level = input.required<Level>();

  instructions = computed<Instruction[]>(() => 
    this.parseInstructions(this.level().settings.instructions)
  );

  parseInstructions(instructionsAsStrings: string[]): Instruction[] {
    return instructionsAsStrings.map(instruction => 
      instruction
        .split(/[\[\]]/)
        .map(part => this.convertStringToInstructionPart(part as string))
    );
  }

  convertStringToInstructionPart(string: string): InstructionPart {
    const [partType, entityType, entitySubType]: string[] = string.split('|');
    switch (partType) {
      case InstructionPartType.key:
        return KB_KEYS[entityType] || string;
      case InstructionPartType.button:
        return BUTTONS[entityType] || string;
      case InstructionPartType.asset:
        return this.parseAsset(entityType, entitySubType) || string;
      default:
        return string;
    }
  }

  parseAsset(typeString: string, subTypeString: string): InstructionPartAsset | null {
    if (!Object.keys(ASSET_TYPE_MAP).includes(typeString)) return null;
    const type: GameBlockType = ASSET_TYPE_MAP[typeString];
    let subType: GameBlockSubType | null = null;
    if (type === GameBlockType.food) subType = FOOD_TYPE_MAP[subTypeString];
    if (type === GameBlockType.enemy) subType = ENEMY_TYPE_MAP[subTypeString];
    if (subType === null) return null;
    return {
      type: InstructionPartType.asset,
      assetType: type,
      assetSubType: subType,
      assetName: this.assetName(type, subType as GameBlockSubType)
    } as InstructionPartAsset;
  }

  assetName(type: GameBlockType, subType?: GameBlockSubType): string {
    switch (type) {
      case GameBlockType.food:
        return FOOD_DATA[subType as FoodType].name;
      case GameBlockType.enemy:
        return ENEMY_DATA[subType as EnemyType].name;
      default:
        return '';
    }
  }

}
