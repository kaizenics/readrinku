"use client"

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
} from "react"

import { defaultDemoCredentials, getMangaProgress } from "@/lib/readrinku"
import { defaultPreferences, readerStorage } from "@/lib/storage/reader-storage"
import type {
  DemoProfile,
  DemoSession,
  LibraryEntry,
  LibraryStatus,
  ReaderPreferences,
  ReadingProgress,
} from "@/lib/types/readrinku"

interface ReadRinkuContextValue {
  hydrated: boolean
  session: DemoSession | null
  profiles: DemoProfile[]
  library: LibraryEntry[]
  progress: ReadingProgress[]
  preferences: ReaderPreferences
  login(input: { email: string; password: string }): Promise<void>
  register(input: {
    displayName: string
    email: string
    password: string
  }): Promise<void>
  logout(): Promise<void>
  setLibraryStatus(mangaId: string, status?: LibraryStatus): void
  updateProgress(entry: ReadingProgress): void
  updatePreferences(input: Partial<ReaderPreferences>): void
  clearDemoData(): void
}

const ReadRinkuContext = createContext<ReadRinkuContextValue | null>(null)

function buildSession(profile: DemoProfile): DemoSession {
  return {
    userId: profile.userId,
    displayName: profile.displayName,
    email: profile.email,
    createdAt: new Date().toISOString(),
  }
}

export function ReadRinkuProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false)
  const [session, setSession] = useState<DemoSession | null>(null)
  const [profiles, setProfiles] = useState<DemoProfile[]>([])
  const [library, setLibrary] = useState<LibraryEntry[]>([])
  const [progress, setProgress] = useState<ReadingProgress[]>([])
  const [preferences, setPreferences] =
    useState<ReaderPreferences>(defaultPreferences)

  useEffect(() => {
    startTransition(() => {
      setSession(readerStorage.getSession())
      setProfiles(readerStorage.getProfiles())
      setLibrary(readerStorage.getLibrary())
      setProgress(readerStorage.getProgress())
      setPreferences(readerStorage.getPreferences())
      setHydrated(true)
    })
  }, [])

  async function login(input: { email: string; password: string }) {
    await new Promise((resolve) => window.setTimeout(resolve, 500))

    const existingProfile = profiles.find(
      (profile) => profile.email.toLowerCase() === input.email.toLowerCase()
    )

    const demoAllowed =
      input.email.toLowerCase() === defaultDemoCredentials.email &&
      input.password === defaultDemoCredentials.password

    if (!existingProfile && !demoAllowed) {
      throw new Error("Use the demo account or register a profile first.")
    }

    if (!input.password) {
      throw new Error("Enter a password to continue.")
    }

    const profile =
      existingProfile ??
      ({
        userId: "demo-reader",
        displayName: defaultDemoCredentials.displayName,
        email: defaultDemoCredentials.email,
        createdAt: new Date().toISOString(),
      } satisfies DemoProfile)

    const nextSession = buildSession(profile)
    setSession(nextSession)
    readerStorage.setSession(nextSession)
  }

  async function register(input: {
    displayName: string
    email: string
    password: string
  }) {
    await new Promise((resolve) => window.setTimeout(resolve, 600))

    if (!input.password) {
      throw new Error("Create a password to start the demo session.")
    }

    if (
      profiles.some(
        (profile) => profile.email.toLowerCase() === input.email.toLowerCase()
      )
    ) {
      throw new Error("That email is already registered in local demo storage.")
    }

    const nextProfile: DemoProfile = {
      userId: crypto.randomUUID(),
      displayName: input.displayName,
      email: input.email.toLowerCase(),
      createdAt: new Date().toISOString(),
    }

    const nextProfiles = [...profiles, nextProfile]
    const nextSession = buildSession(nextProfile)

    setProfiles(nextProfiles)
    setSession(nextSession)
    readerStorage.setProfiles(nextProfiles)
    readerStorage.setSession(nextSession)
  }

  async function logout() {
    setSession(null)
    readerStorage.setSession(null)
  }

  function setLibraryStatus(mangaId: string, status?: LibraryStatus) {
    const now = new Date().toISOString()
    const nextProgress = getMangaProgress(progress, mangaId)

    const nextEntries = status
      ? [
          ...library.filter((entry) => entry.mangaId !== mangaId),
          {
            mangaId,
            status,
            addedAt:
              library.find((entry) => entry.mangaId === mangaId)?.addedAt ?? now,
            updatedAt: now,
            latestProgress: nextProgress,
          },
        ]
      : library.filter((entry) => entry.mangaId !== mangaId)

    setLibrary(nextEntries)
    readerStorage.setLibrary(nextEntries)
  }

  function updateProgress(entry: ReadingProgress) {
    const nextProgress = [
      entry,
      ...progress.filter(
        (current) =>
          !(
            current.mangaId === entry.mangaId &&
            current.chapterSlug === entry.chapterSlug
          )
      ),
    ].slice(0, 50)

    const nextLibrary = library.map((libraryEntry) =>
      libraryEntry.mangaId === entry.mangaId
        ? {
            ...libraryEntry,
            updatedAt: entry.updatedAt,
            latestProgress: entry,
          }
        : libraryEntry
    )

    setProgress(nextProgress)
    setLibrary(nextLibrary)
    readerStorage.setProgress(nextProgress)
    readerStorage.setLibrary(nextLibrary)
  }

  function updatePreferences(input: Partial<ReaderPreferences>) {
    const nextPreferences = { ...preferences, ...input }
    setPreferences(nextPreferences)
    readerStorage.setPreferences(nextPreferences)
  }

  function clearDemoData() {
    setSession(null)
    setProfiles([])
    setLibrary([])
    setProgress([])
    setPreferences(defaultPreferences)
    readerStorage.clear()
  }

  return (
    <ReadRinkuContext.Provider
      value={{
        hydrated,
        session,
        profiles,
        library,
        progress,
        preferences,
        login,
        register,
        logout,
        setLibraryStatus,
        updateProgress,
        updatePreferences,
        clearDemoData,
      }}
    >
      {children}
    </ReadRinkuContext.Provider>
  )
}

export function useReadRinku() {
  const context = useContext(ReadRinkuContext)

  if (!context) {
    throw new Error("useReadRinku must be used inside ReadRinkuProvider.")
  }

  return context
}
