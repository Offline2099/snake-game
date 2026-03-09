import { FoodType } from '../food/food-type.enum';
import { FoodData } from '../../../types/game/entities/food-data.interface';

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