import { Injectable } from '@angular/core';
// Interfaces & Types
import { Position } from '../../types/general/position.interface';
import { Rectangle } from '../../types/general/rectangle.interface';
import { Portal } from '../../types/general/portal.interface';
import { Level } from '../../types/level/level.interface';
import { Space } from '../../types/game/space.type';
import { GameBlock } from '../../types/game/space-block/game-block.interface';
import { LevelMapData } from '../../types/level/map/level-map-data.interface';
import { LevelMapArea } from '../../types/level/map/level-map-area.interface';
import { Wall } from '../../types/level/map/wall.interface';
// Services
import { UtilityService } from '../general/utility.service';
import { GeometryService } from '../general/geometry.service';
import { GameBlockService } from '../game/game-block.service';
import { SpaceService } from '../game/space.service';
import { AreaService } from './area.service';
import { WallService } from './wall.service';

@Injectable({
  providedIn: 'root'
})
export class LevelService {

  constructor(
    private utility: UtilityService,
    private geometry: GeometryService,
    private gameBlock: GameBlockService,
    private spaceService: SpaceService,
    private areaService: AreaService,
    private wallService: WallService
  ) {}

  //===========================================================================
  //  Level Map Setup
  //===========================================================================

  setLevelMap(space: Space, level: Level): void {
    if (!level.settings.map) return;
    this.setMapEntities(space, level);
    this.setMapAreas(space, level);
    this.setWalls(space, level);
    this.setPortals(space, level);
  }

  private setMapEntities(space: Space, level: Level): void {
    if (!level.settings.map?.entities) return;
    Object.entries(level.settings.map.entities).forEach(([x, value]) => 
      Object.entries(value).forEach(([y, block]) => {
        const position: Position = { x: Number(x), y: Number(y) };
        this.setEntity(space, level, position, block);
      })
    );
  }

  private setMapAreas(space: Space, level: Level): void {
    if (!level.settings.map?.areas) return;
    level.settings.map.areas.forEach(area => 
      this.areaService.includedPositions(area).forEach(position => 
        this.setEntity(space, level, position, area.block)
      )
    );
  }

  private setWalls(space: Space, level: Level): void {
    if (!level.settings.map?.walls) return;
    level.settings.map.walls.forEach(wall => 
      this.areaService.includedPositions(wall).forEach(position => 
        this.setEntity(space, level, position, this.wallService.currentBlock(wall, position))
      )
    );
  }

  private setPortals(space: Space, level: Level): void {
    if (!level.settings.map?.portals) return;
    level.settings.map.portals.forEach(portal => {
      this.setEntity(space, level, portal.entrance, this.gameBlock.portalEntrance(portal.exit));
      this.setEntity(space, level, portal.exit, this.gameBlock.portalExit());
    });
  }

  private setEntity(space: Space, level: Level, position: Position, block: GameBlock): void {
    this.spaceService.setBlock(space, position, block);
    this.spaceService.protectEntity(space, level, position, block.type);
  }

  //===========================================================================
  //  Counters
  //===========================================================================

  countEntities(level: Level, block: GameBlock): number {
    return this.countSingleEntities(level, block) + this.countEntitiesInAreas(level, block);
  }

  private countSingleEntities(level: Level, block: GameBlock): number {
    if (!level.settings.map?.entities) return 0;
    return Object.values(level.settings.map.entities).reduce((acc, x) => {
      acc += Object.values(x).reduce((accX, data) => {
        accX += this.gameBlock.areBlocksEqual(data, block) ? 1 : 0;
        return accX;
      }, 0);
      return acc;
    }, 0);
  }

  private countEntitiesInAreas(level: Level, block: GameBlock): number {
    if (!level.settings.map?.areas) return 0;
    return level.settings.map.areas.reduce((acc, area) => {
      if (this.gameBlock.areBlocksEqual(area.block, block))
        acc += this.areaService.includedPositions(area).length;
      return acc;
    }, 0);
  }

  //===========================================================================
  //  Level Map: Single Block Entitites
  //===========================================================================

