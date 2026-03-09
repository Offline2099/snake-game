import { Injectable } from '@angular/core';
// Constants & Enums
import { GameBlockType } from '../../constants/game/space-block/game-block-type.enum';
import { ObstacleType } from '../../constants/game/obstacles/obstacle-type.enum';
import { PortalType } from '../../constants/game/portals/portal-type.enum';
import { EnemyType } from '../../constants/game/enemies/enemy-type.enum';
import { FoodType } from '../../constants/game/food/food-type.enum';
import { ProtectionType } from '../../constants/game/space-protection/protection-type.enum';
import { BLOCK_TYPE_NAME } from '../../constants/game/space-block/block-type-name';
import { BLOCK_CLASS } from '../../constants/game/space-block/block-class';
import { BLOCK_IMAGE } from '../../constants/game/space-block/block-image';
import { OBSTACLE_NAME } from '../../constants/game/obstacles/obstacle-name';
import { PORTAL_BLOCK_NAME } from '../../constants/game/portals/portal-block-name';
import { ENEMY_DATA } from '../../constants/game/enemies/enemy-data';
import { FOOD_DATA } from '../../constants/game/food/food-data';
// Interfaces & Types
import { Position } from '../../types/general/position.interface';
import { GameBlock } from '../../types/game/space-block/game-block.interface';
import { GameBlockSubType } from '../../types/game/space-block/game-block-subtype.type';
import { Protection } from '../../types/game/space-protection/protection.type';

const BLOCK_IMAGE_PATH: string = 'images/game-blocks/';

@Injectable({
  providedIn: 'root'
})
export class GameBlockService {

  //===========================================================================
  //  Construction
  //===========================================================================

  createBlock(type: GameBlockType, subType?: GameBlockSubType, isProtected?: Protection): GameBlock {
    return { type, subType, isProtected };
  }

  obstacle(obstacleType: ObstacleType): GameBlock {
    return { type: GameBlockType.obstacle, subType : obstacleType };
  }

  allObstacleTypes(): ObstacleType[] {
    return Object.values(ObstacleType).filter(Number) as ObstacleType[];
  }

  allObstacles(): GameBlock[] {
    return this.allObstacleTypes().map(type => this.obstacle(type));
  }

  portalEntrance(to?: Position): GameBlock {
    return { type: GameBlockType.portal, subType: PortalType.entrance, portalTo: to };
  }

  portalExit(): GameBlock {
    return { type: GameBlockType.portal, subType: PortalType.exit };
  }

  enemy(enemyType: EnemyType): GameBlock {
    return { type: GameBlockType.enemy, subType : enemyType };
  }

  allEnemyTypes(): EnemyType[] {
    return Object.values(EnemyType).filter(Number) as EnemyType[];
  }

  allEnemies(): GameBlock[] {
    return this.allEnemyTypes().map(type => this.enemy(type));
  }

  food(foodType: FoodType): GameBlock {
    return { type: GameBlockType.food, subType : foodType };
  }

  allFoodTypes(): FoodType[] {
    return Object.values(FoodType).filter(Number) as FoodType[];
  }

  allFood(): GameBlock[] {
    return this.allFoodTypes().map(type => this.food(type));
  }

  protectionTypes(): ProtectionType[] {
    return Object.values(ProtectionType).filter(Number) as ProtectionType[];
  }

  blockProtection(): Protection {
    return this.protectionTypes().reduce((acc, type) => {
      acc[type] = false;
      return acc;
    }, {} as Protection);
  }

  //===========================================================================
  //  Queries
  //===========================================================================

  areBlocksEqual(a: GameBlock, b: GameBlock): boolean {
    return a.type === b.type && a.subType === b.subType;
  }

  isFood(block: GameBlock | null): boolean {
    if (!block) return false;
    return block.type === GameBlockType.food;
  }

  isEnemy(block: GameBlock | null): boolean {
    if (!block) return false;
    return block.type === GameBlockType.enemy;
  }
  
  isCausingCollision(block: GameBlock | null): boolean {
    return block
      ? block.type === GameBlockType.obstacle
        || block.type === GameBlockType.snakeHead
        || block.type === GameBlockType.snakeBody
      : true;
  }

  blockName(block: GameBlock, omitTypeName: boolean = false): string {
    const typeName: string = BLOCK_TYPE_NAME[block.type];
    let separator: string = ':';
    let subTypeName = '';
    switch (block.type) {
      case GameBlockType.obstacle:
        subTypeName = OBSTACLE_NAME[block.subType as ObstacleType];
        break;
      case GameBlockType.portal:
        subTypeName = PORTAL_BLOCK_NAME[block.subType as PortalType];
        separator = '';
        break;
      case GameBlockType.enemy:
        subTypeName = ENEMY_DATA[block.subType as EnemyType].name;
        break;
      case GameBlockType.food:
        subTypeName = FOOD_DATA[block.subType as FoodType].name;
        break;
    }
    return omitTypeName ? subTypeName : `${typeName}${separator} ${subTypeName}`;
  }

  blockClass(block: GameBlock): string {
    return block.subType !== undefined ? BLOCK_CLASS[block.type][block.subType] : '';
  }

  blockImage(block: GameBlock): string | null {
    return BLOCK_IMAGE[block.type]
      ? typeof BLOCK_IMAGE[block.type] === 'string'
        ? this.blockImageURL(BLOCK_IMAGE[block.type] as string)
        : block.subType
          ? this.blockImageURL(BLOCK_IMAGE[block.type][block.subType])
          : null 
      : null;
  }

  allBlockImages(): string[] {
    const images: string[] = [];
    Object.values(BLOCK_IMAGE).forEach(value =>
      typeof value === 'string' 
        ? images.push(value) 
        : images.push(...Object.values(value))
    );
    return [...new Set(images)].map(name => this.blockImageURL(name));
  }

  private blockImageURL(name: string): string {
    return `${BLOCK_IMAGE_PATH}${name}.svg`;
  }

}