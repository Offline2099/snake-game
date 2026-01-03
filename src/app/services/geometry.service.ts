import { Injectable } from '@angular/core';
import { Position } from '../types/general/position.interface';
import { Rectangle } from '../types/general/rectangle.interface';

@Injectable({
  providedIn: 'root'
})
export class GeometryService {

  /** Returns true if the two given positions are equal, false otherwise. */
  isSamePosition(a: Position, b: Position): boolean {
    return a.x === b.x && a.y === b.y;
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

}