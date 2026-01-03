import { EnemyData } from "../../types/enemy-data.interface";
import { DamageType } from "./damage-type.enum";
import { EnemyType } from "./enemy-type.enum";

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
  },
}