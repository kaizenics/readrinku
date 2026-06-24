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
} from "@/lib/data/sources/source-config"
import {
  getDefaultSourceAdapter,
  getAllSourceAdapters,
  getSourceAdapter,
  listSourceDefinitions,
} from "@/lib/data/sources/registry"
import { sortSourceMangaPreviews } from "@/lib/data/sources/create-comick-source-adapter"
import type {
  SourceBrowseFilters,
  SourceBrowseResult,
} from "@/lib/data/sources/types"
import type {
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
    recentChapters: preview.recentChapters.map((chapter) =>
      normalizeChapterInfo(chapter, mangaId)
    ),
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

      return sortSourceMangaPreviews(results.flat(), "updated").slice(0, limit)
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
      results.flatMap((result) => result.items),
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

export const getSourceMangaInfo = cache(async (slug: string) => {
  const { sourceId, sourceSlug } = decodeSourceMangaSlug(slug)
  const adapter = getAdapter(sourceId)
  const info = await adapter.getMangaInfoBySlug(sourceSlug)

  return info ? normalizeMangaInfo(info) : null
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
