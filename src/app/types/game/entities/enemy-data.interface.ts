import { DamageType } from '../../../constants/game/enemies/damage-type.enum';

export interface EnemyData {
  name: string;
  damage: number;
  damageType: DamageType;
}