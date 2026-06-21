import "server-only"

import { cache } from "react"

import type {
  ContentRating,
  MangaPage,
  MangaStatus,
  MangadexChapterInfo,
  MangadexMangaInfo,
  MangadexMangaPreview,
  MangadexTag,
  ReadingDirection,
} from "@/lib/types/readrinku"

const MANGADEX_API_BASE_URL =
  process.env.MANGADEX_API_BASE_URL ?? "https://api.mangadex.org"

const MANGADEX_IMAGE_BASE_URL = "https://uploads.mangadex.org"
const DEFAULT_REVALIDATE_SECONDS = 900
const DEFAULT_PAGE_WIDTH = 1200
const DEFAULT_PAGE_HEIGHT = 1800

type LocalizedRecord = Record<string, string>

type MangadexRelationship = {
  id: string
  type: string
  attributes?: Record<string, unknown>
}

type MangadexMangaEntity = {
  id: string
  attributes?: {
    title?: LocalizedRecord
    altTitles?: LocalizedRecord[]
    description?: LocalizedRecord
    status?: string
    contentRating?: string
    updatedAt?: string
    originalLanguage?: string
    lastChapter?: string
    tags?: Array<{
      attributes?: {
        name?: LocalizedRecord
        group?: string
      }
    }>
  }
  relationships?: MangadexRelationship[]
}

type MangadexChapterEntity = {
  id: string
  attributes?: {
    chapter?: string | null
    title?: string | null
    publishAt?: string | null
    pages?: number | null
    externalUrl?: string | null
    isUnavailable?: boolean
    translatedLanguage?: string | null
  }
  relationships?: MangadexRelationship[]
}

type MangadexListResponse = {
  data?: MangadexMangaEntity[]
  total?: number
}

type MangadexChapterListResponse = {
  data?: MangadexChapterEntity[]
}

type MangadexAtHomeResponse = {
  baseUrl?: string
  chapter?: {
    hash?: string
    dataSaver?: string[]
    data?: string[]
  }
}

export interface MangadexBrowseFilters {
  q?: string
  genre?: string
  status?: string
  rating?: string
  sort?: string
  limit?: number
  offset?: number
}

export interface MangadexBrowseResult {
  items: MangadexMangaPreview[]
  total: number
}

function pickLocalizedText(record?: LocalizedRecord | null) {
  if (!record) {
    return ""
  }

  const preferredKeys = ["en", "ja-ro", "ko-ro", "zh-ro", "ja", "ko", "zh"]

  for (const key of preferredKeys) {
    const value = record[key]?.trim()

    if (value) {
      return value
    }
  }

  return Object.values(record).find((value) => value.trim())?.trim() ?? ""
}

function flattenAltTitles(value: LocalizedRecord[] | undefined, title: string) {
  if (!value?.length) {
    return []
  }

  return [...new Set(value.flatMap((entry) => Object.values(entry)))]
    .map((entry) => entry.trim())
    .filter((entry) => entry && entry !== title)
}

