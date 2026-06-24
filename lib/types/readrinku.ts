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
  releaseLabel?: string | null
  pageCount: number
  readable: boolean
  sourceUrl?: string
  sourceId?: string
  alternateSources?: ChapterSourceRef[]
  pages?: MangaPage[]
}

export interface Manga extends MangaExternalMeta {
  id: string
  slug: string
  title: string
  sourceId?: string
  sourceUrl?: string
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

export interface ChapterSourceRef {
  sourceId: string
  sourceName?: string
  url: string
}

export interface SourceChapterInfo {
  id: string
  mangaId: string
  title: string
  chapter: string | null
  releaseDate: string | null
  /** Source's own human label (e.g. "2 years ago") when only a relative date is available. */
  releaseLabel?: string | null
  pageCount: number
  readable: boolean
  translatedLanguage: string
  url: string
  /** Which source serves this chapter's pages (chapters can be merged across sources). */
  sourceId?: string
  sourceName?: string
  /** Other sources that also carry this chapter, tried if the primary has no pages. */
  alternateSources?: ChapterSourceRef[]
}

export interface MangaExternalMeta {
  /** Mean score out of 10 (e.g. MyAnimeList). */
  rating?: number | null
  ratingCount?: number | null
  /** MyAnimeList popularity rank (1 = most popular). */
  popularity?: number | null
  /** Demographic(s), e.g. Shounen / Seinen. */
  demographics?: string[] | null
  /** Serialization / magazine or platform, e.g. KakaoPage. */
  serializations?: string[] | null
  /** ISO date strings for first / last publication. */
  publishedFrom?: string | null
  publishedTo?: string | null
  /** Link to the external metadata source (e.g. MyAnimeList). */
  malUrl?: string | null
  /** Media type label from the metadata source, e.g. Manhwa / Manga / Manhua. */
  malType?: string | null
}

export interface SourceMangaInfo extends MangaExternalMeta {
  id: string
  title: string
  altTitles: string[] | null
  genres: string[] | null
  image: string | null
  synopsis: string
  authors: string[]
  artists: string[]
  status: MangaStatus
  contentRating: ContentRating
  readingDirection: ReadingDirection
  updatedAt: string
  chapterCount: number
  chapters: SourceChapterInfo[]
  url: string
  sourceId: string
  sourceName: string
}

export interface SourceTag {
  id: string
  name: string
}

export interface SourceMangaPreview {
  id: string
  title: string
  altTitles: string[]
  synopsis: string
  image: string | null
  authors: string[]
  artists: string[]
  genres: string[]
  status: MangaStatus
  contentRating: ContentRating
  readingDirection: ReadingDirection
  updatedAt: string
  chapterCount: number
  lastChapterLabel: string
  recentChapters: SourceChapterInfo[]
  sourceUrl: string
}

export type MangadexChapterInfo = SourceChapterInfo
export type MangadexMangaInfo = SourceMangaInfo
export type MangadexTag = SourceTag
export type MangadexMangaPreview = SourceMangaPreview

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
