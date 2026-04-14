// ========================================
// Stock Game - localStorage Save/Load
// ========================================

import type { GameState } from './types';

const STORAGE_KEY = 'stock-game-save';
const SETTINGS_KEY = 'stock-game-settings';

interface SaveData {
  version: number;
  timestamp: number;
  gameState: GameState;
}

interface GameSettings {
  playerName: string;
  difficulty: 'normal' | 'hard' | 'expert';
  lastPlayed: number;
  totalPlayTime: number; // seconds
  gamesCompleted: number;
  bestGrade: string;
  highestReturn: number;
}

const CURRENT_VERSION = 1;

// ----------------------------------------
// 게임 상태 저장/로드
// ----------------------------------------

export function saveGame(gameState: GameState): void {
  if (typeof window === 'undefined') return;

  try {
    const saveData: SaveData = {
      version: CURRENT_VERSION,
      timestamp: Date.now(),
      gameState,
    };
    const serialized = JSON.stringify(saveData);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('게임 저장 실패:', error);
  }
}

export function loadGame(): GameState | null {
  if (typeof window === 'undefined') return null;

  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;

    const saveData = JSON.parse(serialized) as SaveData;

    // 버전 검증
    if (saveData.version !== CURRENT_VERSION) {
      console.warn(`저장 데이터 버전 불일치: ${saveData.version} (현재: ${CURRENT_VERSION})`);
      // 필요시 마이그레이션 로직 추가
      return null;
    }

    return saveData.gameState;
  } catch (error) {
    console.error('게임 로드 실패:', error);
    return null;
  }
}

export function hasSavedGame(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) !== null;
}

export function deleteSave(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getSaveTimestamp(): number | null {
  if (typeof window === 'undefined') return null;

  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;
    const saveData = JSON.parse(serialized) as SaveData;
    return saveData.timestamp;
  } catch {
    return null;
  }
}

// ----------------------------------------
// 게임 설정 저장/로드
// ----------------------------------------

const DEFAULT_SETTINGS: GameSettings = {
  playerName: '투자자',
  difficulty: 'normal',
  lastPlayed: 0,
  totalPlayTime: 0,
  gamesCompleted: 0,
  bestGrade: '',
  highestReturn: -Infinity,
};

export function loadSettings(): GameSettings {
  if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS };

  try {
    const serialized = localStorage.getItem(SETTINGS_KEY);
    if (!serialized) return { ...DEFAULT_SETTINGS };

    const settings = JSON.parse(serialized) as GameSettings;
    return { ...DEFAULT_SETTINGS, ...settings };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: GameSettings): void {
  if (typeof window === 'undefined') return;

  try {
    const serialized = JSON.stringify(settings);
    localStorage.setItem(SETTINGS_KEY, serialized);
  } catch (error) {
    console.error('설정 저장 실패:', error);
  }
}

export function updateSettings(partial: Partial<GameSettings>): GameSettings {
  const current = loadSettings();
  const updated = { ...current, ...partial, lastPlayed: Date.now() };
  saveSettings(updated);
  return updated;
}

// ----------------------------------------
// 스탯 업데이트
// ----------------------------------------

export function recordGameCompletion(
  grade: string,
  returnRate: number,
  playTimeSeconds: number
): GameSettings {
  const current = loadSettings();
  const updated: GameSettings = {
    ...current,
    gamesCompleted: current.gamesCompleted + 1,
    totalPlayTime: current.totalPlayTime + playTimeSeconds,
    lastPlayed: Date.now(),
  };

  // 최고 등급 갱신
  const gradeOrder = ['D', 'C', 'B', 'A', 'S'];
  if (
    !current.bestGrade ||
    gradeOrder.indexOf(grade) > gradeOrder.indexOf(current.bestGrade)
  ) {
    updated.bestGrade = grade;
  }

  // 최고 수익률 갱신
  if (returnRate > current.highestReturn) {
    updated.highestReturn = returnRate;
  }

  saveSettings(updated);
  return updated;
}
