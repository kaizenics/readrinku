export type MangaStatus = "ongoing" | "completed" | "hiatus"

export type ContentRating = "everyone" | "teen" | "mature"

export type ReadingDirection = "ltr" | "rtl"

export type LibraryStatus = "reading" | "planned" | "completed" | "bookmarked"

export type ReaderMode = "vertical" | "paged"

export type ReaderWidth = "compact" | "comfortable" | "immersive"

export type ControlsVisibility = "auto" | "always"

export type DirectionBehavior = "manga-default" | "force-ltr" | "force-rtl"

export interface MangaPage {
  src: string
  width: number
  height: number
  pageNumber: number
  alt: string
}

export interface Chapter {
  slug: string
  number: number
  title: string
  releaseDate: string
  pageCount: number
  readable: boolean
  pages?: MangaPage[]
}

export interface Manga {
  id: string
  slug: string
  title: string
  tagline: string
  synopsis: string
  coverImage: string
  authors: string[]
  genres: string[]
  status: MangaStatus
  contentRating: ContentRating
  readingDirection: ReadingDirection
  updatedAt: string
  chapterCount: number
  accent: string
  chapters: Chapter[]
}

export interface ReadingProgress {
  mangaId: string
  mangaSlug: string
  chapterSlug: string
  page: number
  totalPages: number
  scrollPercent: number
  updatedAt: string
}

export interface LibraryEntry {
  mangaId: string
  status: LibraryStatus
  addedAt: string
  updatedAt: string
  latestProgress?: ReadingProgress
}

export interface ReaderPreferences {
  mode: ReaderMode
  width: ReaderWidth
  controlsVisibility: ControlsVisibility
  directionBehavior: DirectionBehavior
}

export interface DemoSession {
  userId: string
  displayName: string
  email: string
  createdAt: string
}

export interface DemoProfile {
  userId: string
  displayName: string
  email: string
  createdAt: string
}

export interface MangaRepository {
  getAll(): Promise<Manga[]>
  getBySlug(slug: string): Promise<Manga | undefined>
  getChapter(mangaSlug: string, chapterSlug: string): Promise<Chapter | undefined>
}

export interface AuthService {
  login(input: { email: string; password: string }): Promise<DemoSession>
  register(input: {
    displayName: string
    email: string
    password: string
  }): Promise<DemoSession>
  logout(): Promise<void>
}

export interface ReaderStorage {
  getSession(): DemoSession | null
  setSession(session: DemoSession | null): void
  getProfiles(): DemoProfile[]
  setProfiles(profiles: DemoProfile[]): void
  getLibrary(): LibraryEntry[]
  setLibrary(entries: LibraryEntry[]): void
  getProgress(): ReadingProgress[]
  setProgress(progress: ReadingProgress[]): void
  getPreferences(): ReaderPreferences
  setPreferences(preferences: ReaderPreferences): void
  clear(): void
}
