import { Injectable, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { tap, of, catchError, Observable, map } from 'rxjs';
// Constants & Enums
import { DEFAULT_PROGRESSION } from '../constants/level/default-progression';
import { DEFAULT_LEVEL_DATA } from '../constants/level/default-level-settings';
// Interfaces & Types
import { Game } from '../types/game/game.interface';
import { Level } from '../types/level/level.interface';
import { LevelBase } from '../types/level/level-base.interface';
import { LevelProgression } from '../types/level/level-progression.interface';
import { LevelData } from '../types/level/level-data.interface';
import { LevelSettings } from '../types/level/level-settings.type';

const PROGRESSION_KEY: string = 'level-progression';
const SETTINGS_KEY: string = 'level-settings';

const DATA_URL: string = 'data';

const ALWAYS_UNLOCKED_ID: number[] = [1];

@Injectable({
  providedIn: 'root'
})
export class ProgressionService {

  constructor(private http: HttpClient) {}

  constructLevels(baseArray: LevelBase[]): Signal<Level>[] {
    return baseArray.map(base => this.constructLevel(base));
  }

  constructLevel(base: LevelBase): Signal<Level> {
    const progression: LevelProgression = this.getLevelProgression(base.id);
    return toSignal(this.getLevelSettings(base.id).pipe(
      map(settings => ({
        ...base,
        progression,
        settings: progression.isLocked ? { ...DEFAULT_LEVEL_DATA } : settings
      }))
    ), { initialValue: this.emptyLevel(base) });
  }

  private emptyLevel(base: LevelBase): Level {
    return {
      ...base,
      progression: this.getDefaultProgression(base.id),
      settings: { ...DEFAULT_LEVEL_DATA }
    }
  }

  //===========================================================================
  //  Level Progression
  //===========================================================================

  updateLevelProgression(game: Game, level: Level, nextLevelId: number | null): void {
    const progression: LevelProgression = this.getLevelProgression(level.id);
    if (game.isVictory) {
      progression.isComplete = true;
      if (!progression.bestTime || progression.bestTime > game.stats.elapsedTime)
        progression.bestTime = game.stats.elapsedTime;
      if (nextLevelId) this.unlockNextLevel(nextLevelId);
    }
    if (progression.bestProgress < game.progress) progression.bestProgress = game.progress;
    level.progression = { ...progression };
    this.saveLevelProgression(level.id, { ...progression });
  }

  private levelProgressionKey(id: number): string {
    return `${PROGRESSION_KEY}-${id}`;
  }

  private saveLevelProgression(id: number, progression: LevelProgression): void {
    localStorage.setItem(this.levelProgressionKey(id), JSON.stringify(progression));
  }

  private getDefaultProgression(id: number): LevelProgression {
    return ALWAYS_UNLOCKED_ID.includes(id)
      ? { ...DEFAULT_PROGRESSION, isLocked: false }
      : { ...DEFAULT_PROGRESSION };
  }

  private getLevelProgression(id: number): LevelProgression {
    const data: string | null = localStorage.getItem(this.levelProgressionKey(id));
    if (data !== null) return JSON.parse(data);
    const progression: LevelProgression = this.getDefaultProgression(id);
    this.saveLevelProgression(id, progression);
    return progression;
  }

  private unlockNextLevel(nextLevelId: number): void {
    const progression: LevelProgression = this.getLevelProgression(nextLevelId);
    this.saveLevelProgression(nextLevelId, { ...progression, isLocked: false });
  }

  //===========================================================================
  //  Level Settings
  //===========================================================================

  private levelSettingsURL(id: number): string {
    return `${DATA_URL}/level-${id}.json`;
  }

  private levelSettingsKey(id: number): string {
    return `${SETTINGS_KEY}-${id}`;
  }

  private saveLevelSettings(id: number, settings: LevelSettings): void {
    localStorage.setItem(this.levelSettingsKey(id), JSON.stringify(settings));
  }

  private fetchLevelData(id: number): Observable<LevelSettings> {
    return this.http.get<LevelData>(this.levelSettingsURL(id)).pipe(
      tap(data => {
        if (data === null) return;
        const { id, ...settings } = data;
        this.saveLevelSettings(id, settings);
      }),
      catchError(error => {
        console.error('Error fetching level data:', error);
        return of({ ...DEFAULT_LEVEL_DATA });
      })
    );
  }

  private getLevelSettings(id: number): Observable<LevelSettings> {
    const data: string | null = localStorage.getItem(this.levelSettingsKey(id));
    if (data !== null) return of(JSON.parse(data));
    return this.fetchLevelData(id);
  }

}
