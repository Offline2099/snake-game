import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  /** Generates a random integer between `min` and `max`, including both. */
  randomInteger(min: number, max: number): number {
    if (max < min) throw new Error('Invalid arguments');
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /** Returns a random element from the given array. */
  randomFromArray<T>(array: T[]): T {
    if (!array.length) throw new Error('Array is empty');
    return array[this.randomInteger(0, array.length - 1)];
  }

  /** Returns whether a given object is empty. */
  isEmptyObject(obj: object): boolean {
    return Object.keys(obj).length === 0;
  }

}