import { Component, input, model } from '@angular/core';
import { NgClass, NgStyle, NgTemplateOutlet } from '@angular/common';
// Constants & Enums
import { AREA_SIZE, BLOCK_SIZE } from '../../../constants/game/game-area';
import { AssetPlacingModeId } from '../../../constants/editor/asset-placing-mode-id.enum';
// Interfaces & Types
import { Position } from '../../../types/general/position.interface';
import { Rectangle } from '../../../types/general/rectangle.interface';
import { LevelData } from '../../../types/level/level-data.interface';
import { EntityData } from '../../../types/level/entity-data.interface';
import { GameBlockData } from '../../../types/game/space/game-block-data.interface';
// Components
import { AssetBlockComponent } from '../../shared/asset-block/asset-block.component';
// Services
import { GeometryService } from '../../../services/geometry.service';

enum RulerOrientation {
  horizontal,
  vertical
}

const DEFAULT_POSITION: Position = {
  x: -1,
  y: -1
}

const TRACKER_SHIFT: number = 30;

@Component({
  selector: 'app-area',
  imports: [NgClass, NgStyle, NgTemplateOutlet, AssetBlockComponent],
  templateUrl: './area.component.html',
  styleUrl: './area.component.scss',
})
export class AreaComponent {

  readonly AREA_SIZE = AREA_SIZE;
  readonly BLOCK_SIZE = BLOCK_SIZE;
  readonly RulerOrientation = RulerOrientation;
  readonly TRACKER_SHIFT = TRACKER_SHIFT;

  level = model.required<LevelData>();
  selectedAsset = input.required<GameBlockData | null>();
  selectedModeId = input.required<AssetPlacingModeId>();

  mousePx: Position = DEFAULT_POSITION;
  mousePosition: Position = DEFAULT_POSITION;

  isFillActive: boolean = false;
  areaStart: Position = DEFAULT_POSITION;
  temporaryArray: EntityData[] = [];

  constructor(private geometry: GeometryService) {}

  setDefaultMousePosition(): void {
    this.mousePx = DEFAULT_POSITION;
    this.mousePosition = DEFAULT_POSITION;
  }

  onMousePositionChange(event: MouseEvent): void {
    this.updateMousePosition(event);
    this.updateTemporaryArray();
  }

  updateMousePosition(event: MouseEvent): void {
    const target: HTMLElement = event.target as HTMLElement;
    const rect: DOMRect = target.getBoundingClientRect();
    this.mousePx = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
    this.mousePosition = {
      x: Math.floor(this.mousePx.x / BLOCK_SIZE),
      y: AREA_SIZE - Math.floor(this.mousePx.y / BLOCK_SIZE) - 1
    }
  }

  updateTemporaryArray(): void {
    if (!this.isFillActive || this.selectedAsset() === null) return;
    this.temporaryArray = [];
    const area: Rectangle = this.geometry.rectangleFromTwoPoints(this.areaStart, this.mousePosition);
    this.fillArea(this.temporaryArray, area, this.selectedAsset()!);
  }

  onMapLeftClick(): void {
    if (this.selectedAsset() === null) return;
    switch (this.selectedModeId()) {
      case AssetPlacingModeId.single:
        this.addEntity(this.level().entities, this.mousePosition, this.selectedAsset()!);
        break;
      case AssetPlacingModeId.area:
        this.isFillActive = !this.isFillActive;
        if (!this.isFillActive) {
          const area: Rectangle = this.geometry.rectangleFromTwoPoints(this.areaStart, this.mousePosition);
          this.fillArea(this.level().entities, area, this.selectedAsset()!);
          this.temporaryArray = [];
        }
        this.areaStart = this.isFillActive ? this.mousePosition : DEFAULT_POSITION;
        break;
    }
  }

  onMapRightClick(e: MouseEvent): void {
    e.preventDefault();
    if (this.selectedAsset() === null) return;
    switch (this.selectedModeId()) {
      case AssetPlacingModeId.single:
        this.removeEntity(this.level().entities, this.mousePosition);
        break;
      case AssetPlacingModeId.area:
        if (this.isFillActive) {
          this.isFillActive = false;
          this.temporaryArray = [];
        }
        break;
    }
  }

  addEntity(array: EntityData[], position: Position, block: GameBlockData): void {
    this.removeEntity(array, position);
    array.push({ position: { ...position }, block: { ...block } });
  }

  removeEntity(array: EntityData[], position: Position): void {
    for (const [index, entity] of array.entries()) {
      if (this.geometry.isSamePosition(position, entity.position)) {
        array.splice(index, 1);
        break;
      }
    }
  }

  fillArea(array: EntityData[], area: Rectangle, block: GameBlockData): void {
    for(let x = area.topLeft.x; x <= area.bottomRight.x; x++) {
      for(let y = area.topLeft.y; y >= area.bottomRight.y; y--) {
        this.addEntity(array, { x, y }, block);
      }
    }
  }

}
