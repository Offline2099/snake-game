import { Injectable } from '@angular/core';
// Constants & Enums
import { Orientation } from '../../constants/general/orientation.enum';
import { ObstacleType } from '../../constants/game/obstacles/obstacle-type.enum';
// Interfaces & types
import { Position } from '../../types/general/position.interface';
import { GameBlock } from '../../types/game/space-block/game-block.interface';
import { Wall } from '../../types/level/map/wall.interface';
// Services
import { GeometryService } from '../general/geometry.service';
import { GameBlockService } from '../game/game-block.service';

type WallType = ObstacleType.wallHorizontal | ObstacleType.wallVertical;

const WALL_ORIENTATION: Record<WallType, Orientation> = {
  [ObstacleType.wallHorizontal]: Orientation.horizontal,
  [ObstacleType.wallVertical]: Orientation.vertical
}

const WALL_BODY_BLOCK: Record<Orientation, ObstacleType> = {
  [Orientation.horizontal]: ObstacleType.wallHorizontal,
  [Orientation.vertical]: ObstacleType.wallVertical
}

const WALL_START_BLOCK: Record<Orientation, ObstacleType> = {
  [Orientation.horizontal]: ObstacleType.wallEndLeft,
  [Orientation.vertical]: ObstacleType.wallEndTop
}

const WALL_END_BLOCK: Record<Orientation, ObstacleType> = {
  [Orientation.horizontal]: ObstacleType.wallEndRight,
  [Orientation.vertical]: ObstacleType.wallEndBottom
}

@Injectable({
  providedIn: 'root'
})
export class WallService {

  constructor(
    private geometry: GeometryService,
    private gameBlock: GameBlockService
  ) { }

  orientation(wall: Wall): Orientation {
    if (wall.rectangle.topLeft.x < wall.rectangle.bottomRight.x) 
      return Orientation.horizontal;
    return Orientation.vertical;
  }

  orientationByBodyBlock(block: GameBlock): Orientation {
    return WALL_ORIENTATION[block.subType as WallType];
  }

  length(wall: Wall): number {
    switch (this.orientation(wall)) {
      case Orientation.horizontal:
        return wall.rectangle.bottomRight.x - wall.rectangle.topLeft.x + 1;
      case Orientation.vertical:
        return wall.rectangle.topLeft.y - wall.rectangle.bottomRight.y + 1;
    }
  }

  isWallStart(wall: Wall, position: Position): boolean {
    return this.geometry.isSamePosition(wall.rectangle.topLeft, position);
  }

  isWallEnd(wall: Wall, position: Position): boolean {
    return this.geometry.isSamePosition(wall.rectangle.bottomRight, position);
  }

  startBlock(orientaion: Orientation): GameBlock {
    return this.gameBlock.obstacle(WALL_START_BLOCK[orientaion]);
  }

  bodyBlock(orientaion: Orientation): GameBlock {
    return this.gameBlock.obstacle(WALL_BODY_BLOCK[orientaion]);
  }

  endBlock(orientaion: Orientation): GameBlock {
    return this.gameBlock.obstacle(WALL_END_BLOCK[orientaion]);
  }

  currentBlock(wall: Wall, position: Position): GameBlock {
    const orientaion: Orientation = this.orientation(wall);
    if (this.isWallStart(wall, position)) 
      return wall.noStartBlock ? this.bodyBlock(orientaion) : this.startBlock(orientaion);
    if (this.isWallEnd(wall, position)) 
      return wall.noEndBlock ? this.bodyBlock(orientaion) : this.endBlock(orientaion);
    return this.bodyBlock(orientaion);
  }

  isSuitableBlock(wall: Wall, position: Position, block: GameBlock): boolean {
    const orientaion: Orientation = this.orientation(wall);
    return this.gameBlock.areBlocksEqual(block, this.bodyBlock(orientaion))
      || (this.isWallStart(wall, position)
        && this.gameBlock.areBlocksEqual(block, this.startBlock(orientaion)))
      || (this.isWallEnd(wall, position)
        && this.gameBlock.areBlocksEqual(block, this.endBlock(orientaion)));
  }

  updateWallEnds(wall: Wall, position: Position, block: GameBlock): void {
    const orientaion: Orientation = this.orientation(wall);
    if (this.isWallStart(wall, position)) 
      wall.noStartBlock = !this.gameBlock.areBlocksEqual(block, this.startBlock(orientaion));
    if (this.isWallEnd(wall, position))
      wall.noEndBlock = !this.gameBlock.areBlocksEqual(block, this.endBlock(orientaion));
  }

}