function normalizeSynopsis(value: string) {
  if (!value.trim()) {
    return "No synopsis is available for this title yet."
  }

  return value
    .replace(/\r?\n+/g, " ")
    .replace(/[-*_]{3,}/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function summarizeSynopsis(value: string, maxLength = 170) {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength - 3).trimEnd()}...`
}

function mapStatus(value: string | undefined): MangaStatus {
  switch (value) {
    case "completed":
      return "completed"
    case "hiatus":
    case "cancelled":
      return "hiatus"
    default:
      return "ongoing"
  }
}

function mapContentRating(value: string | undefined): ContentRating {
  switch (value) {
    case "suggestive":
      return "teen"
    case "erotica":
    case "pornographic":
      return "mature"
    default:
      return "everyone"
  }
}

function inferReadingDirection(value: string | undefined): ReadingDirection {
  return ["ja", "ko", "zh", "zh-hk"].includes(value ?? "") ? "rtl" : "ltr"
}

function getRelationshipNames(
  relationships: MangadexRelationship[] | undefined,
  type: "author" | "artist"
) {
  return relationships
    ?.filter((relationship) => relationship.type === type)
    .map((relationship) => relationship.attributes?.name)
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0) ?? []
}

function getCoverFileName(relationships: MangadexRelationship[] | undefined) {
  const cover = relationships?.find((relationship) => relationship.type === "cover_art")
  const fileName = cover?.attributes?.fileName

  return typeof fileName === "string" && fileName.trim().length > 0 ? fileName : null
}

function getChapterMangaId(relationships: MangadexRelationship[] | undefined) {
  return (
    relationships?.find((relationship) => relationship.type === "manga")?.id ?? ""
  )
}

function buildCoverUrl(mangaId: string, fileName: string | null) {
  return fileName ? `${MANGADEX_IMAGE_BASE_URL}/covers/${mangaId}/${fileName}` : null
}

function parseChapterCount(value: string | undefined) {
  if (!value?.trim()) {
    return 0
  }

  const parsed = Number.parseFloat(value)

  return Number.isFinite(parsed) ? Math.max(Math.floor(parsed), 0) : 0
}

function mapGenres(entity: MangadexMangaEntity) {
  const genres =
    entity.attributes?.tags
      ?.filter((tag) => tag.attributes?.group === "genre")
      .map((tag) => pickLocalizedText(tag.attributes?.name))
      .filter(Boolean) ?? []

  return genres.length ? genres : ["Uncategorized"]
}

function mapPreview(entity: MangadexMangaEntity): MangadexMangaPreview | null {
  const title = pickLocalizedText(entity.attributes?.title)

  if (!title) {
    return null
  }

  const synopsis = normalizeSynopsis(pickLocalizedText(entity.attributes?.description))
  const coverImage = buildCoverUrl(entity.id, getCoverFileName(entity.relationships))
  const lastChapter = entity.attributes?.lastChapter?.trim() ?? ""

  return {
    id: entity.id,
    title,
    altTitles: flattenAltTitles(entity.attributes?.altTitles, title),
    synopsis,
    image: coverImage,
    authors: getRelationshipNames(entity.relationships, "author"),
    artists: getRelationshipNames(entity.relationships, "artist"),
    genres: mapGenres(entity),
    status: mapStatus(entity.attributes?.status),
    contentRating: mapContentRating(entity.attributes?.contentRating),
    readingDirection: inferReadingDirection(entity.attributes?.originalLanguage),
    updatedAt: entity.attributes?.updatedAt ?? new Date(0).toISOString(),
    chapterCount: parseChapterCount(entity.attributes?.lastChapter),
    lastChapterLabel: lastChapter ? `Ch. ${lastChapter}` : "Chapter unavailable",
    recentChapters: [],
  }
}

function mapChapter(entity: MangadexChapterEntity): MangadexChapterInfo | null {
  const attributes = entity.attributes

  if (!attributes) {
    return null
  }

  const chapterLabel = attributes.chapter?.trim() ?? null
  const title = attributes.title?.trim()

  return {
    id: entity.id,
    mangaId: getChapterMangaId(entity.relationships),
    title: title || (chapterLabel ? `Chapter ${chapterLabel}` : "Untitled chapter"),
    chapter: chapterLabel,
    releaseDate: attributes.publishAt ?? null,
    pageCount: attributes.pages ?? 0,
    readable: !attributes.isUnavailable && !attributes.externalUrl,
    translatedLanguage: attributes.translatedLanguage ?? "unknown",
  }
}

function toMangadexInfo(
  manga: MangadexMangaPreview,
  chapters: MangadexChapterInfo[]
): MangadexMangaInfo {
  return {
    id: manga.id,
    title: manga.title,
    altTitles: manga.altTitles,
    genres: manga.genres,
    image: manga.image,
    synopsis: manga.synopsis,
    authors: manga.authors,
    artists: manga.artists,
    status: manga.status,
    contentRating: manga.contentRating,
    readingDirection: manga.readingDirection,
    updatedAt: manga.updatedAt,
    chapterCount: manga.chapterCount,
    chapters,
  }
}

async function fetchMangadexJson<T>(
  path: string,
  revalidate = DEFAULT_REVALIDATE_SECONDS
): Promise<T | null> {
  const response = await fetch(`${MANGADEX_API_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
    },
    next: {
      revalidate,
    },
  }).catch(() => null)

  if (!response?.ok) {
    return null
  }

  const contentType = response.headers.get("content-type") ?? ""

  if (!contentType.includes("application/json")) {
    return null
  }

  return (await response.json().catch(() => null)) as T | null
}

function appendArray(params: URLSearchParams, key: string, values: string[]) {
  values.forEach((value) => params.append(key, value))
}

function getRatingFilter(value: string | undefined) {
  switch (value) {
    case "everyone":
      return ["safe"]
    case "teen":
      return ["suggestive"]
    case "mature":
      return ["erotica", "pornographic"]
    default:
      return ["safe", "suggestive", "erotica", "pornographic"]
  }
}

function getSortOrder(sort: string | undefined, query: string | undefined) {
  if (query?.trim()) {
    return { key: "order[relevance]", value: "desc" }
  }

  switch (sort) {
    case "title":
      return { key: "order[title]", value: "asc" }
    case "popular":
      return { key: "order[followedCount]", value: "desc" }
    case "newest":
      return { key: "order[createdAt]", value: "desc" }
    default:
      return { key: "order[latestUploadedChapter]", value: "desc" }
  }
}

function buildBrowseQuery(filters: MangadexBrowseFilters) {
  const params = new URLSearchParams()

  params.set("limit", String(filters.limit ?? 12))
  params.set("offset", String(filters.offset ?? 0))

  if (filters.q?.trim()) {
    params.set("title", filters.q.trim())
  }

  if (filters.status?.trim()) {
    params.append("status[]", filters.status.trim())
  }

  if (filters.genre?.trim()) {
    params.append("includedTags[]", filters.genre.trim())
  }

  appendArray(params, "contentRating[]", getRatingFilter(filters.rating))
  appendArray(params, "includes[]", ["cover_art", "author", "artist"])
  appendArray(params, "availableTranslatedLanguage[]", ["en"])

  const order = getSortOrder(filters.sort, filters.q)
  params.set(order.key, order.value)

  return params.toString()
}

