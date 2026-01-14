import { Injectable } from '@angular/core';
import { Direction } from '../../constants/general/direction.enum';
import { Position } from '../../types/general/position.interface';
import { Rectangle } from '../../types/general/rectangle.interface';

@Injectable({
  providedIn: 'root'
})
export class GeometryService {

  /** Returns true if the two given positions are equal, false otherwise. */
  isSamePosition(a: Position, b: Position): boolean {
    return a.x === b.x && a.y === b.y;
  }

  /**
   * Returns the direction of movement for given start and end positions, 
   * assuming that only horizontal or vertical movement is possible, and 
   * that the start and end positions can only be adjacent to each other.
   */
  getDirection(start: Position, end: Position): Direction {
    if (start.y < end.y) return Direction.up;
    if (start.y > end.y) return Direction.down;
    if (start.x > end.x) return Direction.left;
    return Direction.right;
  }

  /** Returns the direction opposite to the specified one. */
  oppositeDirection(direction: Direction): Direction {
    switch (direction) {
      case Direction.up:
        return Direction.down;
      case Direction.down:
        return Direction.up;
      case Direction.left:
        return Direction.right;
      case Direction.right:
        return Direction.left;
    }
  }

  /**
   * Returns the position, shifted by a given amount of blocks, in the specified 
   * direction, relative to the initial position. The default amount is 1.
   */
  shiftPosition(initial: Position, direction: Direction, amount: number = 1): Position {
    const newPosition: Position = { ...initial };
    switch (direction) {
      case Direction.up:
        newPosition.y += amount;
        break;
      case Direction.down:
        newPosition.y -= amount;
        break;
      case Direction.left:
        newPosition.x -= amount;
        break;
      case Direction.right:
        newPosition.x += amount;
        break;
    }
    return newPosition;
  }

  /**
   * Creates a rectangle defined by two points.
   * The rectangle is represented by its top-left and bottom-right corners.
   */
  rectangleFromTwoPoints(a: Position, b: Position): Rectangle {
    return {
      topLeft: {
        x: Math.min(a.x, b.x),
        y: Math.max(a.y, b.y)
      },
      bottomRight: {
        x: Math.max(a.x, b.x),
        y: Math.min(a.y, b.y)
      }
    }
  }

  /** Checks if a given position is outside the specified rectangle. */
  isOutsideRectangle(rectangle: Rectangle, position: Position): boolean {
    return position.x < rectangle.topLeft.x
      || position.x > rectangle.bottomRight.x
      || position.y < rectangle.bottomRight.y
      || position.y > rectangle.topLeft.y;
  }

  /** 
   * Checks if a given position is near the perimeter of a specified rectangle
   * within a given margin.
   */
  isNearPerimeter(rectangle: Rectangle, position: Position, margin: number): boolean {
    const innerRectangle: Rectangle = this.rectangleFromTwoPoints(
      { x: rectangle.topLeft.x + margin, y: rectangle.topLeft.y - margin },
      { x: rectangle.bottomRight.x - margin, y: rectangle.bottomRight.y + margin }
    );
    return this.isOutsideRectangle(innerRectangle, position)
      && !this.isOutsideRectangle(rectangle, position);
  }

  /** Generates an array of positions within a specified margin from a center position. */
  positionsWithinMargin(center: Position, margin: number): Position[] {
    const positions: Position[] = [];
    for(let x = center.x - margin; x <= center.x + margin; x++) {
      for(let y = center.y + margin; y >= center.y - margin; y--) {
        positions.push({ x, y });
      }
    }
    return positions;
  }

  /** Generates an array of positions within a specified rectangle area. */
  positionsWithinArea(rectangle: Rectangle): Position[] {
    const positions: Position[] = [];
    for(let x = rectangle.topLeft.x; x <= rectangle.bottomRight.x; x++) {
      for(let y = rectangle.topLeft.y; y >= rectangle.bottomRight.y; y--) {
        positions.push({ x, y });
      }
    }
    return positions;
  }

}