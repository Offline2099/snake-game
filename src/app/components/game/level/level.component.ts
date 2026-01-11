import { Component, HostListener, input, output } from '@angular/core';
import { Subscription, interval } from 'rxjs';
// Interfaces & Types
import { Game } from '../../../types/game/game.interface';
import { Level } from '../../../types/level/level.interface';
import { Snake } from '../../../types/snake/snake.interface.ts';
// Components
import { GameStatsComponent } from '../game-stats/game-stats.component';
import { GameProgressComponent } from '../game-progress/game-progress.component';
import { GameAreaComponent } from '../game-area/game-area.component';
import { GameInstructionsComponent } from '../game-instructions/game-instructions.component';
import { GameControlsComponent } from '../game-controls/game-controls.component';
// Services
import { GameService } from '../../../services/game.service';
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
    if (key === ' ' && !this.timer) {
      this.startTimer();
      return;
    }
    if (this.timer) this.gameService.changeSnakeDirectionByKey(this.game, this.snake, key);
  }

  level = input.required<Level>();
  nextLevelId = input.required<number | null>();

  victory = output<void>();
  toMenu = output<void>();

  snake!: Snake;
  game!: Game;
  
  timer: Subscription | null = null;

  constructor(
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
    this.timer = interval(this.game.stepTime).subscribe(() => {
      this.processGameStep(this.game, this.snake, this.level());
    });
  }

  stopTimer(): void {
    if (!this.timer) return;
    this.timer.unsubscribe();
    this.timer = null;
  }

  processGameStep(game: Game, snake: Snake, level: Level): void {
    this.gameService.processStep(game, snake, level);
    if (game.isDefeat || game.isVictory) {
      this.stopTimer();
      this.progression.updateLevelProgression(game, this.level(), this.nextLevelId());
      if (game.isVictory) this.victory.emit();
    }
  }

  showMenu(): void {
    this.toMenu.emit();
  }

  ngOnDestroy(): void {
    if (this.timer) this.timer.unsubscribe();
  }

}
