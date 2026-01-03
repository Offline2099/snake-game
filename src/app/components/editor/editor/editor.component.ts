import { Component, signal } from '@angular/core';
import { NgClass } from '@angular/common';
// Constants & Enums
import { EditorTabId } from '../../../constants/editor/editor-tab-id.enum';
import { EditorInputId } from '../../../constants/editor/editor-input-id.enum';
import { EDITOR_TABS } from '../../../constants/editor/editor-tabs';
import { DEFAULT_LEVEL } from '../../../constants/level/default-level';
import { AssetPlacingModeId } from '../../../constants/editor/asset-placing-mode-id.enum';
// Interfaces & Types
import { Tab } from '../../../types/editor/editor-tab.interface';
import { Level } from '../../../types/level/level.interface';
import { GameBlockData } from '../../../types/game/game-block-data.interface';
// Components
import { AreaComponent } from '../area/area.component';
import { AssetsComponent } from '../assets/assets.component';
import { PropertiesComponent } from '../properties/properties.component';
// Services
import { FileService } from '../../../services/file.service';

@Component({
  selector: 'app-editor',
  imports: [NgClass, AreaComponent, AssetsComponent, PropertiesComponent],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
})
export class EditorComponent {
  
  readonly EditorInputId = EditorInputId;
  readonly EditorTabId = EditorTabId;
  readonly EDITOR_TABS = EDITOR_TABS;

  level = signal<Level>({ ...DEFAULT_LEVEL });
  selectedTabId: EditorTabId = EditorTabId.assets;
  selectedAsset: GameBlockData | null = null;
  selectedModeId: AssetPlacingModeId = AssetPlacingModeId.single;

  constructor(private file: FileService) {}

  loadJSON(): void {
    this.file.useFileInputById(EditorInputId.file);
  }

  onFileChange(event: Event) {
    this.file.readUserJSON<Level>(this.level(), event, (updatedLevel) => {
      this.level.set({ ...updatedLevel });
    });
  }

  saveJSON(): void {
    const fileName: string = `level-${this.level().id}`;
    this.file.downloadAsJSON<Level>(this.level(), fileName);
  }

  selectTab(tab: Tab): void {
    this.selectedTabId = tab.id;
  }

}
