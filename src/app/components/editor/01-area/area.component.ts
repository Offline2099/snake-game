import { Component, signal, effect, model } from '@angular/core';
import { NgClass, NgStyle, NgTemplateOutlet } from '@angular/common';
// Constants & Enums
import { Orientation } from '../../../constants/general/orientation/orientation.enum';
import { AREA_SIZE, BLOCK_SIZE } from '../../../constants/game/game-area';
import { AssetPlacingModeId as Mode } from '../../../constants/editor/asset-placing-mode-id.enum';
import { GameBlockType } from '../../../constants/game/game-block-type.enum';
import { ObstacleType } from '../../../constants/obstacles/obstacle-type.enum';
import { PortalType } from '../../../constants/portals/portal-type.enum';
// Interfaces & Types
import { Position } from '../../../types/general/position.interface';
import { Rectangle } from '../../../types/general/rectangle.interface';
import { Portal } from '../../../types/general/portal.interface';
import { LevelData } from '../../../types/level/level-data.interface';
import { LevelMapData } from '../../../types/level/map/level-map-data.interface';
import { Wall } from '../../../types/level/map/wall.interface';
import { EntityData } from '../../../types/level/entity-data.interface';
import { GameBlockBase } from '../../../types/game/space/game-block-base.interface';
// Components
import { AssetBlockComponent } from '../../shared/asset-block/asset-block.component';
import { TooltipComponent } from '../04-tooltip/tooltip.component';
// Services
import { GeometryService } from '../../../services/general/geometry.service';
import { LevelService } from '../../../services/level/level.service';
import { GameBlockService } from '../../../services/game/game-block.service';
import { MapEntityService } from '../../../services/level/map-entity.service';
import { WallService } from '../../../services/level/wall.service';

const TOOLTIP_SHIFT_PX: number = 30;

@Component({
  selector: 'app-area',
  imports: [NgClass, NgStyle, NgTemplateOutlet, AssetBlockComponent, TooltipComponent],
  templateUrl: './area.component.html',
  styleUrl: './area.component.scss',
})
export class AreaComponent {

  readonly AREA_SIZE = AREA_SIZE;
  readonly BLOCK_SIZE = BLOCK_SIZE;
  readonly Orientation = Orientation;
  readonly TOOLTIP_SHIFT_PX = TOOLTIP_SHIFT_PX;
  readonly GameBlockType = GameBlockType;
  readonly PortalType = PortalType;

  level = model.required<LevelData>();
  selectedAsset = model.required<GameBlockBase>();
  selectedMode = model.required<Mode>();
  previousMode = model.required<Mode>();

  mousePixelPosition: Position | null = null;
  mousePosition = signal<Position | null>(null);
  
  levelMapEntities: EntityData[] = [];

  isActionInProgress: boolean = false;
  actionAnchor: Position | null = null;
  actionEntities: EntityData[] = [];

  constructor(
    private geometry: GeometryService,
    private gameBlock: GameBlockService,
    private levelService: LevelService,
    private mapEntity: MapEntityService,
    private wallService: WallService
  ) { 
    effect(() => {
      if (this.level().map) 
        this.levelMapEntities = this.mapEntity.createArrayFromData(this.level().map!);
    });
    effect(() => {
      if (this.selectedMode()) this.resetAction();
    });
    effect(() => {
      if (this.mousePosition() && this.actionAnchor) 
        this.updateActionEntities(
          this.selectedMode(),
          this.actionAnchor,
          this.mousePosition()!,
          this.selectedAsset()          
        );
    });
  }

  //===========================================================================
  //  Mouse Position Change
  //===========================================================================

  onMouseMove(event: MouseEvent): void {
    this.updateMousePixelPosition(event);
    this.updateMousePosition(this.mousePixelPosition);
  }

  onMouseLeave(): void {
    this.mousePixelPosition = null;
    this.mousePosition.set(null);
  }

