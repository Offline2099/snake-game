import { EnemyType } from './enemy-type.enum';
import { DamageType } from './damage-type.enum';
import { EnemyData } from '../../types/enemy-data.interface';

export const ENEMY_DATA: Record<EnemyType, EnemyData> = {
  [EnemyType.shit]: {
    name: 'Shit',
    damage: 2,
    damageType: DamageType.nature
  },
  [EnemyType.fire]: {
    name: 'Fire',
    damage: 5,
    damageType: DamageType.fire
  }
}