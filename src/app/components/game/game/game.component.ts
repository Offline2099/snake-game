import { Component, Signal, Injector, runInInjectionContext } from '@angular/core';
import { LEVELS } from '../../../constants/levels';
import { LevelBase } from '../../../types/level/level-base.interface';
import { Level } from '../../../types/level/level.interface';
import { MenuComponent } from '../menu/menu.component';
import { LevelComponent } from '../level/level.component';
import { ProgressionService } from '../../../services/progression.service';

@Component({
  selector: 'app-game',
  imports: [MenuComponent, LevelComponent],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class GameComponent {

  levels: Signal<Level>[];
  currentLevelIndex: number | null = null;
  nextLevelId: number | null = null;

  constructor(private progression: ProgressionService, private injector: Injector) {
    this.levels = this.progression.constructLevels(LEVELS);
  }

  showMenu(): void {
    this.currentLevelIndex = null;
  }

  indexById(id: number): number | null {
    const base: LevelBase | undefined = LEVELS.find(level => level.id === id);
    return base ? LEVELS.indexOf(base) : null;
  }

  startLevel(id: number): void {
    this.currentLevelIndex = this.indexById(id);
    this.nextLevelId = this.currentLevelIndex === LEVELS.length - 1
      ? null
      : LEVELS[this.currentLevelIndex! + 1].id;
  }

  onVictory(): void {
    if (this.currentLevelIndex === null || !this.nextLevelId) return;
    runInInjectionContext(this.injector, () => {
      this.levels[this.currentLevelIndex! + 1] = 
        this.progression.constructLevel(LEVELS[this.currentLevelIndex! + 1]);
    });    
  }

}
