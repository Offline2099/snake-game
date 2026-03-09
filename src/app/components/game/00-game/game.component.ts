import { Component, Signal, signal, computed } from '@angular/core';
// Interfaces & Types
import { Level } from '../../../types/level/level.interface';
import { BackgroundSettings } from '../../../types/background/background-settings.interface';
// Components
import { BackgroundComponent } from '../../shared/background/background.component';
import { MenuComponent } from '../01-menu/menu.component';
import { LevelComponent } from '../02-level/level.component';
// Services
import { BackgroundService } from '../../../services/background.service';
import { ProgressionService } from '../../../services/progression.service';
import { GameBlockService } from '../../../services/game/game-block.service';

@Component({
  selector: 'app-game',
  imports: [BackgroundComponent, MenuComponent, LevelComponent],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent {

  levels: Signal<Level[]>;
  currentLevel = signal<Level | null>(null);
  nextLevelId = computed<number | null>(() => this.getNextLevelId(this.currentLevel()));
  bgSettings = computed<BackgroundSettings>(() => this.backgroundSettings(this.currentLevel()));

  constructor(
    private background: BackgroundService,
    private progression: ProgressionService,
    private gameBlock: GameBlockService
    ) {
    this.levels = this.progression.constructLevels();
  }

  ngAfterViewInit(): void {
    this.preloadAssetImages();
  }

  showMenu(): void {
    this.currentLevel.set(null);
  }

  startLevel(level: Level): void {
    this.currentLevel.set(level);
  }

  getNextLevelId(currentLevel: Level | null): number | null {
    if (!currentLevel) return null;
    return this.progression.nextLevelId(currentLevel.id);
  }

  backgroundSettings(currentLevel: Level | null): BackgroundSettings {
    const currentIndex: number | null = currentLevel !== null 
      ? this.progression.levelIndex(currentLevel.id) 
      : null;
    return this.background.settings(this.progression.levelsTotal(), currentIndex);
  }

  onVictory(): void {
    if (!this.nextLevelId()) return;
    this.progression.updateLevel(this.nextLevelId()!); 
  } 

  preloadAssetImages(): void {
    this.gameBlock.allBlockImages().forEach(url => {
      const image = new Image();
      image.src = url;
    });
  }
  
}
