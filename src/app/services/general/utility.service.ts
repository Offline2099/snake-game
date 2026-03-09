import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  randomInteger(min: number, max: number): number {
    if (max < min) throw new Error('Invalid arguments');
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  randomFromArray<T>(array: T[]): T {
    if (!array.length) throw new Error('Array is empty');
    return array[this.randomInteger(0, array.length - 1)];
  }

  isEmptyObject(obj: object): boolean {
    return Object.keys(obj).length === 0;
  }

}