  addMapEntity(map: LevelMapData, position: Position, block: GameBlock): void {
    const keepEntity: boolean = this.resolveOverlapForEntity(map, position, block);
    if (!keepEntity) return;
    if (!map.entities) map.entities = {};
    if (!map.entities[position.x]) map.entities[position.x] = {};
    map.entities[position.x][position.y] = block;
  }

  removeMapEntity(map: LevelMapData, position: Position): void {
    this.resolveOverlapForEntity(map, position);
    if (!map.entities) return;
    if (!map.entities[position.x]) return;
    delete map.entities[position.x][position.y];
    if (this.utility.isEmptyObject(map.entities[position.x])) delete map.entities[position.x];
    if (this.utility.isEmptyObject(map.entities)) delete map.entities;
  }

  private resolveOverlapForEntity(map: LevelMapData, position: Position, block?: GameBlock): boolean {
    return this.resolveEntityOverlapWithAreas(map, position, block)
      && this.resolveEntityOverlapWithWalls(map, position, block)
      && this.resolveEntityOverlapWithPortals(map, position);
  }

  resolveEntityOverlapWithAreas(map: LevelMapData, position: Position, block?: GameBlock): boolean {
    if (!map.areas) return true;
    let keepEntity: boolean = true;
    map.areas.forEach(area => {
      if (this.geometry.isOutsideRectangle(area.rectangle, position)) return;
      if (block && this.gameBlock.areBlocksEqual(block, area.block)) {
        this.areaService.includePosition(area, position);
        keepEntity = false;
        return;
      }
      this.excludePositionFromArea(map, area, position);
    });
    return keepEntity;
  }

  resolveEntityOverlapWithWalls(map: LevelMapData, position: Position, block?: GameBlock): boolean {
    if (!map.walls) return true;
    let keepEntity: boolean = true;
    map.walls.forEach(wall => {
      if (this.geometry.isOutsideRectangle(wall.rectangle, position)) return;
      if (block) {
        if (this.wallService.isSuitableBlock(wall, position, block)) {
          this.areaService.includePosition(wall, position);
          this.wallService.updateWallEnds(wall, position, block);
          keepEntity = false;
          return;
        }
      }
      this.excludePositionFromWall(map, wall, position);
    });
    return keepEntity;
  }

  resolveEntityOverlapWithPortals(map: LevelMapData, position: Position): boolean {
    if (!map.portals) return true;
    this.removePortal(map, { position });
    return true;
  }

  //===========================================================================
  //  Level Map: Areas
  //===========================================================================

  addMapArea(map: LevelMapData, rectangle: Rectangle, block: GameBlock): void {
    if (this.geometry.isSingleBlock(rectangle)) {
      this.addMapEntity(map, rectangle.topLeft, block);
      return;
    }
    const area: LevelMapArea = { rectangle, block };
    this.resolveOverlapForArea(map, area);
    if (!map.areas) map.areas = [];
    map.areas.push(area);
  }

  isWithinArea(area: LevelMapArea, position: Position): boolean {
    return this.areaService.isWithinArea(area, position);
  }

  private removeMapArea(map: LevelMapData, area: LevelMapArea): void {
    if (!map.areas) return;
    for (const [index, entry] of map.areas.entries()) {
      if (this.geometry.isSameRectangle(entry.rectangle, area.rectangle)) {
        map.areas.splice(index, 1);
        break;
      }
    }
    if (map.areas.length === 0) delete map.areas;
  }

  private excludePositionFromArea(map: LevelMapData, area: LevelMapArea, position: Position): void {
    this.areaService.excludePosition(area, position);
    this.optimizeArea(map, area);
  }

  private excludeRectangleFromArea(map: LevelMapData, area: LevelMapArea, rectangle: Rectangle): void {
    this.areaService.excludeRectangle(area, rectangle);
    this.optimizeArea(map, area);
  }

  private optimizeArea(map: LevelMapData, area: LevelMapArea): void {
    const included: Position[] = this.areaService.includedPositions(area);
    if (included.length < 2) this.removeMapArea(map, area);
    if (included.length === 1) {
      this.addMapEntity(map, included[0], area.block);
      return;
    }
    const rectangle: Rectangle | null = this.geometry.rectangleFromPositions(included);
    if (rectangle) {
      const block: GameBlock = area.block;
      this.removeMapArea(map, area);
      this.addMapArea(map, rectangle, block);
    }
  }

