import { Injectable } from '@angular/core';
// Constants & Enums
import { Orientation } from '../../constants/general/orientation/orientation.enum';
import { GameBlockType } from '../../constants/game/game-block-type.enum';
import { ObstacleType } from '../../constants/obstacles/obstacle-type.enum';
import { PortalType } from '../../constants/portals/portal-type.enum';
// Interfaces & Types
import { Position } from '../../types/general/position.interface';
import { EntityData } from '../../types/level/entity-data.interface';
import { LevelMapData } from '../../types/level/map/level-map-data.interface';
import { GameBlockBase } from '../../types/game/space/game-block-base.interface';
// Services
import { GeometryService } from '../general/geometry.service';
import { GameBlockService } from '../game/game-block.service';
import { AreaService } from './area.service';
import { WallService } from './wall.service';

@Injectable({
  providedIn: 'root'
})
export class MapEntityService {

  constructor(
    private geometry: GeometryService,
    private gameBlock: GameBlockService,
    private areaService: AreaService,
    private wallService: WallService
  ) { }

  //===========================================================================
  //  Map Entity Array
  //===========================================================================

  createArrayFromData(map: LevelMapData): EntityData[] {
    const array: EntityData[] = [];
    if (map.entities) Object.entries(map.entities).forEach(([x, value]) => 
      Object.entries(value).forEach(([y, block]) => 
        array.push({ position: { x: Number(x), y: Number(y) }, block })
      )
    );
    if (map.areas) map.areas.forEach(area => 
      this.areaService.includedPositions(area).forEach(position => 
        array.push({ position, block: area.block })
      )
    );
    if (map.walls) map.walls.forEach(wall => 
      this.areaService.includedPositions(wall).forEach(position => 
        array.push({ position, block: this.wallService.currentBlock(wall, position) })
      )
    );
    if (map.portals) map.portals.forEach(portal => {
      this.addEntityToArray(array, portal.entrance, this.gameBlock.portalEntrance());
      this.addEntityToArray(array, portal.exit, this.gameBlock.portalExit());
    });
    return array;
  }

  addEntityToArray(array: EntityData[], position: Position, block: GameBlockBase): void {
    for (const [index, entity] of array.entries()) {
      if (this.geometry.isSamePosition(entity.position, position)) {
        if (entity.block.type === GameBlockType.portal) {
          if (
            this.gameBlock.areBlocksEqual(block, this.gameBlock.portalExit())
             && entity.block.subType === PortalType.exit
          ) return; 
          this.removePortalFromArray(array, index);
          array.push({ position, block });
          return;
        }
        if (this.gameBlock.areBlocksEqual(entity.block, block)) return;
        array[index] = { position, block };
        return;
      }
    }
    array.push({ position, block });
  }

  addEntitiesToArray(array: EntityData[], entities: EntityData[]): void {
    entities.forEach(entity => this.addEntityToArray(array, entity.position, entity.block));
  }

  removeEntityFromArray(array: EntityData[], position: Position, checkPortals: boolean = true): void {
    for (const [index, entity] of array.entries()) {
      if (this.geometry.isSamePosition(position, entity.position)) {
        if (checkPortals && entity.block.type === GameBlockType.portal) 
          this.removePortalFromArray(array, index);
        else array.splice(index, 1);
        break;
      }
    }
  }

  removeEntitiesFromArray(array: EntityData[], positions: Position[], checkPortals: boolean = true): void {
    positions.forEach(position => this.removeEntityFromArray(array, position, checkPortals));
  }

  //===========================================================================
  //  Walls
  //===========================================================================

  rockEntity(position: Position): EntityData {
    return { position, block: this.gameBlock.obstacle(ObstacleType.rock) };
  }

  wallStartEntity(position: Position, orientation: Orientation): EntityData {
    return { position, block: this.wallService.startBlock(orientation) };
  }

  wallEndEntity(position: Position, orientation: Orientation): EntityData {
    return { position, block: this.wallService.endBlock(orientation) };
  }

  wallBodyEtities(start: Position, end: Position, block: GameBlockBase): EntityData[] {
    switch (block.subType) {
      case ObstacleType.wallHorizontal:
        return Array.from({ length: end.x - start.x - 1 }, (_, index) => ({ 
          position: { x: start.x + index + 1, y: start.y }, block
        }));
      case ObstacleType.wallVertical:
        return Array.from({ length: start.y - end.y - 1 }, (_, index) => ({ 
          position: { x: start.x, y: start.y - index - 1 }, block
        }));
      default:
        return [];
    }
  }

  //===========================================================================
  //  Portals
  //===========================================================================

  private removePortalFromArray(array: EntityData[], index: number): void {
    if (array[index].block.subType === PortalType.entrance) {
      const exit: Position = array[index].block.portalTo!;
      array.splice(index, 1);
      if (!this.sameExitCount(array, exit)) this.removeEntityFromArray(array, exit, false);
      return;
    }
    if (array[index].block.subType === PortalType.exit) {
      const entrances: Position[] = array.filter(entity => 
        entity.block.portalTo 
          && this.geometry.isSamePosition(entity.block.portalTo, array[index].position)
      ).map(entity => entity.position);
      array.splice(index, 1);
      this.removeEntitiesFromArray(array, entrances, false);
    }
  }

  private sameExitCount(array: EntityData[], position: Position): number {
    return array.reduce((acc, entity) => {
      if (!entity.block.portalTo) return acc;
      return this.geometry.isSamePosition(entity.block.portalTo, position) ? acc + 1 : acc;
    }, 0);
  }

}