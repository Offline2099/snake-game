import { Component, computed, linkedSignal, model } from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { form, Field } from '@angular/forms/signals';
// Constants & Enums
import { PROPERTY_TABS } from '../../../constants/editor/property-tabs';
import { PropertyTabId } from '../../../constants/editor/property-tab-id.enum';
import { EditorInputId } from '../../../constants/editor/editor-input-id.enum';
import { ProtectedMarginTypeId } from '../../../constants/level/protected-margin-type-id.enum';
import { EntityParameterId } from '../../../constants/level/entity-parameter-id.enum';
import { FoodType } from '../../../constants/food/food-type.enum';
import { EnemyType } from '../../../constants/enemies/enemy-type.enum';
import { FOOD_DATA } from '../../../constants/food/food-data';
import { ENEMY_DATA } from '../../../constants/enemies/enemy-data';
// Interfaces & Types
import { Tab } from '../../../types/editor/editor-tab.interface';
import { Level } from '../../../types/level/level.interface';

interface PropertyForm {
  id: string;
  name: string;
  instructions: string;
  boundaryMargin: Record<ProtectedMarginTypeId, string>;
  obstacleMargin: Record<ProtectedMarginTypeId, string>;
  goal: string;
  food: Record<FoodType, Record<EntityParameterId, string>>;
  enemies: Record<EnemyType, Record<EntityParameterId, string>>;
}

const MARGIN_TYPE: Record<ProtectedMarginTypeId, string> = {
  [ProtectedMarginTypeId.noEnemySpawn]: 'No enemy spawn',
  [ProtectedMarginTypeId.noFoodSpawn]: 'No food spawn'
}

const ENTITY_PARAMETER: Record<EntityParameterId, string> = {
  [EntityParameterId.initialAmount]: 'Initial amount',
  [EntityParameterId.spawnOnInteraction]: 'Spawn on interaction',
  [EntityParameterId.protectedMargin]: 'Protected margin'
}

@Component({
  selector: 'app-properties',
  imports: [NgClass, NgTemplateOutlet, Field],
  templateUrl: './properties.component.html',
  styleUrl: './properties.component.scss',
})
export class PropertiesComponent {

  readonly PropertyTabId = PropertyTabId;
  readonly PROPERTY_TABS = PROPERTY_TABS;
  readonly EditorInputId = EditorInputId;
  readonly ProtectedMarginTypeId = ProtectedMarginTypeId;
  readonly EntityParameterId = EntityParameterId;
  readonly MARGIN_TYPE = MARGIN_TYPE;
  readonly ENTITY_PARAMETER = ENTITY_PARAMETER;
  readonly FOOD_DATA = FOOD_DATA;
  readonly ENEMY_DATA = ENEMY_DATA;

  level = model.required<Level>();

  formModel = linkedSignal<PropertyForm>(() => ({
    id: this.level().id.toString(),
    name: this.level().name,
    instructions: this.level().instructions.join('\n'),
    boundaryMargin: this.convertRecordType<ProtectedMarginTypeId>(this.level().protectedBoundaryMargin),
    obstacleMargin: this.convertRecordType<ProtectedMarginTypeId>(this.level().protectedObstacleMargin),
    goal: this.level().goal.toString(),
    food: this.convertNestedRecordType<FoodType, EntityParameterId>(this.level().food),
    enemies: this.convertNestedRecordType<EnemyType, EntityParameterId>(this.level().enemies)
  }));

  protectedMarginTypes: ProtectedMarginTypeId[] = Object.values(ProtectedMarginTypeId).filter(Number) as number[];
  editorEntityParameters: EntityParameterId[] = Object.values(EntityParameterId).filter(Number) as number[];
  foodTypes = computed<FoodType[]>(() => Object.keys(this.formModel().food).map(Number));
  enemyTypes = computed<EnemyType[]>(() => Object.keys(this.formModel().enemies).map(Number));

  form = form(this.formModel);

  selectedTabId: PropertyTabId = PropertyTabId.main;

  selectTab(tab: Tab): void {
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
      acc[key as unknown as T] = this.convertRecordType(value as Record<EntityParameterId, number>)
      return acc;
    }, {} as Record<T, Record<U, string>>);
  }

  onChange(id: EditorInputId, id2?: string, id3?: string): void {
    switch (id) {
      case (EditorInputId.levelId):
        this.level().id = Number(this.form.id().value());
        break;
      case (EditorInputId.levelName):
        this.level().name = this.form.name().value();
        break;
      case (EditorInputId.levelInstructions):
        this.level().instructions = this.form.instructions().value().split('\n');
        break;
      case (EditorInputId.boundaryMargin):
        this.setBoundaryMargin(Number(id2));
        break;
      case (EditorInputId.obstacleMargin):
        this.setObstacleMargin(Number(id2));
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

  setBoundaryMargin(type: ProtectedMarginTypeId): void {
    this.level().protectedBoundaryMargin[type] = Number(this.form.boundaryMargin[type]().value());
  }

  setObstacleMargin(type: ProtectedMarginTypeId): void {
    this.level().protectedObstacleMargin[type] = Number(this.form.obstacleMargin[type]().value());
  }

  setFoodParameter(type: FoodType, parameter: EntityParameterId): void {
    this.level().food[type][parameter] = Number(this.form.food[type][parameter]().value());
  }

  setEnemyParameter(type: EnemyType, parameter: EntityParameterId): void {
    this.level().enemies[type][parameter] = Number(this.form.enemies[type][parameter]().value());
  }

}
