import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'secondsAsTime'
})
export class SecondsAsTimePipe implements PipeTransform {
  transform(value: number): string {
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}
