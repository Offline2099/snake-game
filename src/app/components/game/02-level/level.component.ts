import { Component, ChangeDetectorRef, input, output } from '@angular/core';
import { interval, Subscription } from 'rxjs';
// Constants & Enums
import { GameState } from '../../../constants/game/game-state.enum';
import { DIRECTION_BY_KEY } from '../../../constants/general/direction-by-key';
// Interfaces & Types
import { Level } from '../../../types/level/level.interface';
import { Game } from '../../../types/game/game.interface';
// Components
import { GameStatsComponent } from '../03-game-stats/game-stats.component';
import { GameProgressComponent } from '../04-game-progress/game-progress.component';
import { GameAreaComponent } from '../05-game-area/game-area.component';
import { GameInstructionsComponent } from '../06-game-instructions/game-instructions.component';
import { GameControlsComponent } from '../07-game-controls/game-controls.component';
// Services
import { GameService } from '../../../services/game/game.service';
import { ProgressionService } from '../../../services/progression.service';

@Component({
  selector: 'app-level',
  host: { '(window:keydown)': 'onKeyboardEvent($event)' },
  imports: [ 
    GameStatsComponent,
    GameProgressComponent,
    GameAreaComponent,
    GameInstructionsComponent,
    GameControlsComponent
  ],
  templateUrl: './level.component.html',
  styleUrl: './level.component.scss',
})
export class LevelComponent {

  level = input.required<Level>();
  nextLevelId = input.required<number | null>();

  victory = output<void>();
  toMenu = output<void>();

  game!: Game;
  previousProgress: number = 0;
  latestChange: number = 0;

  timer: Subscription | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private gameService: GameService,
    private progression: ProgressionService
  ) {}

  ngOnChanges(): void {
    this.resetGame();
  }

  resetGame(): void {
    this.stopTimer();
    this.game = this.gameService.initialize(this.level());
  }

  startTimer(): void {
    if (this.timer) this.stopTimer();
    this.game.state = GameState.running;
    this.timer = interval(this.game.stepTime).subscribe(() => {
      this.processGameStep(this.game, this.level());
      this.cdr.markForCheck();
    });
  }

  stopTimer(): void {
    if (!this.timer) return;
    this.timer.unsubscribe();
    this.timer = null;
  }

  processGameStep(game: Game, level: Level): void {
    this.previousProgress = game.progress;
    this.gameService.processStep(game, level);
    this.latestChange = game.progress - this.previousProgress;
    if (this.gameService.hasEnded(game)) this.finishGame(game, level);;
  }

  finishGame(game: Game, level: Level): void {
    this.stopTimer();
    this.previousProgress = 0;
    this.latestChange = 0;
    this.progression.updateLevelProgression(game, level, this.nextLevelId());
    if (game.state === GameState.victory) this.victory.emit();
  }

  showMenu(): void {
    this.toMenu.emit();
  }

  onKeyboardEvent(event: KeyboardEvent): void {
    event.preventDefault();
    const key: string = event.key;
    if (key === 'Escape') this.showMenu();
    switch (this.game.state) {
      case GameState.ready:
        if (key === ' ') this.startTimer();
        break;
      case GameState.running:
        if (DIRECTION_BY_KEY[key] !== undefined) 
          this.gameService.changeSnakeDirection(this.game, key)
        break;
      case GameState.defeat:
        if (key === ' ' || key === 'Enter') this.resetGame();
        break;
      case GameState.victory:
        if (key === 'Enter') this.showMenu();
        if (key === ' ') this.resetGame();
        break;
    }
  }

  ngOnDestroy(): void {
    if (this.timer) this.timer.unsubscribe();
  }

}