  private resolveOverlapForArea(map: LevelMapData, area: LevelMapArea): void {
    this.resolveAreaOverlapWithEntities(map, area);
    this.resolveAreaOverlapWithAreas(map, area);
    this.resolveAreaOverlapWithWalls(map, area);
    this.resolveAreaOverlapWithPortals(map, area);
  }

  private resolveAreaOverlapWithEntities(map: LevelMapData, area: LevelMapArea): void {
    if (!map.entities) return;
    this.geometry.positionsWithinRectangle(area.rectangle).forEach(position => 
      this.removeMapEntity(map, position)
    );
  }

  private resolveAreaOverlapWithAreas(map: LevelMapData, newArea: LevelMapArea): void {
    if (!map.areas) return;
    map.areas.forEach(area => {
      const intersection: Rectangle | null = 
        this.geometry.rectangleFromIntersection(area.rectangle, newArea.rectangle);
      if (!intersection) return;
      this.gameBlock.areBlocksEqual(area.block, newArea.block)
        ? this.geometry.isSingleBlock(intersection)
          ? this.areaService.includePosition(area, intersection.topLeft)
          : this.areaService.includeRectangle(area, intersection)
        : this.geometry.isSingleBlock(intersection)
          ? this.excludePositionFromArea(map, area, intersection.topLeft)
          : this.excludeRectangleFromArea(map, area, intersection);
    });
  }

  private resolveAreaOverlapWithWalls(map: LevelMapData, area: LevelMapArea): void {
    if (!map.walls) return;
    map.walls.forEach(wall => {
      const intersection: Rectangle | null = 
        this.geometry.rectangleFromIntersection(wall.rectangle, area.rectangle);
      if (!intersection) return;
      this.geometry.isSingleBlock(intersection)
        ? this.excludePositionFromWall(map, wall, intersection.topLeft)
        : this.excludeRectangleFromWall(map, wall, intersection);
    });
  }

  private resolveAreaOverlapWithPortals(map: LevelMapData, area: LevelMapArea): void {
    if (!map.portals) return;
    this.removePortal(map, { area: area.rectangle });
  }

  //===========================================================================
  //  Level Map: Walls
  //===========================================================================

  addMapWall(map: LevelMapData, wall: Wall): void {
    this.resolveOverlapForWall(map, wall);
    if (!map.walls) map.walls = [];
    map.walls.push({ ...wall });
  }

  isWithinWall(wall: Wall, position: Position): boolean {
    return this.areaService.isWithinArea(wall, position);
  }

  private removeMapWall(map: LevelMapData, wall: Wall): void {
    if (!map.walls) return;
    for (const [index, entry] of map.walls.entries()) {
      if (this.geometry.isSameRectangle(entry.rectangle, wall.rectangle)) {
        map.walls.splice(index, 1);
        break;
      }
    }
    if (map.walls.length === 0) delete map.walls;
  }

  private excludePositionFromWall(map: LevelMapData, wall: Wall, position: Position): void {
    this.areaService.excludePosition(wall, position);
    this.optimizeWall(map, wall);
  }

  private excludeRectangleFromWall(map: LevelMapData, wall: Wall, rectangle: Rectangle): void {
    this.areaService.excludeRectangle(wall, rectangle);
    this.optimizeWall(map, wall);
  }

  private optimizeWall(map: LevelMapData, wall: Wall): void {
    const included: Position[] = this.areaService.includedPositions(wall);
    if (included.length === 0) this.removeMapWall(map, wall);
    if (included.length === 1) {
      this.addMapEntity(map, included[0], this.wallService.currentBlock(wall, included[0]));
      return;
    }
    const rectangle: Rectangle | null = this.geometry.rectangleFromPositions(included);
    if (rectangle) {
      const newWall: Wall = {
        rectangle,
        noStartBlock: wall.noStartBlock 
          || this.geometry.isOutsideRectangle(rectangle, wall.rectangle.topLeft),
        noEndBlock: wall.noEndBlock 
          || this.geometry.isOutsideRectangle(rectangle, wall.rectangle.bottomRight)
      };
      this.removeMapWall(map, wall);
      this.addMapWall(map, newWall);
    }
  }

