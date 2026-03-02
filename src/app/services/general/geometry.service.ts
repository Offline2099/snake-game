import { Injectable } from '@angular/core';
import { Direction } from '../../constants/general/direction/direction.enum';
import { OPPOSITE_DIRECTION } from '../../constants/general/direction/opposite-direction';
import { Position } from '../../types/general/position.interface';
import { Rectangle } from '../../types/general/rectangle.interface';

type Shift = -1 | 0 | 1;
interface Vector { x: number, y: number };
interface ShiftVector { x: Shift, y: Shift };

const SHIFT_MAP: Record<Direction, ShiftVector> = {
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
   * Returns the direction of movement between two given positions, 
   * assuming that only horizontal or vertical movement is possible, and 
   * that the start and end positions can only be adjacent to each other.
   */
  getDirection(from: Position, to: Position): Direction {
    const shift: Vector = { x: to.x - from.x, y: to.y - from.y };
    if (!shift.x) {
      if (shift.y === 1) return Direction.up;
      if (shift.y === -1) return Direction.down;
    }
    if (shift.x === 1) return Direction.right;
    if (shift.x === -1) return Direction.left;
    throw new Error('Invalid positions');
  }

  /** Returns the direction opposite to the specified one. */
  oppositeDirection(direction: Direction): Direction {
    return OPPOSITE_DIRECTION[direction];
  }

  /**
   * Returns the position shifted by a given amount of blocks in the specified 
   * direction relative to the initial position. The default amount is 1.
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

  /** 
   * Creates a rectangle that represents the intersection between two given
   * rectangles. Returns null if there is no intersection.
   */
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

  /**
   * Creates a rectangle from a given array of positions. Returns null 
   * if positions in the array do not form a rectangle.
   */
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

  /** Checks whether the given rectangle includes only one position. */
  isSingleBlock(rectangle: Rectangle): boolean {
    return this.isSamePosition(rectangle.topLeft, rectangle.bottomRight);
  }

  /** Returns true if the two given rectangles are the same, false otherwise. */
  isSameRectangle(a: Rectangle, b: Rectangle): boolean {
    return this.isSamePosition(a.topLeft, b.topLeft)
      && this.isSamePosition(a.bottomRight, b.bottomRight);
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

  /** Checks whether the inner rectangle is entirely within the outer one. */
  isRectangleWithinAnother(outer: Rectangle, inner: Rectangle): boolean {
    return this.isWithinRectangle(outer, inner.topLeft)
      && this.isWithinRectangle(outer, inner.bottomRight);
  }

  /** 
   * Checks if a given position is near the perimeter of a specified rectangle
   * within a given margin.
   */
  isNearPerimeter(rectangle: Rectangle, position: Position, margin: number): boolean {
    const innerRectangle: Rectangle = {
      topLeft: { x: rectangle.topLeft.x + margin, y: rectangle.topLeft.y - margin },
      bottomRight: { x: rectangle.bottomRight.x - margin, y: rectangle.bottomRight.y + margin }
    };
    return this.isWithinRectangle(rectangle, position) 
      && this.isOutsideRectangle(innerRectangle, position);
  }

  /** Returns an array of all positions within a specified margin from a center position. */
  positionsWithinMargin(center: Position, margin: number): Position[] {
    const positions: Position[] = [];
    for (let x = center.x - margin; x <= center.x + margin; x++) {
      for (let y = center.y + margin; y >= center.y - margin; y--) {
        positions.push({ x, y });
      }
    }
    return positions;
  }

  /** Returns an array of all positions within a specified rectangle. */
  positionsWithinRectangle(rectangle: Rectangle): Position[] {
    const positions: Position[] = [];
    for (let x = rectangle.topLeft.x; x <= rectangle.bottomRight.x; x++) {
      for (let y = rectangle.topLeft.y; y >= rectangle.bottomRight.y; y--) {
        positions.push({ x, y });
      }
    }
    return positions;
  }

  /** 
   * Returns an array of all positions near the specified rectangle's perimeter
   * within the given margin.
   */
  positionsNearPerimeter(rectangle: Rectangle, margin: number): Position[] {
    const positions: Position[] = [];
    for (let x = rectangle.topLeft.x; x <= rectangle.bottomRight.x; x++) {
      for (let y = rectangle.topLeft.y; y >= rectangle.bottomRight.y; y--) {
        const position: Position = { x, y };
        if (this.isNearPerimeter(rectangle, position, margin)) positions.push({ x, y });
        else y = rectangle.bottomRight.y + margin;
      }
    }
    return positions;
  }

}