import { Component, Signal, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { Level } from '../../../types/level/level.interface';
import { SecondsAsTimePipe } from '../../../pipes/seconds-as-time.pipe';

@Component({
  selector: 'app-menu',
  imports: [NgClass, SecondsAsTimePipe],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {

  levels = input.required<Signal<Level>[]>();

  selected = output<number>();

  selectLevel(id: number): void {
    this.selected.emit(id);
  }

}
