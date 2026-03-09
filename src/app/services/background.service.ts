import { Injectable } from '@angular/core';
import { Position } from '../types/general/position.interface';
import { BackgroundSettings } from '../types/background/background-settings.interface';
import { VoronoiSettings } from '../types/background/voronoi-settings.interface';
import { GeometryService } from './general/geometry.service';

const MENU_BG_HUE: number = 120;
const LEVEL_BG_HUE_MIN: number = 180;
const LEVEL_BG_HUE_RANGE: number = 100;

const SATURATION: number = 25;

const MENU_LIGHTNESS: number = 0.6;
const LEVEL_LIGHTNESS: number = 0.75;

const SEED_COUNT: number = 25;
const TILE_SIZE_PX: number = 4;

@Injectable({
  providedIn: 'root'
})
export class BackgroundService {

  constructor(private geometry: GeometryService) {}

  //===========================================================================
  //  Settings
  //===========================================================================

  settings(levelsTotal: number, current: number | null): BackgroundSettings {
    return {
      hue: current !== null
        ? LEVEL_BG_HUE_MIN + LEVEL_BG_HUE_RANGE * current / levelsTotal
        : MENU_BG_HUE,
      saturation: SATURATION,
      lightness: current !== null ? LEVEL_LIGHTNESS : MENU_LIGHTNESS
    };
  }

  voronoiSettings(settings: BackgroundSettings): VoronoiSettings {
    return {
      ...settings,
      seedCount: SEED_COUNT,
      tileSizePx: TILE_SIZE_PX
    };
  }

  //===========================================================================
  //  Voronoi Diagram
  //===========================================================================

  drawVoronoi(canvas: HTMLCanvasElement, settings: VoronoiSettings): void {
    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (!ctx) return;
    const seeds: Position[] = this.seedPositions(canvas, settings.seedCount);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let x = 0; x < canvas.width; x += settings.tileSizePx) {
      for (let y = 0; y < canvas.height; y += settings.tileSizePx) {
        ctx.fillStyle = this.tileColor(settings, seeds, { x, y });
        ctx.fillRect(x, y, settings.tileSizePx, settings.tileSizePx);
      }
    }
  }

  private seedPositions(canvas: HTMLCanvasElement, seedCount: number): Position[] {
    return Array.from({ length: seedCount }, () => this.geometry.randomPosition({
      topLeft: { x: 0, y: canvas.height },
      bottomRight: { x: canvas.width, y: 0 }
    }));
  }

  private tileColor(settings: VoronoiSettings, seeds: Position[], position: Position): string {
    const [closest, secondClosest]: number[] = this.closestAndSecondClosest(seeds, position);
    const lightness: number = settings.lightness * Math.min(25, 10 * secondClosest / closest);
    return `hsl(${settings.hue} ${settings.saturation}% ${lightness}%)`;
  }

  private closestAndSecondClosest(seeds: Position[], position: Position): number[] {
    let closest: number = Number.MAX_SAFE_INTEGER;
    let secondClosest: number = Number.MAX_SAFE_INTEGER;
    seeds.forEach(seed => {
      const distance: number = this.geometry.distance(seed, position);
      if (distance < closest) {
        secondClosest = closest;
        closest = distance;
      }
      else if (distance < secondClosest && distance != closest) {
        secondClosest = distance;
      }
    });
    return [closest, secondClosest];
  }

}