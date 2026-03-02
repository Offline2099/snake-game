import { Component, computed, input } from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
// Constants & Enums
import { ORIENTATION } from '../../../constants/general/orientation/orientation';
import { AssetPlacingModeId } from '../../../constants/editor/asset-placing-mode-id.enum';
import { GameBlockType } from '../../../constants/game/game-block-type.enum';
import { PortalType } from '../../../constants/portals/portal-type.enum';
// Interfaces & Types
import { Position } from '../../../types/general/position.interface';
import { Portal } from '../../../types/general/portal.interface';
import { LevelMapArea } from '../../../types/level/map/level-map-area.interface';
import { Wall } from '../../../types/level/map/wall.interface';
import { EntityData } from '../../../types/level/entity-data.interface';
import { GameBlockBase } from '../../../types/game/space/game-block-base.interface';
// Components
import { AssetBlockComponent } from '../../shared/asset-block/asset-block.component';
// Services
import { GeometryService } from '../../../services/general/geometry.service';
import { LevelService } from '../../../services/level/level.service';
import { GameBlockService } from '../../../services/game/game-block.service';
import { WallService } from '../../../services/level/wall.service';

interface GameBlock extends GameBlockBase {
  name: string;
}

interface WallData extends Wall {
  orientaion: string;
  length: number;
}

@Component({
  selector: 'app-tooltip',
  imports: [NgClass, NgTemplateOutlet, AssetBlockComponent],
  templateUrl: './tooltip.component.html',
  styleUrl: './tooltip.component.scss',
})
export class TooltipComponent {

  readonly LMB: string = 'Left click';
  readonly RMB: string = 'Right click';
  readonly Mode = AssetPlacingModeId;
  readonly GameBlockType = GameBlockType;
  readonly PortalType = PortalType;

  cursor = input.required<Position>();
  blocks = input.required<EntityData[]>();
  areas = input.required<LevelMapArea[]>();
  portals = input.required<Portal[]>();
  walls = input.required<Wall[]>();
  asset = input.required<GameBlockBase | null>();
  mode = input.required<AssetPlacingModeId>();
  isActionInProgress = input.required<boolean>();  

  blockUnderCursor = computed<GameBlock | null>(() => 
    this.updateBlockUnderCursor(this.blocks(), this.cursor())
  );

  areaUnderCursor = computed<LevelMapArea | null>(() => 
    this.updateAreaUnderCursor(this.areas(), this.cursor())
  );

  wallUnderCursor = computed<WallData | null>(() => 
    this.updateWallUnderCursor(this.walls(), this.cursor())
  );

  portalsUnderCursor = computed<Portal[] | null>(() => 
    this.updatePortalsUnderCursor(this.portals(), this.cursor())
  );

  constructor(
    private geometry: GeometryService,
    private gameBlock: GameBlockService,
    private levelService: LevelService,
    private wallService: WallService
  ) { }
  
  updateBlockUnderCursor(blocks: EntityData[], cursor: Position): GameBlock | null {
    const entity: EntityData | undefined = blocks.find(entity => 
      this.geometry.isSamePosition(entity.position, cursor)
    );
    return entity 
      ? { ...entity.block, name: this.gameBlock.blockName(entity.block) }
      : null;
  }

  updateAreaUnderCursor(areas: LevelMapArea[], cursor: Position): LevelMapArea | null {
    return areas.find(area => this.levelService.isWithinArea(area, cursor)) || null;
  }

  updateWallUnderCursor(walls: Wall[], position: Position): WallData | null {
    const wall: Wall | undefined = walls.find(wall => 
      this.levelService.isWithinWall(wall, position)
    );
    return wall 
      ? {
          ...wall,
          orientaion: ORIENTATION[this.wallService.orientation(wall)],
          length: this.wallService.length(wall)
        } 
      : null;
  }

  updatePortalsUnderCursor(allPortals: Portal[], position: Position): Portal[] | null {
    const portals: Portal[] = allPortals.filter(portal => 
      this.geometry.isSamePosition(portal.entrance, position)
        || this.geometry.isSamePosition(portal.exit, position)
    );
    return portals.length > 0 ? portals : null;
  }

}
