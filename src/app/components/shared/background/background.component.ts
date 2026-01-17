import { Component, ElementRef, input, viewChild } from '@angular/core';
import { Position } from '../../../types/general/position.interface';
import { UtilityService } from '../../../services/general/utility.service';

const SEED_COUNT: number = 25;
const TILE_SIZE: number = 4;

@Component({
  selector: 'app-background',
  imports: [],
  templateUrl: './background.component.html',
  styleUrl: './background.component.scss',
})
export class BackgroundComponent {

  hue = input.required<number>();

  canvasRef = viewChild.required<ElementRef>('canvas');

  constructor(private utility: UtilityService) {}
  
  ngAfterViewInit() {
    this.drawVoronoi(SEED_COUNT);
  }

  ngOnChanges() {
    this.drawVoronoi(SEED_COUNT);
  }

  drawVoronoi(seedCount: number) {
    const canvas: HTMLCanvasElement = this.canvasRef().nativeElement;
    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (!ctx) return;
    const seeds: Position[] = this.generateRandomPositions(seedCount);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let x = 0; x < canvas.width; x += TILE_SIZE) {
      for (let y = 0; y < canvas.height; y += TILE_SIZE) {
        const distances: number[] = seeds.map(seed => this.distance(seed, {x,y}));
        const [smallest, secondSmallest]: number[] = this.findSmallestAndSecondSmallest(distances);
        ctx.fillStyle = `hsl(${this.hue()} 25% ${0.6 * Math.min(25, 10 * secondSmallest / smallest)}%`;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  generateRandomPositions(seedCount: number): Position[] {
    const canvas: HTMLCanvasElement = this.canvasRef().nativeElement;
    return [...Array(seedCount)].map(() => ({
      x: this.utility.randomInteger(0, canvas.width),
      y: this.utility.randomInteger(0, canvas.height),
    }));
  }

  distance(a: Position, b: Position): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  findSmallestAndSecondSmallest(array: number[]): number[] {
    let smallest = Number.MAX_SAFE_INTEGER;
    let secondSmallest = Number.MAX_SAFE_INTEGER;
    for (let i = 0; i < array.length; i++) {
      if (array[i] < smallest) {
        secondSmallest = smallest;
        smallest = array[i];
      }
      else if (array[i] < secondSmallest && array[i] != smallest) {
        secondSmallest = array[i];
      }
    }
    return [smallest, secondSmallest];
  }

}
