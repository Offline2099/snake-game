import { Injectable } from '@angular/core';
// Constants & Enums
import { DEFAULT_GAME_BLOCK } from '../constants/game/delault-game-block';
import { GameBlockType } from '../constants/game/game-block-type.enum';
import { GameBlockSubType } from '../types/game/space/game-block-subtype.type';
import { ProtectionType } from '../constants/game/protection-type.enum';
import { FoodType } from '../constants/food/food-type.enum';
import { EnemyType } from '../constants/enemies/enemy-type.enum';
// Interfaces & Types
import { Position } from '../types/general/position.interface';
import { Rectangle } from '../types/general/rectangle.interface';
import { GameBlockData } from '../types/game/space/game-block-data.interface';
import { Space } from '../types/game/space/space.type';
import { Protection } from '../types/game/space/protection.type';
// Services
import { GeometryService } from './geometry.service';

@Injectable({
  providedIn: 'root'
})
export class SpaceService {

  constructor(private geometry: GeometryService) {}

  //===========================================================================
  //  Space Construction
  //===========================================================================

  createSpace(sizeX: number, sizeY: number): Space {
    return Array.from(
      { length: sizeX },
      () => Array.from({ length: sizeY }, () => this.defaultBlock())
    );
  }

  defaultBlock(): GameBlockData {
    return {
      ...DEFAULT_GAME_BLOCK,
      isProtected: { ...DEFAULT_GAME_BLOCK.isProtected }
    }
  }

  createBlock(type: GameBlockType, subType?: GameBlockSubType, protection?: Protection): GameBlockData {
    return {
      type,
      subType,
      isProtected: protection ? { ...protection } : { ...DEFAULT_GAME_BLOCK.isProtected }
    }
  }

  //===========================================================================
  //  Space Utility
  //===========================================================================

  toRectangle(space: Space): Rectangle {
    return {
      topLeft: { x: 0, y: space[0].length - 1 },
      bottomRight: { x: space.length - 1, y: 0 }
    }
  }

  getBlock(space: Space, position: Position): GameBlockData {
    return space[position.x][position.y];
  }

  setBlock(space: Space, position: Position, block: GameBlockData): void {
    if (this.isOutsideSpace(space, position)) return;
    space[position.x][position.y] = { 
      ...block,
      isProtected: { ...block.isProtected }
    }
  }

  isOutsideSpace(space: Space, position: Position): boolean {
    return this.geometry.isOutsideRectangle(this.toRectangle(space), position);
  }

  isOfType(space: Space, position: Position, type: GameBlockType, subType?: GameBlockSubType): boolean {
    if (this.isOutsideSpace(space, position)) return false;
    const block: GameBlockData = this.getBlock(space, position);
    return subType 
      ? block.type === type && block.subType === subType
      : block.type === type;
  } 

  availableSpace(space: Space, typeToExclude: ProtectionType): Position[] {
    const availablePositions: Position[] = [];
    space.forEach((column, x) => {
      column.forEach((_, y) => {
        const block: GameBlockData = this.getBlock(space, { x, y });
        if (block.type !== GameBlockType.free || block.isProtected[typeToExclude]) return;
        availablePositions.push({ x, y });
      });
    });
    return availablePositions;
  }

  //===========================================================================
  //  Entity Detection
  //===========================================================================

  isBlockNearby(space: Space, position: Position, type: GameBlockType, margin: number): boolean {
    return this.geometry.positionsWithinMargin(position, margin)
      .find(position => this.isOfType(space, position, type)) !== undefined;
  }

  isCollisionAhead(space: Space, position: Position): boolean {
    if (this.isOutsideSpace(space, position)) return true;
    const blockAhead: GameBlockData = this.getBlock(space, position);
    return blockAhead.type === GameBlockType.obstacle
      || blockAhead.type === GameBlockType.snakeHead
      || blockAhead.type === GameBlockType.snakeBody;
  }

  foodTypeAhead(space: Space, positionAhead: Position): FoodType | null {
    return this.blockSubType(space, positionAhead, GameBlockType.food) as FoodType;
  }

  enemyTypeAhead(space: Space, positionAhead: Position): EnemyType | null {
    return this.blockSubType(space, positionAhead, GameBlockType.enemy) as EnemyType;
  }

  private blockSubType(space: Space, position: Position, type: GameBlockType): GameBlockSubType | null {
    if (this.isOutsideSpace(space, position)) return null;
    const block: GameBlockData = this.getBlock(space, position);
    return block.type === type && block.subType ? block.subType : null;
  }

  //===========================================================================
  //  Space Protection
  //===========================================================================

  protectPerimeter(space: Space, margin: number, protectionType: ProtectionType): void {
    space.forEach((column, x) => {
      column.forEach((_, y) => {
        if (
          x < margin
          || x > space.length - margin - 1
          || y < margin
          || y > space[x].length - margin - 1
        ) this.setBlockProtectionState(space, { x, y }, protectionType, true);
      });
    });
  }

  setAreaProtectionState(
    space: Space,
    area: Rectangle,
    protectionType: ProtectionType,
    protectionState: boolean
  ): void {
    this.geometry.positionsWithinArea(area).forEach(position => 
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

  private setBlockProtectionState(
    space: Space,
    position: Position,
    protectionType: ProtectionType,
    protectionState: boolean
  ): void {
    if (this.isOutsideSpace(space, position)) return;
    const block: GameBlockData = this.getBlock(space, position);
    if (block.type !== GameBlockType.free) return;
    block.isProtected[protectionType] = protectionState;
  }

}