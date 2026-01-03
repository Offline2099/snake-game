import { DamageType } from '../constants/enemies/damage-type.enum';

export interface EnemyData {
  name: string;
  damage: number;
  damageType: DamageType;
}