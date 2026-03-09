import { Injectable, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, BehaviorSubject, combineLatest, take, map, tap, of, catchError } from 'rxjs';
import { version } from '../../../package.json';
// Constants & Enums
import { LEVELS } from '../constants/levels';
import { DEFAULT_PROGRESSION } from '../constants/level/default-progression';
import { DEFAULT_SETTINGS } from '../constants/level/default-settings';
import { GameState } from '../constants/game/game-state.enum';
// Interfaces & Types
import { Level } from '../types/level/level.interface';
import { LevelBase } from '../types/level/level-base.interface';
import { LevelData } from '../types/level/level-data.interface';
import { LevelProgression } from '../types/level/level-progression.interface';
import { LevelSettings } from '../types/level/level-settings.interface';
import { Game } from '../types/game/game.interface';

const PROGRESSION_KEY: string = 'level-progression';
const SETTINGS_KEY: string = 'level-settings';
const DATA_URL: string = 'data';
const ALWAYS_UNLOCKED_ID: number[] = [1];

@Injectable({
  providedIn: 'root'
})
export class ProgressionService {

  levels = new BehaviorSubject<Level[]>([]);

  constructor(private http: HttpClient) {}

  constructLevels(): Signal<Level[]> {
    combineLatest(LEVELS.map(base => this.constructLevel(base)))
      .subscribe(levels => this.levels.next(levels));
    return toSignal(this.levels, { initialValue: [] });
  }

  updateLevel(id: number): void {
    const index: number = this.levelIndex(id);
    this.constructLevel(LEVELS[index]).subscribe(level => {
      const levels: Level[] = this.levels.value;
      levels.splice(index, 1, level);
      this.levels.next(levels);
    });
  }

  private constructLevel(base: LevelBase): Observable<Level> {
    const progression: LevelProgression = this.getLevelProgression(base.id);
    const settings: Observable<LevelSettings> = progression.isLocked
      ? of({ ...DEFAULT_SETTINGS })
      : this.getLevelSettings(base.id);
    return settings.pipe(take(1), map(settings => ({ ...base, progression, settings })));
  }

  //===========================================================================
  //  Level Array
  //===========================================================================

  levelIndex(id: number): number {
    return LEVELS.findIndex(base => base.id === id);
  }

  nextLevelId(id: number): number | null {
    const currentIndex: number = this.levelIndex(id);
    return currentIndex !== LEVELS.length - 1
      ? LEVELS[currentIndex + 1].id
      : null;
  }

  levelsTotal(): number {
    return LEVELS.length;
  }

  //===========================================================================
  //  Level Progression
  //===========================================================================

  updateLevelProgression(game: Game, level: Level, nextLevelId: number | null): void {
    const progression: LevelProgression = this.getLevelProgression(level.id);
    if (game.state === GameState.victory) {
      progression.isComplete = true;
      if (!progression.bestTime || progression.bestTime > game.stats.elapsedTime)
        progression.bestTime = game.stats.elapsedTime;
      if (nextLevelId) this.unlockNextLevel(nextLevelId);
    }
    if (progression.bestProgress < game.progress) progression.bestProgress = game.progress;
    level.progression = { ...progression };
    this.saveLevelProgression(level.id, { ...progression });
  }

  private unlockNextLevel(nextLevelId: number): void {
    const progression: LevelProgression = this.getLevelProgression(nextLevelId);
    this.saveLevelProgression(nextLevelId, { ...progression, isLocked: false });
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

  //===========================================================================
  //  Level Settings
  //===========================================================================

  private levelSettingsURL(id: number): string {
    return `${DATA_URL}/level-${id}.json`;
  }

  private levelSettingsKey(id: number): string {
    return `${SETTINGS_KEY}-${version}-${id}`;
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
        return of({ ...DEFAULT_SETTINGS });
      })
    );
  }

  private getLevelSettings(id: number): Observable<LevelSettings> {
    const data: string | null = localStorage.getItem(this.levelSettingsKey(id));
    if (data !== null) return of(JSON.parse(data));
    return this.fetchLevelData(id);
  }

}