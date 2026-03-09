import { Component, ElementRef, input, signal, computed, effect, viewChild } from '@angular/core';
import { timer } from 'rxjs';
import { BackgroundSettings } from '../../../types/background/background-settings.interface';
import { VoronoiSettings } from '../../../types/background/voronoi-settings.interface';
import { BackgroundService } from '../../../services/background.service';

const FADE_IN_MS: number = 600;

@Component({
  selector: 'app-background',
  host: { '[class.fading-in]': 'isFadingIn()' },
  imports: [],
  templateUrl: './background.component.html',
  styleUrl: './background.component.scss',
})
export class BackgroundComponent {

  settings = input.required<BackgroundSettings>();
  canvasRef = viewChild.required<ElementRef>('canvas');

  isFadingIn = signal<boolean>(false);
  voronoiSettings = computed<VoronoiSettings>(() => 
    this.background.voronoiSettings(this.settings())
  );

  constructor(private background: BackgroundService) {
    effect(() => {
      const canvas: HTMLCanvasElement = this.canvasRef().nativeElement;
      this.background.drawVoronoi(canvas, this.voronoiSettings());
      this.isFadingIn.set(true);
      timer(FADE_IN_MS).subscribe(() => this.isFadingIn.set(false));
    });
  }
  
}
