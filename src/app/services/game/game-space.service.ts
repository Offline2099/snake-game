import { Injectable } from '@angular/core';
// Constants & Enums
import { GameBlockType } from '../../constants/game/game-block-type.enum';
import { PortalType } from '../../constants/portals/portal-type.enum';
import { ProtectionType } from '../../constants/game/protection-type.enum';
// Interfaces & Types
import { Position } from '../../types/general/position.interface';
import { Rectangle } from '../../types/general/rectangle.interface';
import { Game } from '../../types/game/game.interface';
import { Level } from '../../types/level/level.interface';
import { Space } from '../../types/game/space/space.type';
import { GameBlockData } from '../../types/game/space/game-block-data.interface';
import { Protection } from '../../types/game/space/protection.type';
// Services
import { GeometryService } from '../general/geometry.service';
import { SpaceService } from '../space.service';

@Injectable({
  providedIn: 'root'
})
export class GameSpaceService {

  private readonly protectionTypes: ProtectionType[];
  private readonly entityTypes: GameBlockType[];

  constructor(private geometry: GeometryService, private spaceService: SpaceService) {
    this.protectionTypes = Object.values(ProtectionType).filter(Number) as ProtectionType[];
    this.entityTypes = 
      [GameBlockType.obstacle, GameBlockType.portal, GameBlockType.enemy, GameBlockType.food];
  }

  //===========================================================================
  //  Space Protection Setup
  //===========================================================================

  protectArea(space: Space, area: Rectangle, type: ProtectionType): void {
    this.spaceService.setAreaProtectionState(space, area, type, true);
  }

  protectMargin(space: Space, center: Position, margin: number, type: ProtectionType): void {
    this.spaceService.setMarginProtectionState(space, center, margin, type, true);
  }

  protectEntity(game: Game, level: Level, position: Position, blockType: GameBlockType): void {
    this.protectionTypes.forEach(protectionType => {
      const margin: number = level.settings.protectedMargins[blockType]![protectionType];
      this.protectMargin(game.space, position, margin, protectionType);
    });
  }

  protectPerimeterMargin(game: Game, level: Level): void {
    this.protectionTypes.forEach(protectionType => {
      const margin: number = level.settings.perimeterProtection[protectionType];
      this.spaceService.protectPerimeter(game.space, margin, protectionType);
    });
  }

  //===========================================================================
  //  Space Protection Removal
  //===========================================================================

  unprotectArea(game: Game, level: Level, area: Rectangle): void {
    this.unprotectPositions(game, level, this.geometry.positionsWithinArea(area));
  }
  
  unprotectMargin(game: Game, level: Level, center: Position, margin: number): void {
    this.unprotectPositions(game, level, this.geometry.positionsWithinMargin(center, margin));
  }

  removeEntity(game: Game, level: Level, position: Position, blockType: GameBlockType): void {
    this.setFreeBlock(game, level, position);
    this.protectionTypes.forEach(protectionType => {
      const margin: number = level.settings.protectedMargins[blockType]![protectionType];
      this.unprotectMargin(game, level, position, margin);
    });
  }

  private unprotectPositions(game: Game, level: Level, positions: Position[]): void {
    positions.forEach(position => {
      if (!this.spaceService.isOfType(game.space, position, GameBlockType.free)) return;
      this.setFreeBlock(game, level, position);
    });
  }

  //===========================================================================
  //  Free Block Setup
  //===========================================================================

  setFreeBlock(game: Game, level: Level, position: Position): void {
    if (this.restorePortalExit(game, position)) return;
    this.spaceService.setBlock(
      game.space,
      position, 
      { 
        ...this.spaceService.defaultBlock(),
        isProtected: { ...this.freeBlockProtection(game, level, position) }
      }
    );
  }

  private restorePortalExit(game: Game, position: Position): boolean {
    if (!game.portals.find(portal => this.geometry.isSamePosition(position, portal.exit))) 
      return false;
    const block: GameBlockData = this.spaceService.createPortalBlock(PortalType.exit);
    this.spaceService.setBlock(game.space, position, block);
    return true;
  }

  private freeBlockProtection(game: Game, level: Level, position: Position): Protection {
    const protection: Protection = this.spaceService.defaultBlock().isProtected;
    const space: Rectangle = this.spaceService.toRectangle(game.space);
    this.protectionTypes.forEach(protectionType => {
      const perimeterMargin: number = level.settings.perimeterProtection[protectionType];
      if (this.geometry.isNearPerimeter(space, position, perimeterMargin))
        protection[protectionType] = true;
      this.entityTypes.forEach(blockType => {
        if (protection[protectionType]) return;
        const margin: number = level.settings.protectedMargins[blockType]![protectionType];
        if (this.spaceService.isBlockNearby(game.space, position, blockType, margin))
          protection[protectionType] = true;
      });
    });
    return protection;
  }

}