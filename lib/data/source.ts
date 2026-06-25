import "server-only"

import { cache } from "react"

import {
  decodeSourceMangaSlug,
  encodeSourceMangaSlug,
  isSameSourceMangaId,
} from "@/lib/data/sources/route-id"
import {
  DEFAULT_SOURCE_ID,
  getSourceDefinition,
  isConfiguredImageUrl,
} from "@/lib/data/sources/source-config"
import {
  getDefaultSourceAdapter,
  getAllSourceAdapters,
  getSourceAdapter,
  listSourceDefinitions,
} from "@/lib/data/sources/registry"
import {
  normalizeTitleKey,
  sortChaptersDescending,
  sortSourceMangaPreviews,
} from "@/lib/data/sources/create-comick-source-adapter"
import { getMyAnimeListMetadata } from "@/lib/data/myanimelist"
import { deriveContentRating, isAdultContent } from "@/lib/readrinku"
import type { SourceAdapter } from "@/lib/data/sources/types"
import type {
  SourceBrowseFilters,
  SourceBrowseResult,
} from "@/lib/data/sources/types"
import type {
  ChapterSourceRef,
  MangaPage,
  SourceChapterInfo,
  SourceMangaInfo,
  SourceMangaPreview,
} from "@/lib/types/readrinku"

const ALL_SOURCE_ID = "all"

function clampPage(value: number | undefined) {
  if (!value || !Number.isFinite(value) || value < 1) {
    return 1
  }

  return Math.floor(value)
}

