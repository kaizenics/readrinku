"use client"

import type {
  DemoProfile,
  DemoSession,
  DirectionBehavior,
  LibraryEntry,
  ReaderPreferences,
  ReaderStorage,
  ReadingProgress,
} from "@/lib/types/readrinku"

const VERSION = "readrinku:v1"

const storageKeys = {
  session: `${VERSION}:session`,
  profiles: `${VERSION}:profiles`,
  library: `${VERSION}:library`,
  progress: `${VERSION}:progress`,
  preferences: `${VERSION}:preferences`,
}

const defaultPreferences: ReaderPreferences = {
  mode: "vertical",
  width: "comfortable",
  controlsVisibility: "auto",
  directionBehavior: "manga-default" satisfies DirectionBehavior,
}

function isBrowser() {
  return typeof window !== "undefined"
}

function readValue<T>(key: string, fallback: T): T {
  if (!isBrowser()) {
    return fallback
  }

  const raw = window.localStorage.getItem(key)

  if (!raw) {
    return fallback
  }

  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeValue<T>(key: string, value: T) {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

class BrowserReaderStorage implements ReaderStorage {
  getSession(): DemoSession | null {
    return readValue<DemoSession | null>(storageKeys.session, null)
  }

  setSession(session: DemoSession | null) {
    if (!isBrowser()) {
      return
    }

    if (session) {
      writeValue(storageKeys.session, session)
      return
    }

    window.localStorage.removeItem(storageKeys.session)
  }

  getProfiles(): DemoProfile[] {
    return readValue<DemoProfile[]>(storageKeys.profiles, [])
  }

  setProfiles(profiles: DemoProfile[]) {
    writeValue(storageKeys.profiles, profiles)
  }

  getLibrary(): LibraryEntry[] {
    return readValue<LibraryEntry[]>(storageKeys.library, [])
  }

  setLibrary(entries: LibraryEntry[]) {
    writeValue(storageKeys.library, entries)
  }

  getProgress(): ReadingProgress[] {
    return readValue<ReadingProgress[]>(storageKeys.progress, [])
  }

  setProgress(progress: ReadingProgress[]) {
    writeValue(storageKeys.progress, progress)
  }

  getPreferences(): ReaderPreferences {
    return readValue<ReaderPreferences>(storageKeys.preferences, defaultPreferences)
  }

  setPreferences(preferences: ReaderPreferences) {
    writeValue(storageKeys.preferences, preferences)
  }

  clear() {
    if (!isBrowser()) {
      return
    }

    Object.values(storageKeys).forEach((key) => {
      window.localStorage.removeItem(key)
    })
  }
}

export const readerStorage = new BrowserReaderStorage()
export { defaultPreferences, storageKeys }
