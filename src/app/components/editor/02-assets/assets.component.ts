import { Component, computed, model } from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
// Constants & Enums
import { Orientation } from '../../../constants/general/orientation.enum';
import { AssetPlacingModeId as Mode } from '../../../constants/editor/asset-placing-mode-id.enum';
import { ASSET_PLACING_MODE_LIST } from '../../../constants/editor/asset-placing-modes';
import { GameBlockType as AssetType } from '../../../constants/game/game-block-type.enum';
import { ObstacleType } from '../../../constants/obstacles/obstacle-type.enum';
// Interfaces & Types
import { GameBlockBase } from '../../../types/game/space/game-block-base.interface';
// Components
import { AssetBlockComponent } from '../../shared/asset-block/asset-block.component';
// Services
import { WallService } from '../../../services/level/wall.service';
import { GameBlockService } from '../../../services/game/game-block.service';

@Component({
  selector: 'app-assets',
  imports: [NgClass, NgTemplateOutlet, AssetBlockComponent],
  templateUrl: './assets.component.html',
  styleUrl: './assets.component.scss',
})
export class AssetsComponent {

  readonly Orientation = Orientation;
  readonly MODE_LIST = ASSET_PLACING_MODE_LIST;
  readonly AssetType = AssetType;
  readonly ObstacleType = ObstacleType;

  selectedAsset = model.required<GameBlockBase>();
  selectedMode = model.required<Mode>();
  previousMode = model.required<Mode>();

  isButtonActive = computed<boolean>(() => 
    this.selectedMode() === Mode.wall || this.selectedMode() === Mode.portal
  );

  obstacles: GameBlockBase[];
  enemies: GameBlockBase[];
  food: GameBlockBase[];

  constructor(private gameBlock: GameBlockService, private wallService: WallService) {
    this.obstacles = this.gameBlock.allObstacles();
    this.enemies = this.gameBlock.allEnemies();
    this.food = this.gameBlock.allFood();
  }

  selectAsset(asset: GameBlockBase): void {
    this.selectedAsset.set({ ...asset });
  }

  selectMode(modeId: Mode): void {
    if (!this.isButtonActive()) this.previousMode.set(this.selectedMode());
    this.selectedMode.set(modeId);
  }

  pickAsset(asset: GameBlockBase): void {
    if (this.isButtonActive()) this.selectedMode.set(this.previousMode());
    this.selectAsset(asset);
  }

  addWall(orientation: Orientation): void {
    this.selectAsset(this.wallService.bodyBlock(orientation));
    this.selectMode(Mode.wall);
  }

  addPortal(): void {
    this.selectAsset(this.gameBlock.portalEntrance());
    this.selectMode(Mode.portal);
  }

}
