import { EditorTabId } from './editor-tab-id.enum';
import { EditorTab } from '../../types/editor/editor-tab.interface';

export const EDITOR_TABS: EditorTab[] = [
  { id: EditorTabId.properties, name: 'Properties' },
  { id: EditorTabId.assets, name: 'Assets' }
];