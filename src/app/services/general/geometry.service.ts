import { Injectable } from '@angular/core';
// Constants & Enums
import { Direction } from '../../constants/general/direction.enum';
import { OPPOSITE_DIRECTION } from '../../constants/general/opposite-direction';
// Interfaces & Types
import { Position } from '../../types/general/position.interface';
import { Rectangle } from '../../types/general/rectangle.interface';
import { UtilityService } from './utility.service';

type Shift = -1 | 0 | 1;
interface Vector { x: number, y: number };
interface ShiftVector { x: Shift, y: Shift };

const SHIFT_MAP: Record<Direction, ShiftVector> = {
  [Direction.up]: { x: 0, y: 1 },
  [Direction.down]: { x: 0, y: -1 },
  [Direction.left]: { x: -1, y: 0 },
  [Direction.right]: { x: 1, y: 0 }
};

@Injectable({
  providedIn: 'root'
})
export class GeometryService {

  constructor(private utility: UtilityService) {}

  isSamePosition(a: Position, b: Position): boolean {
    return a.x === b.x && a.y === b.y;
  }

  randomPosition(rectangle: Rectangle): Position {
    return {
      x: this.utility.randomInteger(rectangle.topLeft.x, rectangle.bottomRight.x),
      y: this.utility.randomInteger(rectangle.bottomRight.y, rectangle.topLeft.y)
    };
  }

  distance(a: Position, b: Position): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

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

  oppositeDirection(direction: Direction): Direction {
    return OPPOSITE_DIRECTION[direction];
  }

  shiftPosition(initial: Position, direction: Direction, amount: number = 1): Position {
    return {
      x: initial.x + amount * SHIFT_MAP[direction].x,
      y: initial.y + amount * SHIFT_MAP[direction].y
    };
  }

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
    };
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

  isSingleBlock(rectangle: Rectangle): boolean {
    return this.isSamePosition(rectangle.topLeft, rectangle.bottomRight);
  }

  isSameRectangle(a: Rectangle, b: Rectangle): boolean {
    return this.isSamePosition(a.topLeft, b.topLeft)
      && this.isSamePosition(a.bottomRight, b.bottomRight);
  }

  isOutsideRectangle(rectangle: Rectangle, position: Position): boolean {
    return position.x < rectangle.topLeft.x
      || position.x > rectangle.bottomRight.x
      || position.y < rectangle.bottomRight.y
      || position.y > rectangle.topLeft.y;
  }

  isWithinRectangle(rectangle: Rectangle, position: Position): boolean {
    return !this.isOutsideRectangle(rectangle, position);
  }

  isRectangleWithinAnother(outer: Rectangle, inner: Rectangle): boolean {
    return this.isWithinRectangle(outer, inner.topLeft)
      && this.isWithinRectangle(outer, inner.bottomRight);
  }

  isNearPerimeter(rectangle: Rectangle, position: Position, margin: number): boolean {
    const innerRectangle: Rectangle = {
      topLeft: { x: rectangle.topLeft.x + margin, y: rectangle.topLeft.y - margin },
      bottomRight: { x: rectangle.bottomRight.x - margin, y: rectangle.bottomRight.y + margin }
    };
    return this.isWithinRectangle(rectangle, position) 
      && this.isOutsideRectangle(innerRectangle, position);
  }

  positionsWithinMargin(center: Position, margin: number): Position[] {
    const positions: Position[] = [];
    for (let x = center.x - margin; x <= center.x + margin; x++) {
      for (let y = center.y + margin; y >= center.y - margin; y--) {
        positions.push({ x, y });
      }
    }
    return positions;
  }

  positionsWithinRectangle(rectangle: Rectangle): Position[] {
    const positions: Position[] = [];
    for (let x = rectangle.topLeft.x; x <= rectangle.bottomRight.x; x++) {
      for (let y = rectangle.topLeft.y; y >= rectangle.bottomRight.y; y--) {
        positions.push({ x, y });
      }
    }
    return positions;
  }

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