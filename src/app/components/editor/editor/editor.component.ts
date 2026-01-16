import { Component, ElementRef, signal } from '@angular/core';
import { NgClass } from '@angular/common';
// Constants & Enums
import { EditorTabId } from '../../../constants/editor/editor-tab-id.enum';
import { EditorInputId } from '../../../constants/editor/editor-input-id.enum';
import { EDITOR_TABS } from '../../../constants/editor/editor-tabs';
import { DEFAULT_LEVEL_DATA } from '../../../constants/level/default-level-settings';
import { AssetPlacingModeId } from '../../../constants/editor/asset-placing-mode-id.enum';
import { EDITOR_BG_HUE } from '../../../constants/backgrounds';
// Interfaces & Types
import { EditorTab } from '../../../types/editor/editor-tab.interface';
import { LevelData } from '../../../types/level/level-data.interface';
import { GameBlockData } from '../../../types/game/space/game-block-data.interface';
// Components
import { BackgroundComponent } from '../../shared/background/background.component';
import { AreaComponent } from '../area/area.component';
import { AssetsComponent } from '../assets/assets.component';
import { PropertiesComponent } from '../properties/properties.component';
// Services
import { FileService } from '../../../services/general/file.service';

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
  readonly EDITOR_BG_HUE = EDITOR_BG_HUE;

  level = signal<LevelData>({ ...DEFAULT_LEVEL_DATA });
  selectedTabId: EditorTabId = EditorTabId.assets;
  selectedAsset: GameBlockData | null = null;
  selectedModeId: AssetPlacingModeId = AssetPlacingModeId.single;

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
