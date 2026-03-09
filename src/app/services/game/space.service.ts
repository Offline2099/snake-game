import { Injectable } from '@angular/core';
// Constants & Enums
import { GameBlockType } from '../../constants/game/space-block/game-block-type.enum';
import { ProtectionType } from '../../constants/game/space-protection/protection-type.enum';
// Interfaces & Types
import { Position } from '../../types/general/position.interface';
import { Rectangle } from '../../types/general/rectangle.interface';
import { Space } from '../../types/game/space.type';
import { Level } from '../../types/level/level.interface';
import { GameBlock } from '../../types/game/space-block/game-block.interface';
import { GameBlockSubType } from '../../types/game/space-block/game-block-subtype.type';
import { Protection } from '../../types/game/space-protection/protection.type';
// Services
import { UtilityService } from '../general/utility.service';
import { GeometryService } from '../general/geometry.service';
import { GameBlockService } from './game-block.service';

const RANDOM_GUESS_ATTEMPTS: number = 10;

@Injectable({
  providedIn: 'root'
})
export class SpaceService {

  private readonly protectionTypes: ProtectionType[];
  private readonly entityTypes: GameBlockType[];

  constructor(
    private utility: UtilityService,
    private geometry: GeometryService,
    private gameBlock: GameBlockService
  ) {
    this.protectionTypes = this.gameBlock.protectionTypes();
    this.entityTypes = [
      GameBlockType.obstacle,
      GameBlockType.portal,
      GameBlockType.enemy,
      GameBlockType.food
    ];
  }

  //===========================================================================
  //  Space Construction
  //===========================================================================

  createSpace(width: number, height: number): Space {
    return Array.from(
      { length: width },
      () => Array.from({ length: height }, () => ({ type: GameBlockType.free }))
    );
  }

  //===========================================================================
  //  Space Utility
  //===========================================================================

  toRectangle(space: Space): Rectangle {
    return {
      topLeft: { x: 0, y: space[0].length - 1 },
      bottomRight: { x: space.length - 1, y: 0 }
    };
  }

  getBlock(space: Space, position: Position): GameBlock | null {
    if (this.isOutsideSpace(space, position)) return null;
    return space[position.x][position.y];
  }

  setBlock(space: Space, position: Position, block: GameBlock): void {
    if (this.isOutsideSpace(space, position)) return;
    space[position.x][position.y] = { ...block };
  }

  isOutsideSpace(space: Space, position: Position): boolean {
    return this.geometry.isOutsideRectangle(this.toRectangle(space), position);
  }

  isOfType(space: Space, position: Position, type: GameBlockType, subType?: GameBlockSubType): boolean {
    const block: GameBlock | null = this.getBlock(space, position);
    if (!block) return false;
    return subType 
      ? block.type === type && block.subType === subType
      : block.type === type;
  }

  isBlockNearby(space: Space, position: Position, type: GameBlockType, margin: number): boolean {
    return this.geometry.positionsWithinMargin(position, margin)
      .find(position => this.isOfType(space, position, type)) !== undefined;
  }

  //===========================================================================
  //  Random Available Position
  //===========================================================================

  randomFreePosition(space: Space, typeToExclude: ProtectionType): Position | null {
    const position: Position | null = this.guessRandomPosition(space, typeToExclude);
    if (position) return position;
    const availablePositions: Position[] = this.availableSpace(space, typeToExclude);
    if (!availablePositions.length) return null;
    return this.utility.randomFromArray(availablePositions);
  }

  private guessRandomPosition(space: Space, typeToExclude: ProtectionType): Position | null {
    for (let attempt = 0; attempt < RANDOM_GUESS_ATTEMPTS; attempt++) {
      const position: Position = this.geometry.randomPosition(this.toRectangle(space));
      const block: GameBlock = this.getBlock(space, position)!;
      if (this.isAvailable(block, typeToExclude)) return position;
    }
    return null;
  }

  private availableSpace(space: Space, typeToExclude: ProtectionType): Position[] {
    const availablePositions: Position[] = [];
    space.forEach((column, x) => 
      column.forEach((block, y) => {
        if (this.isAvailable(block, typeToExclude)) availablePositions.push({ x, y });
      })
    );
    return availablePositions;
  }

  private isAvailable(block: GameBlock, typeToExclude: ProtectionType): boolean {
    return block.type === GameBlockType.free
      && (!block.isProtected || !block.isProtected[typeToExclude]);
  }

