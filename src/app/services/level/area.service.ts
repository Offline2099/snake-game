import { Injectable } from '@angular/core';
// Interfaces & Types
import { Position } from '../../types/general/position.interface';
import { Rectangle } from '../../types/general/rectangle.interface';
import { Area } from '../../types/level/map/area.interface';
// Services
import { GeometryService } from '../general/geometry.service';

@Injectable({
  providedIn: 'root'
})
export class AreaService {

  constructor(private geometry: GeometryService) { }

  //===========================================================================
  //  Queries
  //===========================================================================

  isWithinArea(area: Area, position: Position): boolean {
    return !this.geometry.isOutsideRectangle(area.rectangle, position)
      && !this.isPositionExcluded(area, position);
  }

  includedPositions(area: Area): Position[] {
    return this.geometry.positionsWithinRectangle(area.rectangle)
      .filter(position => !this.isPositionExcluded(area, position));
  } 

  private isPositionExcluded(area: Area, position: Position): boolean {
    return this.isPositionContainedInExcludedPositions(area, position)
      || this.isPositionContainedInExcludedRectangles(area, position);
  }

  private isRectangleExcluded(area: Area, rectangle: Rectangle): boolean {
    return this.isRectangleContainedInExcludedPositions(area, rectangle)
      || this.isRectangleContainedInExcludedRectangles(area, rectangle);
  }

  private isPositionContainedInExcludedPositions(area: Area, position: Position): boolean {
    if (!area.excludePositions) return false;
    return area.excludePositions.find(excludedPosition => 
      this.geometry.isSamePosition(excludedPosition, position)
    ) !== undefined;
  }

  private isPositionContainedInExcludedRectangles(area: Area, position: Position): boolean {
    if (!area.excludeRectangles) return false;
    return area.excludeRectangles.find(excludedRectangle => 
      this.geometry.isWithinRectangle(excludedRectangle, position)
    ) !== undefined;
  }

  private isRectangleContainedInExcludedPositions(area: Area, rectangle: Rectangle): boolean {
    if (!area.excludePositions) return false;
    return !this.geometry.positionsWithinRectangle(rectangle).some(position => 
      !this.isPositionContainedInExcludedPositions(area, position)
    );
  }

  private isRectangleContainedInExcludedRectangles(area: Area, rectangle: Rectangle): boolean {
    if (!area.excludeRectangles) return false;
    return area.excludeRectangles.find(excludedRectangle => 
      this.geometry.isRectangleWithinAnother(excludedRectangle, rectangle)
    ) !== undefined;
  }

  //===========================================================================
  //  Actions
  //===========================================================================

  excludePosition(area: Area, position: Position): void {
    if (this.isPositionExcluded(area, position)) return;
    if (!area.excludePositions) area.excludePositions = [];
    area.excludePositions.push({ ...position });
  }

  excludeRectangle(area: Area, rectangle: Rectangle): void {
    if (this.isRectangleExcluded(area, rectangle)) return;
    if (!area.excludeRectangles) area.excludeRectangles = [];
    area.excludeRectangles.push({ ...rectangle });
  }

  includePosition(area: Area, position: Position): void {
    if (!area.excludePositions) return;
    for (const [index, excluded] of area.excludePositions.entries()) {
      if (this.geometry.isSamePosition(excluded, position)) {
        area.excludePositions.splice(index, 1);
        break;
      }
    }
    if (area.excludePositions.length === 0) delete area.excludePositions;
  }

  includeRectangle(area: Area, rectangle: Rectangle): void {
    if (area.excludePositions) 
      this.geometry.positionsWithinRectangle(rectangle).forEach(position => 
        this.includePosition(area, position)
      );
    if (!area.excludeRectangles) return;
    for (let i = 0; i < area.excludeRectangles.length; i++) {
      if (this.geometry.isRectangleWithinAnother(rectangle, area.excludeRectangles[i])) {
        area.excludeRectangles.splice(i, 1);
        i--;
      }
    }
    if (area.excludeRectangles.length === 0) delete area.excludeRectangles;
  }

}