export async function browseMangadexManga(
  filters: MangadexBrowseFilters = {}
): Promise<MangadexBrowseResult> {
  const response = await fetchMangadexJson<MangadexListResponse>(
    `/manga?${buildBrowseQuery(filters)}`
  )

  const items = response?.data?.map(mapPreview).filter(
    (item): item is MangadexMangaPreview => Boolean(item)
  ) ?? []

  return {
    items: await enrichMangadexPreviews(items),
    total: response?.total ?? items.length,
  }
}

async function getMangadexPreviewChapters(mangaId: string) {
  let chapters = await getMangadexChapters(mangaId, {
    limit: 3,
    translatedLanguage: ["en"],
  })

  if (chapters.length === 0) {
    chapters = await getMangadexChapters(mangaId, {
      limit: 3,
    })
  }

  return chapters.slice(0, 3)
}

async function enrichMangadexPreviews(items: MangadexMangaPreview[]) {
  return Promise.all(
    items.map(async (item) => ({
      ...item,
      recentChapters: await getMangadexPreviewChapters(item.id),
    }))
  )
}

export const getFeaturedMangadexManga = cache(async (limit = 8) => {
  const { items } = await browseMangadexManga({
    limit,
    sort: "popular",
  })

  return items
})

export const getRecentMangadexManga = cache(async (limit = 6) => {
  const { items } = await browseMangadexManga({
    limit,
    sort: "updated",
  })

  return items
})

export const getPopularMangadexManga = cache(async (limit = 6) => {
  const { items } = await browseMangadexManga({
    limit,
    sort: "popular",
  })

  return items
})

export const getCompletedMangadexManga = cache(async (limit = 6) => {
  const { items } = await browseMangadexManga({
    limit,
    sort: "updated",
    status: "completed",
  })

  return items
})

export const getMangadexTags = cache(async (): Promise<MangadexTag[]> => {
  const response = await fetchMangadexJson<{
    data?: Array<{
      id: string
      attributes?: {
        name?: LocalizedRecord
        group?: string
      }
    }>
  }>("/manga/tag", 86400)

  return (
    response?.data
      ?.filter((tag) => tag.attributes?.group === "genre")
      .map((tag) => ({
        id: tag.id,
        name: pickLocalizedText(tag.attributes?.name),
      }))
      .filter((tag) => tag.name)
      .sort((left, right) => left.name.localeCompare(right.name)) ?? []
  )
})

export const getMangadexMangaDetails = cache(
  async (id: string): Promise<MangadexMangaPreview | null> => {
    const params = new URLSearchParams()
    appendArray(params, "includes[]", ["cover_art", "author", "artist"])

    const response = await fetchMangadexJson<{ data?: MangadexMangaEntity }>(
      `/manga/${id}?${params.toString()}`
    )

    if (!response?.data) {
      return null
    }

    return mapPreview(response.data)
  }
)

export async function getMangadexChapters(
  mangaId: string,
  options: {
    limit?: number
    translatedLanguage?: string[]
  } = {}
) {
  const params = new URLSearchParams()
  params.set("limit", String(options.limit ?? 100))
  params.set("offset", "0")
  params.set("order[chapter]", "desc")
  params.set("order[volume]", "desc")

  if (options.translatedLanguage?.length) {
    appendArray(params, "translatedLanguage[]", options.translatedLanguage)
  }

  const response = await fetchMangadexJson<MangadexChapterListResponse>(
    `/manga/${mangaId}/feed?${params.toString()}`
  )

  return (
    response?.data
      ?.map(mapChapter)
      .filter((chapter): chapter is MangadexChapterInfo => Boolean(chapter)) ?? []
  )
}

export async function getMangadexMangaInfo(
  id: string
): Promise<MangadexMangaInfo | null> {
  const manga = await getMangadexMangaDetails(id)

  if (!manga) {
    return null
  }

  const chapters = await getMangadexChapters(id)

  return toMangadexInfo(manga, chapters)
}

export async function getMangadexChapterPages(
  chapterId: string
): Promise<MangaPage[]> {
  const response = await fetchMangadexJson<MangadexAtHomeResponse>(
    `/at-home/server/${chapterId}`,
    3600
  )

  const baseUrl = response?.baseUrl
  const hash = response?.chapter?.hash
  const files = response?.chapter?.dataSaver ?? response?.chapter?.data ?? []

  if (!baseUrl || !hash || !files.length) {
    return []
  }

  return files.map((fileName, index) => ({
    src: `${baseUrl}/data-saver/${hash}/${fileName}`,
    width: DEFAULT_PAGE_WIDTH,
    height: DEFAULT_PAGE_HEIGHT,
    pageNumber: index + 1,
    alt: `Manga page ${index + 1}`,
  }))
}

export function getMangaCardSummary(value: MangadexMangaPreview) {
  return summarizeSynopsis(value.synopsis)
}
