import { Injectable } from '@angular/core';
import { Direction } from '../../constants/general/direction.enum';
import { Position } from '../../types/general/position.interface';
import { Rectangle } from '../../types/general/rectangle.interface';
import { Portal } from '../../types/general/portal.interface';

const OPPOSITE_DIRECTION_MAP: Record<Direction, Direction> = {
  [Direction.up]: Direction.down,
  [Direction.down]: Direction.up,
  [Direction.left]: Direction.right,
  [Direction.right]: Direction.left
};

const SHIFT_MAP: Record<Direction, { x: -1 | 0 | 1, y: -1 | 0 | 1 }> = {
  [Direction.up]: { x: 0, y: 1 },
  [Direction.down]: { x: 0, y: -1 },
  [Direction.left]: { x: -1, y: 0 },
  [Direction.right]: { x: 1, y: 0 }
}

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
    return OPPOSITE_DIRECTION_MAP[direction];
  }

  /**
   * Returns the position, shifted by a given amount of blocks, in the specified 
   * direction, relative to the initial position. The default amount is 1.
   */
  shiftPosition(initial: Position, direction: Direction, amount: number = 1): Position {
    return {
      x: initial.x + amount * SHIFT_MAP[direction].x,
      y: initial.y + amount * SHIFT_MAP[direction].y
    }
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

  /** Checks if a given position is within the specified rectangle. */
  isWithinRectangle(rectangle: Rectangle, position: Position): boolean {
    return !this.isOutsideRectangle(rectangle, position);
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

  isSingleBlock(rectangle: Rectangle): boolean {
    return this.isSamePosition(rectangle.topLeft, rectangle.bottomRight);
  }

  isSameRectangle(a: Rectangle, b: Rectangle): boolean {
    return this.isSamePosition(a.topLeft, b.topLeft)
      && this.isSamePosition(a.bottomRight, b.bottomRight);
  }

  isRectangleWithinAnother(outer: Rectangle, inner: Rectangle): boolean {
    return !this.isOutsideRectangle(outer, inner.topLeft)
      && !this.isOutsideRectangle(outer, inner.bottomRight);
  }

  rectangleFromIntersection(a: Rectangle, b: Rectangle): Rectangle | null {
    const left = Math.max(a.topLeft.x, b.topLeft.x);
    const right = Math.min(a.bottomRight.x, b.bottomRight.x);
    const top = Math.min(a.topLeft.y, b.topLeft.y);
    const bottom = Math.max(a.bottomRight.y, b.bottomRight.y);
    return left <= right && bottom <= top
      ? {
          topLeft: { x: left, y: top },
          bottomRight: { x: right, y: bottom }
        }
      : null;
  }

  rectangleFromPositions(positions: Position[]): Rectangle | null {
    if (positions.length === 0) return null;
    let left: number = Number.MAX_SAFE_INTEGER;
    let right: number = Number.MIN_SAFE_INTEGER;
    let top: number = Number.MIN_SAFE_INTEGER;
    let bottom: number = Number.MAX_SAFE_INTEGER;
    positions.forEach(position => {
      left = Math.min(left, position.x);
      right = Math.max(right, position.x);
      top = Math.max(top, position.y);
      bottom = Math.min(bottom, position.y);
    });
    return positions.length === (right - left + 1) * (top - bottom + 1)
      ? { 
          topLeft: { x: left, y: top }, 
          bottomRight: { x: right, y: bottom }
        }
      : null;
  }

  isSamePortal(a: Portal, b: Portal): boolean {
    return this.isSamePosition(a.entrance, b.entrance)
      && this.isSamePosition(a.exit, b.exit);
  }

}