import { Component, computed, linkedSignal, model } from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { form, FormField } from '@angular/forms/signals';
// Constants & Enums
import { PROPERTY_TABS } from '../../../constants/editor/property-tabs';
import { PropertyTabId } from '../../../constants/editor/property-tab-id.enum';
import { EditorInputId } from '../../../constants/editor/editor-input-id.enum';
import { EntityParameterId } from '../../../constants/level/entity-parameter-id.enum';
import { GameBlockType } from '../../../constants/game/game-block-type.enum';
import { ProtectionType } from '../../../constants/game/protection-type.enum';
import { FoodType } from '../../../constants/food/food-type.enum';
import { EnemyType } from '../../../constants/enemies/enemy-type.enum';
import { FOOD_DATA } from '../../../constants/food/food-data';
import { ENEMY_DATA } from '../../../constants/enemies/enemy-data';
// Interfaces & Types
import { EditorTab } from '../../../types/editor/editor-tab.interface';
import { LevelData } from '../../../types/level/level-data.interface';

interface PropertyForm {
  id: string;
  instructions: string;
  perimeterMargin: Record<ProtectionType, string>;
  protectedMargins: Partial<Record<GameBlockType, Record<ProtectionType, string>>>;
  goal: string;
  food: Record<FoodType, Record<EntityParameterId, string>>;
  enemies: Record<EnemyType, Record<EntityParameterId, string>>;
}

const BLOCK_TYPE: Partial<Record<GameBlockType, string>> = {
  [GameBlockType.obstacle]: 'Obstacles',
  [GameBlockType.portal]: 'Portals',
  [GameBlockType.enemy]: 'Enemies',
  [GameBlockType.food]: 'Food'
}

const MARGIN_TYPE: Record<ProtectionType, string> = {
  [ProtectionType.noEnemySpawn]: 'No enemy spawn',
  [ProtectionType.noFoodSpawn]: 'No food spawn'
}

const ENTITY_PARAMETER: Record<EntityParameterId, string> = {
  [EntityParameterId.initialAmount]: 'Initial amount',
  [EntityParameterId.spawnOnInteraction]: 'Spawn on interaction'
}

@Component({
  selector: 'app-properties',
  imports: [NgClass, NgTemplateOutlet, FormField],
  templateUrl: './properties.component.html',
  styleUrl: './properties.component.scss',
})
export class PropertiesComponent {

  readonly PropertyTabId = PropertyTabId;
  readonly PROPERTY_TABS = PROPERTY_TABS;
  readonly EditorInputId = EditorInputId;
  readonly EntityParameterId = EntityParameterId;
  readonly BLOCK_TYPE = BLOCK_TYPE;
  readonly MARGIN_TYPE = MARGIN_TYPE;
  readonly ENTITY_PARAMETER = ENTITY_PARAMETER;
  readonly FOOD_DATA = FOOD_DATA;
  readonly ENEMY_DATA = ENEMY_DATA;

  level = model.required<LevelData>();

  formModel = linkedSignal<PropertyForm>(() => ({
    id: this.level().id.toString(),
    instructions: this.level().instructions.join('\n'),
    perimeterMargin: this.convertRecordType<ProtectionType>(this.level().perimeterProtection),
    protectedMargins: 
      this.convertNestedRecordType<GameBlockType, ProtectionType>(
        this.level().protectedMargins as Record<GameBlockType, Record<ProtectionType, number>>
      ),
    goal: this.level().goal.toString(),
    food: this.convertNestedRecordType<FoodType, EntityParameterId>(this.level().food),
    enemies: this.convertNestedRecordType<EnemyType, EntityParameterId>(this.level().enemies)
  }));

  protectedMarginTypes: ProtectionType[] = Object.values(ProtectionType).filter(Number) as number[];
  editorEntityParameters: EntityParameterId[] = Object.values(EntityParameterId).filter(Number) as number[];
  gameBlockTypes = computed<GameBlockType[]>(() => Object.keys(this.formModel().protectedMargins).map(Number)) 
  foodTypes = computed<FoodType[]>(() => Object.keys(this.formModel().food).map(Number));
  enemyTypes = computed<EnemyType[]>(() => Object.keys(this.formModel().enemies).map(Number));

  form = form(this.formModel);

  selectedTabId: PropertyTabId = PropertyTabId.main;

  selectTab(tab: EditorTab): void {
    this.selectedTabId = tab.id;
  }

  convertRecordType<T extends number>(obj: Record<T, number>): Record<T, string> {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      acc[key as unknown as T] = value as string;
      return acc;
    }, {} as Record<T, string>);
  }

  convertNestedRecordType<T extends number, U extends number>(
    obj: Record<T, Record<U, number>>
  ): Record<T, Record<U, string>> {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      acc[key as unknown as T] = this.convertRecordType<U>(value as Record<U, number>)
      return acc;
    }, {} as Record<T, Record<U, string>>);
  }

  onChange(id: EditorInputId, id2?: string, id3?: string): void {
    switch (id) {
      case (EditorInputId.levelId):
        this.level().id  = Number(this.form.id().value());
        break;
      case (EditorInputId.levelInstructions):
        this.level().instructions = this.form.instructions().value().split('\n');
        break;
      case (EditorInputId.perimeterMargin):
        this.setPerimeterMargin(Number(id2));
        break;
      case (EditorInputId.protectedMargin):
        this.setProtectedMargin(Number(id2), Number(id3));
        break;
      case (EditorInputId.goal):
        this.level().goal = Number(this.form.goal().value());
        break;
      case (EditorInputId.food):
        this.setFoodParameter(Number(id2), Number(id3));
        break;
      case (EditorInputId.enemies):
        this.setEnemyParameter(Number(id2), Number(id3));
        break;
    }
  }

  setPerimeterMargin(protectionType: ProtectionType): void {
    this.level().perimeterProtection[protectionType] = 
      Number(this.form.perimeterMargin[protectionType]().value());
  }

  setProtectedMargin(blockType: GameBlockType, protectionType: ProtectionType): void {
    this.level().protectedMargins[blockType]![protectionType] = 
      Number(this.form.protectedMargins[blockType]![protectionType]().value());
  }

  setFoodParameter(foodType: FoodType, parameter: EntityParameterId): void {
    this.level().food[foodType][parameter] = Number(this.form.food[foodType][parameter]().value());
  }

  setEnemyParameter(enemyType: EnemyType, parameter: EntityParameterId): void {
    this.level().enemies[enemyType][parameter] = Number(this.form.enemies[enemyType][parameter]().value());
  }

}
