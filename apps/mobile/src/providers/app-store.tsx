import type { DemoSession, LibraryStatus, ReaderPreferences } from '@rinku/core';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { MangaCard } from '@/lib/api';
import {
  defaultPreferences,
  storage,
  type HistoryItem,
  type LibraryItem,
} from '@/lib/storage';

interface AppStore {
  hydrated: boolean;
  session: DemoSession | null;
  library: LibraryItem[];
  history: HistoryItem[];
  preferences: ReaderPreferences;
  libraryStatus: (mangaId: string) => LibraryStatus | undefined;
  toggleLibrary: (manga: MangaCard, status: LibraryStatus) => void;
  removeFromLibrary: (mangaId: string) => void;
  recordHistory: (
    manga: MangaCard,
    chapter: { title: string; url: string; sourceId?: string }
  ) => void;
  updatePreferences: (patch: Partial<ReaderPreferences>) => void;
  login: (input: { email: string; displayName?: string }) => void;
  logout: () => void;
  clearAll: () => void;
}

const AppStoreContext = createContext<AppStore | null>(null);

function now() {
  return new Date().toISOString();
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<DemoSession | null>(null);
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [preferences, setPreferences] = useState<ReaderPreferences>(defaultPreferences);

  useEffect(() => {
    let active = true;
    (async () => {
      const [s, lib, hist, prefs] = await Promise.all([
        storage.getSession(),
        storage.getLibrary(),
        storage.getHistory(),
        storage.getPreferences(),
      ]);
      if (!active) return;
      setSession(s);
      setLibrary(lib);
      setHistory(hist);
      setPreferences(prefs);
      setHydrated(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  const libraryStatus = useCallback(
    (mangaId: string) => library.find((item) => item.manga.id === mangaId)?.status,
    [library]
  );

  const toggleLibrary = useCallback((manga: MangaCard, status: LibraryStatus) => {
    setLibrary((prev) => {
      const existing = prev.find((item) => item.manga.id === manga.id);
      const without = prev.filter((item) => item.manga.id !== manga.id);
      const next =
        existing && existing.status === status
          ? without
          : [{ manga, status, updatedAt: now() }, ...without];
      storage.setLibrary(next);
      return next;
    });
  }, []);

  const removeFromLibrary = useCallback((mangaId: string) => {
    setLibrary((prev) => {
      const next = prev.filter((item) => item.manga.id !== mangaId);
      storage.setLibrary(next);
      return next;
    });
  }, []);

  const recordHistory = useCallback(
    (manga: MangaCard, chapter: { title: string; url: string; sourceId?: string }) => {
      setHistory((prev) => {
        const without = prev.filter(
          (item) => !(item.manga.id === manga.id && item.chapterUrl === chapter.url)
        );
        const next = [
          {
            manga,
            chapterTitle: chapter.title,
            chapterUrl: chapter.url,
            sourceId: chapter.sourceId,
            updatedAt: now(),
          },
          ...without,
        ].slice(0, 50);
        storage.setHistory(next);
        return next;
      });
    },
    []
  );

  const updatePreferences = useCallback((patch: Partial<ReaderPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...patch };
      storage.setPreferences(next);
      return next;
    });
  }, []);

  const login = useCallback((input: { email: string; displayName?: string }) => {
    const next: DemoSession = {
      userId: 'local-reader',
      displayName: input.displayName?.trim() || input.email.split('@')[0],
      email: input.email.trim(),
      createdAt: now(),
    };
    setSession(next);
    storage.setSession(next);
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    storage.setSession(null);
  }, []);

  const clearAll = useCallback(() => {
    setSession(null);
    setLibrary([]);
    setHistory([]);
    setPreferences(defaultPreferences);
    storage.clear();
  }, []);

  const value = useMemo<AppStore>(
    () => ({
      hydrated,
      session,
      library,
      history,
      preferences,
      libraryStatus,
      toggleLibrary,
      removeFromLibrary,
      recordHistory,
      updatePreferences,
      login,
      logout,
      clearAll,
    }),
    [
      hydrated,
      session,
      library,
      history,
      preferences,
      libraryStatus,
      toggleLibrary,
      removeFromLibrary,
      recordHistory,
      updatePreferences,
      login,
      logout,
      clearAll,
    ]
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) {
    throw new Error('useAppStore must be used within AppStoreProvider');
  }
  return ctx;
}
