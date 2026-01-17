import { Component, input } from '@angular/core';
import { Level } from '../../../types/level/level.interface';

@Component({
  selector: 'app-game-instructions',
  imports: [],
  templateUrl: './game-instructions.component.html',
  styleUrl: './game-instructions.component.scss',
})
export class GameInstructionsComponent {

  level = input.required<Level>()

}