  private resolveOverlapForWall(map: LevelMapData, wall: Wall): void {
    this.resolveWallOverlapWithEntities(map, wall);
    this.resolveWallOverlapWithAreas(map, wall);
    this.resolveWallOverlapWithWalls(map, wall);
    this.resolveWallOverlapWithPortals(map, wall);
  }

  private resolveWallOverlapWithEntities(map: LevelMapData, wall: Wall): void {
    if (!map.entities) return;
    this.geometry.positionsWithinRectangle(wall.rectangle).forEach(position => 
      this.removeMapEntity(map, position)
    );
  }

  private resolveWallOverlapWithAreas(map: LevelMapData, wall: Wall): void {
    if (!map.areas) return;
    map.areas.forEach(area => {
      const intersection: Rectangle | null = 
        this.geometry.rectangleFromIntersection(area.rectangle, wall.rectangle);
      if (!intersection) return;
      this.excludeRectangleFromArea(map, area, intersection);
    });
  }

  private resolveWallOverlapWithWalls(map: LevelMapData, newWall: Wall): void {
    if (!map.walls) return;
    map.walls.forEach(wall => {
      const intersection: Rectangle | null = 
        this.geometry.rectangleFromIntersection(wall.rectangle, newWall.rectangle);
      if (!intersection) return;
      this.excludeRectangleFromWall(map, wall, intersection);
    });
  }

  private resolveWallOverlapWithPortals(map: LevelMapData, wall: Wall): void {
    if (!map.portals) return;
    this.removePortal(map, { area: wall.rectangle });
  }

  //===========================================================================
  //  Level Map: Portals
  //===========================================================================

  addPortal(map: LevelMapData, portal: Portal): void {
    this.resolveOverlapForPortal(map, portal);
    if (!map.portals) map.portals = [];
    for (const [index, entry] of map.portals.entries()) {
      if (this.geometry.isSamePosition(entry.entrance, portal.entrance)) {
        entry.exit = { ...portal.exit };
        return;
      }
    }
    map.portals.push({ ...portal });
  }

  private removePortal(map: LevelMapData, overlap: { position?: Position, area?: Rectangle }): void {
    if (!map.portals) return;
    for (let i = 0; i < map.portals.length; i++) {
      if (
        overlap.position &&
        (this.geometry.isSamePosition(overlap.position, map.portals[i].entrance)
          || this.geometry.isSamePosition(overlap.position, map.portals[i].exit))
        || overlap.area &&
        (this.geometry.isWithinRectangle(overlap.area, map.portals[i].entrance)
          || this.geometry.isWithinRectangle(overlap.area, map.portals[i].exit))
      ) {
        map.portals.splice(i, 1);
        i--;
      }
    }
    if (map.portals.length === 0) delete map.portals;
  }

  private resolveOverlapForPortal(map: LevelMapData, portal: Portal): void {
    this.resolvePortalOverlapWithEntities(map, portal);
    this.resolvePortalOverlapWithAreas(map, portal);
    this.resolvePortalOverlapWithWalls(map, portal);
  }

  private resolvePortalOverlapWithEntities(map: LevelMapData, portal: Portal): void {
    if (!map.entities) return;
    this.removeMapEntity(map, portal.entrance);
    this.removeMapEntity(map, portal.exit);
  }

  private resolvePortalOverlapWithAreas(map: LevelMapData, portal: Portal): void {
    if (!map.areas) return;
    [portal.entrance, portal.exit].forEach(position => 
      map.areas!.forEach(area => {
        if (this.geometry.isOutsideRectangle(area.rectangle, position)) return;
        this.excludePositionFromArea(map, area, position);
      })
    );
  }

  private resolvePortalOverlapWithWalls(map: LevelMapData, portal: Portal): void {
    if (!map.walls) return;
    [portal.entrance, portal.exit].forEach(position => 
      map.walls!.forEach(wall => {
        if (this.geometry.isOutsideRectangle(wall.rectangle, position)) return;
        this.excludePositionFromWall(map, wall, position);
      })
    );
  }

}