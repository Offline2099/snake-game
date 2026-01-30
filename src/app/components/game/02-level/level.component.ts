import { Component, ChangeDetectorRef, HostListener, input, output } from '@angular/core';
import { Subscription, interval } from 'rxjs';
// Constants & Enums
import { GameState } from '../../../constants/game/game-state.enum';
// Interfaces & Types
import { Game } from '../../../types/game/game.interface';
import { Level } from '../../../types/level/level.interface';
import { Snake } from '../../../types/snake/snake.interface.ts';
// Components
import { GameStatsComponent } from '../03-game-stats/game-stats.component';
import { GameProgressComponent } from '../04-game-progress/game-progress.component';
import { GameAreaComponent } from '../05-game-area/game-area.component';
import { GameInstructionsComponent } from '../06-game-instructions/game-instructions.component';
import { GameControlsComponent } from '../07-game-controls/game-controls.component';
// Services
import { GameService } from '../../../services/game/game.service';
import { SnakeService } from '../../../services/snake.service';
import { ProgressionService } from '../../../services/progression.service';

@Component({
  selector: 'app-level',
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

  @HostListener('window:keydown', ['$event']) onKeyboardEvent(event: KeyboardEvent): void {
    event.preventDefault();
    this.handleKeyboardEvent(event.key);
  }

  handleKeyboardEvent(key: string): void {
    if (key === ' ' && this.game.state === GameState.ready) {
      this.startTimer();
      return;
    }
    if (this.timer) this.gameService.changeSnakeDirection(this.game, this.snake, key);
  }

  level = input.required<Level>();
  nextLevelId = input.required<number | null>();

  victory = output<void>();
  toMenu = output<void>();

  snake!: Snake;
  game!: Game;
  
  timer: Subscription | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private snakeService: SnakeService,
    private gameService: GameService,
    private progression: ProgressionService
  ) {}

  ngOnChanges(): void {
    this.resetGame();
  }

  resetGame(): void {
    this.stopTimer();
    this.snake = this.snakeService.createSnake();
    this.game = this.gameService.initialize(this.snake, this.level());
  }

  startTimer(): void {
    if (this.timer) this.stopTimer();
    this.game.state = GameState.running;
    this.timer = interval(this.game.stepTime).subscribe(() => {
      this.processGameStep(this.game, this.snake, this.level());
      this.cdr.markForCheck();
    });
  }

  stopTimer(): void {
    if (!this.timer) return;
    this.timer.unsubscribe();
    this.timer = null;
  }

  processGameStep(game: Game, snake: Snake, level: Level): void {
    this.gameService.processStep(game, snake, level);
    if (game.state === GameState.defeat || game.state === GameState.victory) {
      this.stopTimer();
      this.progression.updateLevelProgression(game, this.level(), this.nextLevelId());
      if (game.state === GameState.victory) this.victory.emit();
    }
  }

  showMenu(): void {
    this.toMenu.emit();
  }

  ngOnDestroy(): void {
    if (this.timer) this.timer.unsubscribe();
  }

}