  //===========================================================================
  //  Free Space Protection
  //===========================================================================

  setAreaProtectionState(
    space: Space,
    area: Rectangle,
    protectionType: ProtectionType,
    protectionState: boolean
  ): void {
    this.geometry.positionsWithinRectangle(area).forEach(position => 
      this.setBlockProtectionState(space, position, protectionType, protectionState)
    );
  }

  setMarginProtectionState(
    space: Space,
    center: Position,
    margin: number,
    protectionType: ProtectionType,
    protectionState: boolean
  ): void {
    this.geometry.positionsWithinMargin(center, margin).forEach(position => 
      this.setBlockProtectionState(space, position, protectionType, protectionState)
    );
  }

  private protectPerimeter(space: Space, margin: number, protectionType: ProtectionType): void {
    this.geometry.positionsNearPerimeter(this.toRectangle(space), margin).forEach(position => 
      this.setBlockProtectionState(space, position, protectionType, true)
    );
  }

  private setBlockProtectionState(
    space: Space,
    position: Position,
    protectionType: ProtectionType,
    protectionState: boolean
  ): void {
    const block: GameBlock | null = this.getBlock(space, position);
    if (!block || block.type !== GameBlockType.free) return;
    if (!block.isProtected) block.isProtected = this.gameBlock.blockProtection();
    block.isProtected[protectionType] = protectionState;
  }

  //===========================================================================
  //  Empty Space Block Setup
  //===========================================================================

  setEmptyBlock(space: Space, level: Level, position: Position): void {
    const isPortalExit: boolean = level.settings.map?.portals !== undefined
      && level.settings.map.portals.find(portal => 
        this.geometry.isSamePosition(portal.exit, position)
      ) !== undefined;
    if (isPortalExit) {
      this.setBlock(space, position, this.gameBlock.portalExit());
      this.protectEntity(space, level, position, GameBlockType.portal);
      return;
    }
    const protection: Protection = this.emptyBlockProtection(space, level, position);
    this.setBlock(space, position, { type: GameBlockType.free, isProtected: protection });
  }

  private emptyBlockProtection(space: Space, level: Level, position: Position): Protection {
    const protection: Protection = this.gameBlock.blockProtection();
    this.protectionTypes.forEach(protectionType => {
      const perimeterMargin: number = level.settings.perimeterProtection[protectionType];
      if (this.geometry.isNearPerimeter(this.toRectangle(space), position, perimeterMargin)) {
        protection[protectionType] = true;
        return;
      }
      this.entityTypes.forEach(blockType => {
        const margin: number = level.settings.protectedMargins[blockType]![protectionType];
        if (this.isBlockNearby(space, position, blockType, margin))
          protection[protectionType] = true;
      });
    });
    return protection;
  }

  //===========================================================================
  //  Space Protection Setup
  //===========================================================================

  protectEntity(space: Space, level: Level, position: Position, blockType: GameBlockType): void {
    this.protectionTypes.forEach(protectionType => {
      const margin: number = level.settings.protectedMargins[blockType]![protectionType];
      this.setMarginProtectionState(space, position, margin, protectionType, true);
    });
  }

  protectPerimeterMargin(space: Space, level: Level): void {
    this.protectionTypes.forEach(protectionType => {
      const margin: number = level.settings.perimeterProtection[protectionType];
      this.protectPerimeter(space, margin, protectionType);
    });
  }

  //===========================================================================
  //  Space Protection Removal
  //===========================================================================

  unprotectArea(space: Space, level: Level, area: Rectangle): void {
    this.unprotectPositions(space, level, this.geometry.positionsWithinRectangle(area));
  }
  
  unprotectMargin(space: Space, level: Level, center: Position, margin: number): void {
    this.unprotectPositions(space, level, this.geometry.positionsWithinMargin(center, margin));
  }

  removeEntity(space: Space, level: Level, position: Position, blockType: GameBlockType): void {
    this.setEmptyBlock(space, level, position);
    this.protectionTypes.forEach(protectionType => {
      const margin: number = level.settings.protectedMargins[blockType]![protectionType];
      this.unprotectMargin(space, level, position, margin);
    });
  }

  private unprotectPositions(space: Space, level: Level, positions: Position[]): void {
    positions.forEach(position => {
      if (!this.isOfType(space, position, GameBlockType.free)) return;
      this.setEmptyBlock(space, level, position);
    });
  }

}