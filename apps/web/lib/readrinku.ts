import { format, formatDistanceToNow } from "date-fns"

import { isSameSourceMangaId } from "@/lib/data/sources/route-id"
import type {
  ContentRating,
  DirectionBehavior,
  LibraryEntry,
  LibraryStatus,
  Manga,
  MangaStatus,
  ReaderMode,
  ReaderPreferences,
  ReaderWidth,
  ReadingProgress,
} from "@/lib/types/readrinku"

export const libraryStatusLabels: Record<LibraryStatus, string> = {
  reading: "Reading",
  planned: "Plan to read",
  completed: "Completed",
  bookmarked: "Bookmarked",
}

export const mangaStatusLabels: Record<MangaStatus, string> = {
  ongoing: "Ongoing",
  completed: "Completed",
  hiatus: "Hiatus",
}

export const contentRatingLabels: Record<ContentRating, string> = {
  everyone: "Everyone",
  teen: "Teen",
  mature: "Mature",
}

// Genres that mark a title as explicitly 18+ and trigger the blur / age gate.
// Deliberately narrow: "mature" and "ecchi" are broad/suggestive (dark themes,
// fan service) rather than explicit, so they are NOT gated — only genuinely
// adult tags are. Substrings catch variants (erotic→Erotica, porn→Pornographic,
// doujin→Doujinshi).
export const ADULT_GENRE_HINTS = [
  "adult",
  "smut",
  "hentai",
  "erotic",
  "porn",
  "doujin",
  "18+",
]

// Non-18+ genres whose label contains an adult hint as a substring (e.g.
// MyAnimeList's "Adult Cast" = grown-up characters, not explicit content).
const NOT_ADULT_GENRES = new Set(["adult cast"])

function hasAdultGenre(genres: readonly string[] | undefined) {
  return (genres ?? []).some((genre) => {
    const value = genre.toLowerCase().trim()

    if (NOT_ADULT_GENRES.has(value)) {
      return false
    }

    return ADULT_GENRE_HINTS.some((hint) => value.includes(hint))
  })
}

// Single source of truth for an explicit-adult listing/title. The "mature"
// content rating is itself derived from these same genres (see
// deriveContentRating), so the two checks stay in lockstep.
export function isAdultContent(
  contentRating: ContentRating | string | undefined,
  genres: readonly string[] | undefined
) {
  return contentRating === "mature" || hasAdultGenre(genres)
}

// Cheap, network-free adult signal derived from the title itself (e.g. a
// trailing "(Doujinshi)", or "Smut"/"Hentai" in the name). Used by the header
// typeahead, which skips the heavier per-result genre back-fill for speed and so
// can't always rely on real genres being present — this is the safety net that
// still blurs the obvious cases instantly. A false positive only over-blurs.
export function hasAdultTitle(title: string, altTitles: readonly string[] = []) {
  return [title, ...altTitles].some((value) => {
    const text = (value ?? "").toLowerCase()
    return ADULT_GENRE_HINTS.some((hint) => text.includes(hint))
  })
}

// Maps a source's genre tags onto our coarse content rating. Kept here so every
// source adapter classifies adult/teen content identically.
export function deriveContentRating(
  genres: readonly string[] | undefined
): ContentRating {
  if (hasAdultGenre(genres)) {
    return "mature"
  }

  if ((genres ?? []).some((genre) => genre.toLowerCase().includes("teen"))) {
    return "teen"
  }

  return "everyone"
}

export const readerModeLabels: Record<ReaderMode, string> = {
  vertical: "Vertical",
  paged: "Single page",
}

export const readerWidthLabels: Record<ReaderWidth, string> = {
  compact: "Compact",
  comfortable: "Comfortable",
  immersive: "Immersive",
}

export const directionBehaviorLabels: Record<DirectionBehavior, string> = {
  "manga-default": "Use title default",
  "force-ltr": "Always left to right",
  "force-rtl": "Always right to left",
}

export const defaultDemoCredentials = {
  email: "reader@readrinku.dev",
  password: "readrinku-demo",
  displayName: "Demo Reader",
}

export const siteNavigation = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/library", label: "Library" },
  { href: "/history", label: "History" },
  { href: "/settings", label: "Settings" },
]

export function formatDateLabel(value: string) {
  return format(new Date(value), "MMM d, yyyy")
}

export function formatRelativeLabel(value: string) {
  return formatDistanceToNow(new Date(value), { addSuffix: true })
}

export function isPlaceholderAsset(value: string) {
  return value.startsWith("/placeholders/")
}

export function getLatestChapter(manga: Manga) {
  return getRecentChapters(manga, 1)[0]
}

export function getRecentChapters(manga: Manga, limit = 3) {
  return [...manga.chapters]
    .sort((left, right) => {
      const dateCompare = right.releaseDate.localeCompare(left.releaseDate)

      if (dateCompare !== 0) {
        return dateCompare
      }

      return right.number - left.number
    })
    .slice(0, limit)
}

export function getMangaProgress(
  progress: ReadingProgress[],
  mangaId: string
): ReadingProgress | undefined {
  return [...progress]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .find((entry) => isSameSourceMangaId(entry.mangaId, mangaId))
}

export function getProgressPercent(entry?: ReadingProgress) {
  if (!entry || entry.totalPages <= 0) {
    return 0
  }

  return Math.round((entry.page / entry.totalPages) * 100)
}

export function mergeLibraryProgress(
  entries: LibraryEntry[],
  progress: ReadingProgress[]
): LibraryEntry[] {
  return entries.map((entry) => ({
    ...entry,
    latestProgress: getMangaProgress(progress, entry.mangaId),
  }))
}

export function sortManga(
  manga: Manga[],
  sort: string | undefined,
  progress: ReadingProgress[] = []
) {
  const items = [...manga]

  switch (sort) {
    case "updated":
      return items.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    case "title":
      return items.sort((left, right) => left.title.localeCompare(right.title))
    case "chapters":
      return items.sort((left, right) => right.chapterCount - left.chapterCount)
    case "continue":
      return items.sort((left, right) => {
        const leftDate = getMangaProgress(progress, left.id)?.updatedAt ?? ""
        const rightDate = getMangaProgress(progress, right.id)?.updatedAt ?? ""
        return rightDate.localeCompare(leftDate)
      })
    default:
      return items.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
  }
}

export function filterManga(
  manga: Manga[],
  filters: {
    q?: string
    genre?: string
    status?: string
    rating?: string
  }
) {
  return manga.filter((item) => {
    const matchesQuery = filters.q
      ? `${item.title} ${item.synopsis} ${item.genres.join(" ")}`
          .toLowerCase()
          .includes(filters.q.toLowerCase())
      : true

    const matchesGenre = filters.genre ? item.genres.includes(filters.genre) : true
    const matchesStatus = filters.status ? item.status === filters.status : true
    const matchesRating = filters.rating
      ? item.contentRating === filters.rating
      : true

    return matchesQuery && matchesGenre && matchesStatus && matchesRating
  })
}

export function getReaderWidthClass(width: ReaderPreferences["width"]) {
  switch (width) {
    case "compact":
      return "max-w-3xl"
    case "immersive":
      return "max-w-7xl"
    default:
      return "max-w-5xl"
  }
}
