import { Component, Signal, Injector, runInInjectionContext, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { timer } from 'rxjs';
// Constants & Enums
import { LEVELS } from '../../../constants/levels';
import { MENU_BG_HUE, LEVEL_BG_HUE_MIN, LEVEL_BG_HUE_RANGE } from '../../../constants/backgrounds';
// Interfaces & Types
import { LevelBase } from '../../../types/level/level-base.interface';
import { Level } from '../../../types/level/level.interface';
// Components
import { BackgroundComponent } from '../../shared/background/background.component';
import { MenuComponent } from '../menu/menu.component';
import { LevelComponent } from '../level/level.component';
// Services
import { ProgressionService } from '../../../services/progression.service';

@Component({
  selector: 'app-game',
  imports: [NgClass, BackgroundComponent, MenuComponent, LevelComponent],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class GameComponent {

  levels: Signal<Level>[];
  currentLevelIndex: number | null = null;
  nextLevelId: number | null = null;

  hue: number = MENU_BG_HUE;
  isFadingIn = signal<boolean>(false);

  constructor(private progression: ProgressionService, private injector: Injector) {
    this.levels = this.progression.constructLevels(LEVELS);
  }

  showMenu(): void {
    this.currentLevelIndex = null;
    this.updateBlackground();
  }

  startLevel(id: number): void {
    this.currentLevelIndex = this.indexById(id);
    this.nextLevelId = this.currentLevelIndex === LEVELS.length - 1
      ? null
      : LEVELS[this.currentLevelIndex! + 1].id;
    this.updateBlackground();
  }

  indexById(id: number): number | null {
    const base: LevelBase | undefined = LEVELS.find(level => level.id === id);
    return base ? LEVELS.indexOf(base) : null;
  }

  updateBlackground(): void {
    this.isFadingIn.set(true);
    timer(600).subscribe(() => this.isFadingIn.set(false));
    this.hue = this.currentLevelIndex === null
      ? MENU_BG_HUE
      : LEVEL_BG_HUE_MIN + 
        LEVEL_BG_HUE_RANGE * (LEVELS[this.currentLevelIndex!].id - 1) / LEVELS.length;
  }

  onVictory(): void {
    if (this.currentLevelIndex === null || !this.nextLevelId) return;
    runInInjectionContext(this.injector, () => {
      this.levels[this.currentLevelIndex! + 1] = 
        this.progression.constructLevel(LEVELS[this.currentLevelIndex! + 1]);
    });    
  }

}
