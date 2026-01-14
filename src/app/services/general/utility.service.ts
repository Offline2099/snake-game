import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  /** Generates a random integer between `min` and `max`, including both. */
  randomInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /** Returns a random element from the given array. */
  randomFromArray<T>(array: T[]): T {
    return array[this.randomInteger(0, array.length - 1)];
  }

}