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

export const getSourceHomepageManga = cache(
  async (limit = 18, sourceId: string = ALL_SOURCE_ID) => {
    if (isAllSources(sourceId)) {
      const results = await Promise.all(
        getAllSourceAdapters().map(async (adapter) => {
          const items = await adapter.getHomepageManga(limit)

          return items.map((item) => normalizeMangaPreview(item, adapter.definition.id))
        })
      )

      return sortSourceMangaPreviews(
        dedupePreviewsByTitle(results.flat()),
        "updated"
      ).slice(0, limit)
    }

    const adapter = getAdapter(sourceId)
    const items = await adapter.getHomepageManga(limit)

    return items.map((item) => normalizeMangaPreview(item, adapter.definition.id))
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

      if (catalogAdapters.length === 1) {
        return results[0]
      }

      return {
        items: results.flatMap((result) => result.items),
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
    const items = allItems.slice(start, start + limit)

    return {
      items,
      total: allItems.length,
    }
  }

  const adapter = getAdapter(sourceId)
  const result = await adapter.browse(filters)

  return {
    ...result,
    items: result.items.map((item) =>
      normalizeMangaPreview(item, adapter.definition.id)
    ),
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
