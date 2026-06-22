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
  getSourceAdapter,
  listSourceDefinitions,
} from "@/lib/data/sources/registry"
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

function summarizeSynopsis(value: string, maxLength = 170) {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength - 3).trimEnd()}...`
}

function getAdapter(sourceId: string) {
  return getSourceAdapter(sourceId) ?? getDefaultSourceAdapter()
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
  async (limit = 18, sourceId: string = DEFAULT_SOURCE_ID) => {
    const adapter = getAdapter(sourceId)
    const items = await adapter.getHomepageManga(limit)

    return items.map((item) => normalizeMangaPreview(item, adapter.definition.id))
  }
)

export async function browseSourceManga(
  filters: SourceBrowseFilters = {},
  sourceId: string = DEFAULT_SOURCE_ID
): Promise<SourceBrowseResult> {
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
  async (limit = 10, sourceId: string = DEFAULT_SOURCE_ID) => {
    const items = await getSourceHomepageManga(Math.max(limit, 10), sourceId)
    return items.slice(0, limit)
  }
)

export const getRecentSourceManga = cache(
  async (limit = 6, sourceId: string = DEFAULT_SOURCE_ID) => {
    const items = await getSourceHomepageManga(Math.max(limit, 12), sourceId)
    return items.slice(0, limit)
  }
)

export const getSpotlightSourceManga = cache(
  async (limit = 6, sourceId: string = DEFAULT_SOURCE_ID) => {
    const items = await getSourceHomepageManga(Math.max(limit + 6, 12), sourceId)
    return items.slice(6, 6 + limit)
  }
)

export const getArchiveSourceManga = cache(
  async (limit = 6, sourceId: string = DEFAULT_SOURCE_ID) => {
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
  return getSourceDefinition(sourceId).label
}

export function getAvailableSources() {
  return listSourceDefinitions()
}

export {
  DEFAULT_SOURCE_ID,
  decodeSourceMangaSlug,
  encodeSourceMangaSlug,
  isSameSourceMangaId,
}
