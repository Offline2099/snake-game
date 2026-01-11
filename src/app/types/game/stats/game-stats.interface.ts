import { EnemyType } from '../../../constants/enemies/enemy-type.enum';
import { FoodType } from '../../../constants/food/food-type.enum';
import { EnemyStats } from './enemy-stats.interface';
import { FoodStats } from './food-stats.interface';

export interface GameStats {
  stepsDone: number;
  elapsedTime: number;
  food: Record<FoodType, FoodStats>;
  enemies: Record<EnemyType, EnemyStats>;
  totalFoodEaten: number;
  totalFoodValue: number;
  totalEnemiesHit: number;
  totalDamageTaken: number;
}