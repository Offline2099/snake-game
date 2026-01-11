import { FoodType } from './food-type.enum';
import { FoodData } from '../../types/food-data.interface';

export const FOOD_DATA: Record<FoodType, FoodData> = {
  [FoodType.normal]: {
    name: 'Normal',
    value: 1
  },
  [FoodType.yummy]: {
    name: 'Yummy',
    value: 3
  },
  [FoodType.delicious]: {
    name: 'Delicious',
    value: 5
  }
}