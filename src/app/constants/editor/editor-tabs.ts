import { Tab } from '../../types/editor/editor-tab.interface';
import { EditorTabId } from './editor-tab-id.enum';

export const EDITOR_TABS: Tab[] = [
  { id: EditorTabId.properties, name: 'Properties' },
  { id: EditorTabId.assets, name: 'Assets' }
];