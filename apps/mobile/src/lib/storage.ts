import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DemoSession, LibraryStatus, ReaderPreferences } from '@rinku/core';

import type { MangaCard } from './api';

// Local persistence for the mobile app (the RN equivalent of the web's
// localStorage-backed reader-storage). Library/History store a card snapshot so
// the screens render offline without re-fetching each title.

const VERSION = 'readrinku:v1';
const KEYS = {
  session: `${VERSION}:session`,
  library: `${VERSION}:library`,
  history: `${VERSION}:history`,
  preferences: `${VERSION}:preferences`,
} as const;

export interface LibraryItem {
  manga: MangaCard;
  status: LibraryStatus;
  updatedAt: string;
}

export interface HistoryItem {
  manga: MangaCard;
  chapterTitle: string;
  chapterUrl: string;
  sourceId?: string;
  updatedAt: string;
}

export const defaultPreferences: ReaderPreferences = {
  mode: 'vertical',
  width: 'comfortable',
  controlsVisibility: 'auto',
  directionBehavior: 'manga-default',
};

async function read<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function write<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // best-effort; ignore quota/serialization errors
  }
}

export const storage = {
  getSession: () => read<DemoSession | null>(KEYS.session, null),
  setSession: (value: DemoSession | null) =>
    value ? write(KEYS.session, value) : AsyncStorage.removeItem(KEYS.session),
  getLibrary: () => read<LibraryItem[]>(KEYS.library, []),
  setLibrary: (value: LibraryItem[]) => write(KEYS.library, value),
  getHistory: () => read<HistoryItem[]>(KEYS.history, []),
  setHistory: (value: HistoryItem[]) => write(KEYS.history, value),
  getPreferences: () => read<ReaderPreferences>(KEYS.preferences, defaultPreferences),
  setPreferences: (value: ReaderPreferences) => write(KEYS.preferences, value),
  clear: () => AsyncStorage.multiRemove(Object.values(KEYS)),
};