  updateMousePixelPosition(event: MouseEvent): void {
    const rect: DOMRect = (event.target as HTMLElement).getBoundingClientRect();
    this.mousePixelPosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
  }

  updateMousePosition(pixelPosition: Position | null): void {
    if (!pixelPosition) {
      this.mousePosition.set(null);
      return;
    }
    const postition: Position = {
      x: Math.floor(pixelPosition.x / BLOCK_SIZE),
      y: AREA_SIZE - Math.ceil(pixelPosition.y / BLOCK_SIZE)
    };
    const current: Position | null = this.mousePosition();
    if (current && this.geometry.isSamePosition(current, postition)) return;
    this.mousePosition.set(postition);
  }

  //===========================================================================
  //  Mouse Clicks
  //===========================================================================

  onMapLeftClick(): void {
    const map: LevelMapData = this.level().map || {};
    const anchor: Position | null = this.actionAnchor;
    const mouse: Position = this.mousePosition()!;
    const block: GameBlockBase = this.selectedAsset();
    switch (this.selectedMode()) {
      case Mode.single:
        this.addEntityAtPosition(map, mouse, block);
        break;
      case Mode.area:
        if (this.isActionInProgress) {
          if (anchor) this.endAreaSelection(map, anchor, mouse, block);
        }
        else this.beginAreaSelection(mouse, block);
        break;
      case Mode.wall:
        if (this.isActionInProgress) {
          if (anchor) this.endWallSetup(map, anchor, mouse, block);
        } 
        else this.beginWallSetup(mouse);
        break;
      case Mode.portal:
        if (this.isActionInProgress) {
          if (anchor) this.endPortalSetup(map, anchor, mouse);
        } 
        else this.beginPortalSetup(mouse, block);
        break;
    }
  }

  onMapRightClick(e: MouseEvent): void {
    e.preventDefault();
    const map: LevelMapData = this.level().map || {};
    const position: Position = this.mousePosition()!;
    switch (this.selectedMode()) {
      case Mode.single:
        this.removeEntityAtPosition(map, position);
        break;
      case Mode.area:
      case Mode.wall:
      case Mode.portal:
        if (this.isActionInProgress) this.resetAction();
        else this.removeEntityAtPosition(map, position);
        break;
    }
  }

  //===========================================================================
  //  Action Flow
  //===========================================================================

  beginAction(anchor: Position, entity: EntityData): void {
    this.isActionInProgress = true;
    this.actionAnchor = anchor;
    this.actionEntities = [entity];
  }

  updateActionEntities(mode: Mode, anchor: Position, mouse: Position, block: GameBlockBase): void {
    switch (mode) {
      case Mode.area:
        this.updateAreaActionEntities(anchor, mouse, block);
        break;
      case Mode.wall:
        this.updateWallActionEntities(anchor, mouse, block);
        break;
      case Mode.portal:
        this.updatePortalActionEntities(anchor, mouse, block);
        break;
    }
  }

  endAction(): void {
    this.mapEntity.addEntitiesToArray(this.levelMapEntities, this.actionEntities);
    this.resetAction();
  }

  resetAction(): void {
    this.isActionInProgress = false;
    this.actionAnchor = null;
    this.actionEntities = [];
  }

  //===========================================================================
  //  Single Position
  //===========================================================================

  addEntityAtPosition(map: LevelMapData, position: Position, block: GameBlockBase): void {
    this.levelService.addMapEntity(map, position, block);
    this.mapEntity.addEntityToArray(this.levelMapEntities, position, block);
  }

  removeEntityAtPosition(map: LevelMapData, position: Position): void {
    this.levelService.removeMapEntity(map, position);
    this.mapEntity.removeEntityFromArray(this.levelMapEntities, position);
  }

  //===========================================================================
  //  Areas
  //===========================================================================
  
  beginAreaSelection(position: Position, block: GameBlockBase): void {
    this.beginAction(position, { position, block });
  }

