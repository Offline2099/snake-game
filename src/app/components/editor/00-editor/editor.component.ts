import { Component, ElementRef, signal } from '@angular/core';
import { NgClass } from '@angular/common';
// Constants & Enums
import { EditorTabId } from '../../../constants/editor/editor-tab-id.enum';
import { EditorInputId } from '../../../constants/editor/editor-input-id.enum';
import { EDITOR_TABS } from '../../../constants/editor/editor-tabs';
import { DEFAULT_SETTINGS } from '../../../constants/level/default-settings';
import { DEFAULT_SELECTED_ASSET } from '../../../constants/editor/default-selected-asset';
import { AssetPlacingModeId } from '../../../constants/editor/asset-placing-mode-id.enum';
// Interfaces & Types
import { EditorTab } from '../../../types/editor/editor-tab.interface';
import { LevelData } from '../../../types/level/level-data.interface';
import { GameBlock } from '../../../types/game/space-block/game-block.interface';
import { BackgroundSettings } from '../../../types/background/background-settings.interface';
// Components
import { BackgroundComponent } from '../../shared/background/background.component';
import { AreaComponent } from '../01-area/area.component';
import { AssetsComponent } from '../02-assets/assets.component';
import { PropertiesComponent } from '../03-properties/properties.component';
// Services
import { FileService } from '../../../services/general/file.service';

const EDITOR_BG_SETTINGS: BackgroundSettings = {
  hue: 160,
  saturation: 25,
  lightness: 0.7
}

@Component({
  selector: 'app-editor',
  imports: [NgClass, BackgroundComponent, AreaComponent, AssetsComponent, PropertiesComponent],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
})
export class EditorComponent {
  
  readonly EditorInputId = EditorInputId;
  readonly EditorTabId = EditorTabId;
  readonly EDITOR_TABS = EDITOR_TABS;
  readonly EDITOR_BG_SETTINGS= EDITOR_BG_SETTINGS;

  level = signal<LevelData>({ ...DEFAULT_SETTINGS, id: 1 });
  selectedTabId: EditorTabId = EditorTabId.assets;
  selectedAsset: GameBlock = { ...DEFAULT_SELECTED_ASSET };
  selectedMode: AssetPlacingModeId = AssetPlacingModeId.single;
  previousMode: AssetPlacingModeId = AssetPlacingModeId.single;

  constructor(private container: ElementRef, private fileService: FileService) {}

  loadJSON(): void {
    this.fileService.useFileInputById(EditorInputId.file);
  }

  onFileChange(event: Event) {
    this.fileService.readUserJSON<LevelData>(this.level(), event, (updatedLevel) => {
      this.level.set({ ...updatedLevel });
    });
  }

  saveJSON(): void {
    const fileName: string = `level-${this.level().id}`;
    this.fileService.downloadAsJSON<LevelData>(this.level(), fileName, this.container.nativeElement);
  }

  selectTab(tab: EditorTab): void {
    this.selectedTabId = tab.id;
  }

}
