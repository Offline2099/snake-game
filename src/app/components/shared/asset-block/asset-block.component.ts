import { Component, input, computed } from '@angular/core';
import { GameBlock } from '../../../types/game/space-block/game-block.interface';
import { GameBlockService } from '../../../services/game/game-block.service';

@Component({
  selector: 'app-asset-block',
  host: { '[class]': 'blockClass()' },
  imports: [],
  templateUrl: './asset-block.component.html',
  styleUrl: './asset-block.component.scss',
})
export class AssetBlockComponent {

  block = input.required<GameBlock>();

  blockClass = computed<string>(() => this.gameBlock.blockClass(this.block()));
  blockImage = computed<string | null>(() => this.gameBlock.blockImage(this.block()))

  constructor(private gameBlock: GameBlockService) {}

}
