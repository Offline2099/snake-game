import { Injectable } from '@angular/core';
// Constants & Enums
import { DEFAULT_GAME_BLOCK } from '../../constants/game/delault-game-block';
import { GameBlockType } from '../../constants/game/game-block-type.enum';
import { BLOCK_TYPE_NAME } from '../../constants/game/block-type-name';
import { ObstacleType } from '../../constants/obstacles/obstacle-type.enum';
import { PortalType } from '../../constants/portals/portal-type.enum';
import { EnemyType } from '../../constants/enemies/enemy-type.enum';
import { FoodType } from '../../constants/food/food-type.enum';
import { OBSTACLE_NAME } from '../../constants/obstacles/obstacle-name';
import { PORTAL_BLOCK_NAME } from '../../constants/portals/portal-block-name';
import { ENEMY_DATA } from '../../constants/enemies/enemy-data';
import { FOOD_DATA } from '../../constants/food/food-data';
// Interfaces & Types
import { Position } from '../../types/general/position.interface';
import { GameBlockBase } from '../../types/game/space/game-block-base.interface';
import { GameBlockData } from '../../types/game/space/game-block-data.interface';
import { GameBlockSubType } from '../../types/game/space/game-block-subtype.type';
import { Protection } from '../../types/game/space/protection.type';
import { ProtectionType } from '../../constants/game/protection-type.enum';

@Injectable({
  providedIn: 'root'
})
export class GameBlockService {

  //===========================================================================
  //  Construction
  //===========================================================================

  defaultBlock(): GameBlockData {
    return {
      ...DEFAULT_GAME_BLOCK, isProtected: { ...DEFAULT_GAME_BLOCK.isProtected }
    }
  }

  createBlock(type: GameBlockType, subType?: GameBlockSubType, protection?: Protection): GameBlockData {
    return {
      type,
      subType,
      isProtected: protection ? { ...protection } : { ...DEFAULT_GAME_BLOCK.isProtected }
    }
  }

  obstacle(obstacleType: ObstacleType): GameBlockBase {
    return { type: GameBlockType.obstacle, subType : obstacleType };
  }

  allObstacleTypes(): ObstacleType[] {
    return Object.values(ObstacleType).filter(Number) as ObstacleType[];
  }

  allObstacles(): GameBlockBase[] {
    return this.allObstacleTypes().map(type => this.obstacle(type));
  }

  enemy(enemyType: EnemyType): GameBlockBase {
    return { type: GameBlockType.enemy, subType : enemyType };
  }

  allEnemyTypes(): EnemyType[] {
    return Object.values(EnemyType).filter(Number) as EnemyType[];
  }

  allEnemies(): GameBlockBase[] {
    return this.allEnemyTypes().map(type => this.enemy(type));
  }

  food(foodType: FoodType): GameBlockBase {
    return { type: GameBlockType.food, subType : foodType };
  }

  allFoodTypes(): FoodType[] {
    return Object.values(FoodType).filter(Number) as FoodType[];
  }

  allFood(): GameBlockBase[] {
    return this.allFoodTypes().map(type => this.food(type));
  }

  portalEntrance(to?: Position): GameBlockBase {
    return { type: GameBlockType.portal, subType: PortalType.entrance, portalTo: to };
  }

  portalExit(): GameBlockBase {
    return { type: GameBlockType.portal, subType: PortalType.exit };
  }

  createPortalBlock(portalType: PortalType): GameBlockData {
    return {
      type: GameBlockType.portal,
      subType: portalType,
      isProtected: {
        [ProtectionType.noEnemySpawn]: true,
        [ProtectionType.noFoodSpawn]: true
      }
    }
  }

  //===========================================================================
  //  Queries
  //===========================================================================

  areBlocksEqual(a: GameBlockBase, b: GameBlockBase): boolean {
    return a.type === b.type && a.subType === b.subType;
  }

  blockTypeName(type: GameBlockType): string {
    return BLOCK_TYPE_NAME[type];
  }

  blockName(block: GameBlockBase, omitTypeName: boolean = false): string {
    const typeName: string = this.blockTypeName(block.type);
    let subTypeName = '';
    switch (block.type) {
      case GameBlockType.obstacle:
        subTypeName = OBSTACLE_NAME[block.subType as ObstacleType];
        break;
      case GameBlockType.portal:
        return `${typeName} ${PORTAL_BLOCK_NAME[block.subType  as PortalType]}`;
      case GameBlockType.enemy:
        subTypeName = ENEMY_DATA[block.subType as EnemyType].name;
        break;
      case GameBlockType.food:
        subTypeName = FOOD_DATA[block.subType as FoodType].name;
        break;
    }
    return omitTypeName ? subTypeName : `${typeName}: ${subTypeName}`;
  }

}