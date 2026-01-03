import { Tab } from '../../types/editor/editor-tab.interface';
import { PropertyTabId } from './property-tab-id.enum';

export const PROPERTY_TABS: Tab[] = [
  { id: PropertyTabId.main, name: 'Main' },
  { id: PropertyTabId.obstacles, name: 'Obstacles' },
  { id: PropertyTabId.food, name: 'Food' },
  { id: PropertyTabId.enemies, name: 'Enemies' }
];