  endAreaSelection(map: LevelMapData, anchor: Position, mouse: Position, block: GameBlockBase): void {
    const area: Rectangle = this.geometry.rectangleFromTwoPoints(anchor, mouse);
    this.levelService.addMapArea(map, area, block);
    this.endAction();
  }

  updateAreaActionEntities(anchor: Position, mouse: Position, block: GameBlockBase): void {
    const area: Rectangle = this.geometry.rectangleFromTwoPoints(anchor, mouse);
    this.actionEntities = this.geometry.positionsWithinRectangle(area)
      .map(position => ({ position, block }));
  }

  //===========================================================================
  //  Walls
  //===========================================================================

  beginWallSetup(position: Position): void {
    this.beginAction(position, this.mapEntity.rockEntity(position));
  }

  endWallSetup(map: LevelMapData, anchor: Position, mouse: Position, block: GameBlockBase): void {
    const orientation: Orientation = this.wallService.orientationByBodyBlock(block);
    const start: Position = this.wallStartPosition(anchor, mouse, orientation);
    const end: Position = this.wallEndPosition(anchor, mouse, orientation);
    if (this.geometry.isSamePosition(start, end)) {
      this.levelService.addMapEntity(map, mouse, this.gameBlock.obstacle(ObstacleType.rock));
    } 
    else {
      const wall: Wall = { rectangle: this.geometry.rectangleFromTwoPoints(start, end) };
      this.levelService.addMapWall(map, wall);
    }
    this.endAction();
  }

  updateWallActionEntities(anchor: Position, mouse: Position, block: GameBlockBase): void {
    const orientation: Orientation = this.wallService.orientationByBodyBlock(block);
    const start: Position = this.wallStartPosition(anchor, mouse, orientation);
    const end: Position = this.wallEndPosition(anchor, mouse, orientation);
    if (this.geometry.isSamePosition(start, end)) {
      this.actionEntities = [{ position: start, block: this.gameBlock.obstacle(ObstacleType.rock) }];
      return;
    }
    this.actionEntities = [
      this.mapEntity.wallStartEntity(start, orientation),
      ...this.mapEntity.wallBodyEtities(start, end, block),
      this.mapEntity.wallEndEntity(end, orientation)
    ];
  }

  wallStartPosition(anchor: Position, mouse: Position, orientation: Orientation): Position {
    switch (orientation) {
      case Orientation.horizontal:
        return mouse.x > anchor.x ? anchor : { x: mouse.x, y: anchor.y };
      case Orientation.vertical:
        return mouse.y < anchor.y ? anchor : { x: anchor.x, y: mouse.y };
    }
  }

  wallEndPosition(anchor: Position, mouse: Position, orientation: Orientation): Position {
    switch (orientation) {
      case Orientation.horizontal:
        return mouse.x > anchor.x ? { x: mouse.x, y: anchor.y } : anchor;
      case Orientation.vertical:
        return mouse.y < anchor.y ? { x: anchor.x, y: mouse.y } : anchor;
    }
  }

  //===========================================================================
  //  Portals
  //===========================================================================

  beginPortalSetup(position: Position, block: GameBlockBase): void {
    this.beginAction(position, { position, block });
    this.selectedAsset.set(this.gameBlock.portalExit());
  }

  endPortalSetup(map: LevelMapData, anchor: Position, mouse: Position): void {
    if (this.geometry.isSamePosition(anchor, mouse)) return;
    const portal: Portal = { entrance: anchor, exit: mouse };
    this.levelService.addPortal(map, portal);
    this.endAction();
    this.selectedAsset.set(this.gameBlock.portalEntrance());
  }

  updatePortalActionEntities(anchor: Position, mouse: Position, block: GameBlockBase): void {
    const entrance: EntityData = { position: anchor, block: this.gameBlock.portalEntrance(mouse) };
    const exit: EntityData = { position: mouse, block };
    this.actionEntities = this.geometry.isSamePosition(anchor, mouse) ? [entrance] : [entrance, exit];
  }

}