function summarizeSynopsis(value: string, maxLength = 170) {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength - 3).trimEnd()}...`
}

function getAdapter(sourceId: string) {
  return getSourceAdapter(sourceId) ?? getDefaultSourceAdapter()
}

function isAllSources(sourceId: string) {
  return sourceId === ALL_SOURCE_ID
}

function normalizeChapterInfo(
  chapter: SourceChapterInfo,
  mangaId: string
): SourceChapterInfo {
  return {
    ...chapter,
    mangaId,
  }
}

function normalizeMangaInfo(info: SourceMangaInfo): SourceMangaInfo {
  const mangaId = encodeSourceMangaSlug(info.sourceId, info.id)

  return {
    ...info,
    id: mangaId,
    image: isConfiguredImageUrl(info.image) ? info.image : null,
    chapters: info.chapters.map((chapter) => normalizeChapterInfo(chapter, mangaId)),
  }
}

function normalizeMangaPreview(
  preview: SourceMangaPreview,
  sourceId: string
): SourceMangaPreview {
  const mangaId = encodeSourceMangaSlug(sourceId, preview.id)

  return {
    ...preview,
    id: mangaId,
    image: isConfiguredImageUrl(preview.image) ? preview.image : null,
    recentChapters: preview.recentChapters.map((chapter) =>
      normalizeChapterInfo(chapter, mangaId)
    ),
  }
}

// Browse listings and search results often arrive with no genres — the listing
// markup omits them for some (often brand-new) titles, and the search API never
// returns them. Without genres an adult title slips past the blur, so we back-fill
// from the (cached) detail page, and when the source has no genres at all (it
// under-tags some adult titles, e.g. only "Seinen"), fall back to MyAnimeList,
// which carries the real genres. Runs on already-normalized previews and is
// bounded so a page load stays cheap.
const MAX_GENRE_BACKFILL = 24

async function resolveBackfillGenres(
  preview: SourceMangaPreview
): Promise<string[]> {
  const { sourceId, sourceSlug } = decodeSourceMangaSlug(preview.id)
  const adapter = getAdapter(sourceId)

  const info = await adapter.getMangaInfoBySlug(sourceSlug).catch(() => null)
  // Drop the source's label placeholder so it is not mistaken for a genre.
  const sourceGenres = (info?.genres ?? []).filter(
    (genre) => genre !== adapter.definition.label
  )

  // If the source already tags it adult, trust that — no need to hit MyAnimeList.
  if (isAdultContent(undefined, sourceGenres)) {
    return sourceGenres
  }

  // Otherwise consult MyAnimeList, which carries the real genres, and union them
  // in — this catches titles the source under-tags (e.g. only "Seinen").
  const mal = await getMyAnimeListMetadata(
    preview.title,
    preview.altTitles ?? []
  ).catch(() => null)

  return [...new Set([...sourceGenres, ...(mal?.genres ?? [])])]
}

async function backfillMissingGenres(
  previews: SourceMangaPreview[]
): Promise<SourceMangaPreview[]> {
  const missing = previews.filter((preview) => preview.genres.length === 0)

  if (missing.length === 0) {
    return previews
  }

  const filled = new Map<string, string[]>()

  await Promise.all(
    missing.slice(0, MAX_GENRE_BACKFILL).map(async (preview) => {
      const genres = await resolveBackfillGenres(preview)

      if (genres.length) {
        filled.set(preview.id, genres)
      }
    })
  )

  if (filled.size === 0) {
    return previews
  }

  return previews.map((preview) => {
    const genres = filled.get(preview.id)

    return genres
      ? { ...preview, genres, contentRating: deriveContentRating(genres) }
      : preview
  })
}

// KaliScan serves cover art as ~193px-wide thumbnails, so the listing grids look
// soft. When a title has a confident MyAnimeList match we swap in MAL's full-size
// cover instead. Best-effort and bounded: no match (or a rate-limited/slow
// lookup) keeps the source thumbnail, so a card never ends up without an image.
// Reuses the same cached lookup as the genre back-fill, so overlapping titles in
// one request are fetched only once.
const MAX_COVER_UPGRADE = 48
const COVER_UPGRADE_CONCURRENCY = 6
const COVER_UPGRADE_TIMEOUT_MS = 6000

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      () => {
        clearTimeout(timer)
        resolve(fallback)
      }
    )
  })
}

async function upgradeCoversFromMyAnimeList(
  previews: SourceMangaPreview[]
): Promise<SourceMangaPreview[]> {
  const targets = previews.slice(0, MAX_COVER_UPGRADE)
  const upgraded = new Map<string, string>()
  let cursor = 0

  async function worker() {
    while (cursor < targets.length) {
      const preview = targets[cursor++]
      const mal = await withTimeout(
        getMyAnimeListMetadata(preview.title, preview.altTitles ?? []),
        COVER_UPGRADE_TIMEOUT_MS,
        null
      )

      if (mal?.coverImage && isConfiguredImageUrl(mal.coverImage)) {
        upgraded.set(preview.id, mal.coverImage)
      }
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(COVER_UPGRADE_CONCURRENCY, targets.length) },
      worker
    )
  )

  if (upgraded.size === 0) {
    return previews
  }

  return previews.map((preview) => {
    const image = upgraded.get(preview.id)
    return image ? { ...preview, image } : preview
  })
}

// Collapse the same title coming from multiple sources into one card. Prefer the
// entry with more chapters; ties keep the first occurrence (registry order).
function dedupePreviewsByTitle(previews: SourceMangaPreview[]) {
  const byKey = new Map<string, SourceMangaPreview>()

  for (const preview of previews) {
    const key = normalizeTitleKey(preview.title) || `id:${preview.id}`
    const existing = byKey.get(key)

    if (!existing || preview.chapterCount > existing.chapterCount) {
      byKey.set(key, preview)
    }
  }

  return [...byKey.values()]
}

function chapterNumberKey(chapter: SourceChapterInfo) {
  const parsed = Number.parseFloat(chapter.chapter ?? "")
  return Number.isFinite(parsed) ? String(parsed) : chapter.chapter ?? chapter.id
}

function mergeChapterLists(lists: SourceChapterInfo[][]) {
  const byNumber = new Map<
    string,
    { chapter: SourceChapterInfo; alternates: ChapterSourceRef[] }
  >()

  // Lists are processed in priority order (primary first), so the primary
  // source wins on shared chapter numbers; others become fallback sources used
  // when the primary returns no pages.
  for (const list of lists) {
    for (const chapter of list) {
      const key = chapterNumberKey(chapter)
      const existing = byNumber.get(key)

      if (!existing) {
        byNumber.set(key, { chapter, alternates: [] })
        continue
      }

      if (
        chapter.sourceId &&
        chapter.url &&
        chapter.url !== existing.chapter.url &&
        !existing.alternates.some((alt) => alt.url === chapter.url)
      ) {
        existing.alternates.push({
          sourceId: chapter.sourceId,
          sourceName: chapter.sourceName,
          url: chapter.url,
        })
      }
    }
  }

  return sortChaptersDescending(
    [...byNumber.values()].map(({ chapter, alternates }) =>
      alternates.length ? { ...chapter, alternateSources: alternates } : chapter
    )
  )
}

async function findMatchingSourceSlug(
  adapter: SourceAdapter,
  title: string,
  titleKey: string
) {
  const result = await adapter.browse({ q: title, limit: 10, page: 1 })
  const match = result.items.find(
    (item) => normalizeTitleKey(item.title) === titleKey
  )

  return match?.id ?? null
}

// Fill a title's chapter list from every other source that carries the same
// title, so missing chapters are recovered. Each chapter keeps its own source.
async function mergeChaptersAcrossSources(
  primary: SourceMangaInfo
): Promise<SourceMangaInfo> {
  const titleKey = normalizeTitleKey(primary.title)
  const others = getAllSourceAdapters().filter(
    (adapter) => adapter.definition.id !== primary.sourceId
  )

  if (!titleKey || others.length === 0) {
    return primary
  }

  const otherChapterLists = await Promise.all(
    others.map(async (adapter) => {
      try {
        const matchSlug = await findMatchingSourceSlug(adapter, primary.title, titleKey)

        if (!matchSlug) {
          return []
        }

        const info = await adapter.getMangaInfoBySlug(matchSlug)
        return info?.chapters ?? []
      } catch {
        return []
      }
    })
  )

  const merged = mergeChapterLists([primary.chapters, ...otherChapterLists])

  if (merged.length === primary.chapters.length) {
    return primary
  }

  return {
    ...primary,
    chapters: merged,
    chapterCount: merged.length,
  }
}

export type { SourceBrowseFilters, SourceBrowseResult }

// Adult/mature content is kept off the homepage shelves (it is still reachable
// via Browse, search, and the Adult/Mature genre pages behind the age gate).
function isAdultPreview(preview: SourceMangaPreview) {
  return isAdultContent(preview.contentRating, preview.genres)
}

export const getSourceHomepageManga = cache(
  async (limit = 18, sourceId: string = ALL_SOURCE_ID) => {
    if (isAllSources(sourceId)) {
      const results = await Promise.all(
        getAllSourceAdapters().map(async (adapter) => {
          // Over-fetch from the catalog source so the shelves still fill after
          // adult titles are dropped.
          const fetchCount = adapter.catalog ? Math.max(limit * 3, 30) : limit
          const items = await adapter.getHomepageManga(fetchCount)

          return items.map((item) => normalizeMangaPreview(item, adapter.definition.id))
        })
      )

      const safe = dedupePreviewsByTitle(results.flat()).filter(
        (preview) => !isAdultPreview(preview)
      )

      return upgradeCoversFromMyAnimeList(
        sortSourceMangaPreviews(safe, "updated").slice(0, limit)
      )
    }

    const adapter = getAdapter(sourceId)
    const items = await adapter.getHomepageManga(limit * 3)

    return upgradeCoversFromMyAnimeList(
      items
        .map((item) => normalizeMangaPreview(item, adapter.definition.id))
        .filter((preview) => !isAdultPreview(preview))
        .slice(0, limit)
    )
  }
)

export async function browseSourceManga(
  filters: SourceBrowseFilters = {},
  sourceId: string = ALL_SOURCE_ID
): Promise<SourceBrowseResult> {
  if (isAllSources(sourceId)) {
    const hasQuery = Boolean(filters.q?.trim())
    const adapters = getAllSourceAdapters()
    const catalogAdapters = adapters.filter((adapter) => adapter.catalog)

    // Without a query, page directly through the catalog source(s) so the full
    // upstream catalog (1500+ pages) is reachable instead of an in-memory merge.
    if (!hasQuery && catalogAdapters.length > 0) {
      const limit = filters.limit ?? 24
      const page = clampPage(filters.page)
      const results = await Promise.all(
        catalogAdapters.map(async (adapter) => {
          const result = await adapter.browse({ ...filters, limit, page })

          return {
            items: result.items.map((item) =>
              normalizeMangaPreview(item, adapter.definition.id)
            ),
            total: result.total,
          }
        })
      )

      const items = await backfillMissingGenres(
        results.flatMap((result) => result.items)
      )

      return {
        items: await upgradeCoversFromMyAnimeList(items),
        total: results.reduce((sum, result) => sum + result.total, 0),
      }
    }

    // Search (or sources without a catalog) aggregates across every source.
    const limit = filters.limit ?? 24
    const page = clampPage(filters.page)
    const results = await Promise.all(
      adapters.map(async (adapter) => {
        const result = await adapter.browse({
          ...filters,
          limit: undefined,
          page: 1,
        })

        return {
          items: result.items.map((item) =>
            normalizeMangaPreview(item, adapter.definition.id)
          ),
        }
      })
    )

    const allItems = sortSourceMangaPreviews(
      dedupePreviewsByTitle(results.flatMap((result) => result.items)),
      filters.sort
    )
    const start = (page - 1) * limit
    // Back-fill only the visible page so search results get genres (and so adult
    // titles are gated) without enriching the whole aggregated list.
    const items = await backfillMissingGenres(allItems.slice(start, start + limit))

    return {
      items: await upgradeCoversFromMyAnimeList(items),
      total: allItems.length,
    }
  }

  const adapter = getAdapter(sourceId)
  const result = await adapter.browse(filters)
  const items = await backfillMissingGenres(
    result.items.map((item) => normalizeMangaPreview(item, adapter.definition.id))
  )

  return {
    ...result,
    items: await upgradeCoversFromMyAnimeList(items),
  }
}

// Typeahead suggestions for the header search. Built for speed: it runs only the
// cheap aggregated source search (skipping the per-result detail-page back-fill,
// whose pages are large and often too big to cache, so they re-fetch every time)
// and enriches just the visible handful from MyAnimeList — a small, day-cached
// JSON lookup that yields both the adult-gating genres and a full-size cover in
// one call. The MAL pass is bounded by a hard timeout so a slow or rate-limited
// lookup can never stall the dropdown; rows still render from the source's own
// thumbnails, with title-based gating (see hasAdultTitle) as the fallback.
const SUGGEST_MAL_TIMEOUT_MS = 2500

export async function getSearchSuggestions(
  q: string,
  limit = 5
): Promise<SourceBrowseResult> {
  const query = q.trim()

  if (!query) {
    return { items: [], total: 0 }
  }

  const results = await Promise.all(
    getAllSourceAdapters().map(async (adapter) => {
      const result = await adapter
        .browse({ q: query, limit: undefined, page: 1 })
        .catch(() => ({ items: [] as SourceMangaPreview[] }))

      return result.items.map((item) =>
        normalizeMangaPreview(item, adapter.definition.id)
      )
    })
  )

  const ranked = sortSourceMangaPreviews(
    dedupePreviewsByTitle(results.flat()),
    "updated"
  )
  const top = ranked.slice(0, limit)

  const enriched = await Promise.all(
    top.map((preview) =>
      withTimeout(
        getMyAnimeListMetadata(preview.title, preview.altTitles ?? []),
        SUGGEST_MAL_TIMEOUT_MS,
        null
      )
    )
  )

  const items = top.map((preview, index) => {
    const mal = enriched[index]
    const genres = mal?.genres?.length ? mal.genres : preview.genres
    const image =
      mal?.coverImage && isConfiguredImageUrl(mal.coverImage)
        ? mal.coverImage
        : preview.image

    return {
      ...preview,
      genres,
      image,
      contentRating: deriveContentRating(genres),
    }
  })

  return { items, total: ranked.length }
}

// Genre listings come from the catalog source's /genres/{slug} pages.
export async function browseGenreManga(
  genre: string,
  filters: SourceBrowseFilters = {}
): Promise<SourceBrowseResult> {
  const adapter = getAllSourceAdapters().find((entry) => entry.catalog)

  if (!adapter) {
    return { items: [], total: 0 }
  }

  const result = await adapter.browse({ ...filters, genre })
  const items = await upgradeCoversFromMyAnimeList(
    result.items.map((item) => normalizeMangaPreview(item, adapter.definition.id))
  )

  return {
    items,
    total: result.total,
  }
}

export const getFeaturedSourceManga = cache(
  async (limit = 10, sourceId: string = ALL_SOURCE_ID) => {
    const items = await getSourceHomepageManga(Math.max(limit, 10), sourceId)
    return items.slice(0, limit)
  }
)

export const getRecentSourceManga = cache(
  async (limit = 6, sourceId: string = ALL_SOURCE_ID) => {
    const items = await getSourceHomepageManga(Math.max(limit, 12), sourceId)
    return items.slice(0, limit)
  }
)

export const getSpotlightSourceManga = cache(
  async (limit = 6, sourceId: string = ALL_SOURCE_ID) => {
    const items = await getSourceHomepageManga(Math.max(limit + 6, 12), sourceId)
    return items.slice(6, 6 + limit)
  }
)

export const getArchiveSourceManga = cache(
  async (limit = 6, sourceId: string = ALL_SOURCE_ID) => {
    const items = await getSourceHomepageManga(Math.max(limit + 12, 18), sourceId)
    return items.slice(12, 12 + limit)
  }
)

// Overlay MyAnimeList metadata (cover, synopsis, genres, authors, status,
// rating, publish dates) when a confident title match exists. Chapters and the
// source identity are never touched. Best-effort: no match → source data.
async function enrichWithMyAnimeList(
  info: SourceMangaInfo
): Promise<SourceMangaInfo> {
  const mal = await getMyAnimeListMetadata(info.title, info.altTitles ?? [])

  if (!mal) {
    return info
  }

  return {
    ...info,
    image: mal.coverImage ?? info.image,
    synopsis: mal.synopsis?.trim() || info.synopsis,
    genres: mal.genres.length ? mal.genres : info.genres,
    authors: mal.authors.length ? mal.authors : info.authors,
    status: mal.status ?? info.status,
    rating: mal.rating,
    ratingCount: mal.ratingCount,
    popularity: mal.popularity,
    demographics: mal.demographics,
    serializations: mal.serializations,
    publishedFrom: mal.publishedFrom,
    publishedTo: mal.publishedTo,
    malUrl: mal.malUrl,
    malType: mal.malType,
  }
}

export const getSourceMangaInfo = cache(async (slug: string) => {
  const { sourceId, sourceSlug } = decodeSourceMangaSlug(slug)
  const adapter = getAdapter(sourceId)
  const info = await adapter.getMangaInfoBySlug(sourceSlug)

  if (!info) {
    return null
  }

  const merged = await mergeChaptersAcrossSources(info)
  const enriched = await enrichWithMyAnimeList(merged)
  return normalizeMangaInfo(enriched)
})

export async function getSourceChapterPages(
  chapterUrl: string,
  sourceId: string = DEFAULT_SOURCE_ID
): Promise<MangaPage[]> {
  return getAdapter(sourceId).getChapterPages(chapterUrl)
}

export function getMangaCardSummary(value: SourceMangaPreview) {
  return summarizeSynopsis(value.synopsis)
}

export function getPrimarySourceLabel(sourceId: string = DEFAULT_SOURCE_ID) {
  if (isAllSources(sourceId)) {
    return "All sources"
  }

  return getSourceDefinition(sourceId).label
}

export function getAvailableSources() {
  return listSourceDefinitions()
}

export {
  ALL_SOURCE_ID,
  DEFAULT_SOURCE_ID,
  decodeSourceMangaSlug,
  encodeSourceMangaSlug,
  isSameSourceMangaId,
}
