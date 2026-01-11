import { Component, HostBinding, input } from '@angular/core';
import { GameBlockType } from '../../../constants/game/game-block-type.enum';
import { BLOCK_CLASS } from '../../../constants/game/block-class';
import { GameBlockSubType } from '../../../types/game/space/game-block-subtype.type';

@Component({
  selector: 'app-asset-block',
  imports: [],
  templateUrl: './asset-block.component.html',
  styleUrl: './asset-block.component.scss',
})
export class AssetBlockComponent {

  @HostBinding('class') get blockClass(): string {
    return this.subType() === undefined 
      ? BLOCK_CLASS[this.type()] as string
      : BLOCK_CLASS[this.type()][this.subType()!];
  }

  readonly GameBlockType = GameBlockType;
  readonly BLOCK_CLASS = BLOCK_CLASS;

  type = input.required<GameBlockType>();
  subType = input.required<GameBlockSubType | undefined>();

}
