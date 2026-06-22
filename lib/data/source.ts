import "server-only"

import { cache } from "react"

import type {
  MangaPage,
  MangaStatus,
  SourceChapterInfo,
  SourceMangaInfo,
  SourceMangaPreview,
} from "@/lib/types/readrinku"

const COMICK_SOURCE_API_BASE_URL =
  process.env.COMICK_SOURCE_API_BASE_URL ??
  "https://comick-source-api.notaspider.dev"

const PRIMARY_SOURCE_ID = "arya-scans"
const PRIMARY_SOURCE_NAME = "arya scans"
const PRIMARY_SOURCE_LABEL = "Arya Scans"
const PRIMARY_SOURCE_BASE_URL = "https://brainrotcomics.com"
const DEFAULT_REVALIDATE_SECONDS = 900
const DEFAULT_PAGE_WIDTH = 1200
const DEFAULT_PAGE_HEIGHT = 1800

type SourceSearchResult = {
  id?: string
  title?: string
  url?: string
  coverImage?: string | null
  latestChapter?: number | string | null
  lastUpdated?: string | null
  lastUpdatedTimestamp?: number | null
  rating?: number | null
}

type SourceSearchResponse = {
  results?: SourceSearchResult[]
  source?: string
}

type SourceChapterResponse = {
  id?: string
  number?: number | string | null
  title?: string | null
  url?: string
  lastUpdated?: string | null
}

type SourceChaptersResponse = {
  chapters?: SourceChapterResponse[]
  source?: string
  totalChapters?: number
}

type ScrapedMangaDetails = {
  title: string
  synopsis: string
  coverImage: string | null
  authors: string[]
  genres: string[]
  status: MangaStatus
}

export interface SourceBrowseFilters {
  q?: string
  sort?: string
  limit?: number
}

export interface SourceBrowseResult {
  items: SourceMangaPreview[]
  total: number
}

function htmlDecode(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCharCode(Number.parseInt(code, 16))
    )
    .replace(/&#(\d+);/g, (_, code) =>
      String.fromCharCode(Number.parseInt(code, 10))
    )
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, "-")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
}

function stripHtml(value: string) {
  return htmlDecode(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

function toTitleCase(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function toSynopsis(value: string) {
  const text = stripHtml(value)

  if (!text) {
    return "Synopsis unavailable from the selected source."
  }

  return text
}

function summarizeSynopsis(value: string, maxLength = 170) {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength - 3).trimEnd()}...`
}

function parseIsoDate(value: string | null | undefined) {
  if (!value?.trim()) {
    return null
  }

  const parsed = Date.parse(value)

  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toISOString()
  }

  return null
}

function mapStatus(value: string | undefined): MangaStatus {
  const normalized = value?.trim().toLowerCase() ?? ""

  if (normalized.includes("complete")) {
    return "completed"
  }

  if (normalized.includes("hiatus") || normalized.includes("cancel")) {
    return "hiatus"
  }

  return "ongoing"
}

function getMetaContent(html: string, key: string) {
  const directMatch = html.match(
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`,
      "i"
    )
  )

  if (directMatch?.[1]) {
    return htmlDecode(directMatch[1]).trim()
  }

  const reverseMatch = html.match(
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`,
      "i"
    )
  )

  return reverseMatch?.[1] ? htmlDecode(reverseMatch[1]).trim() : null
}

function extractBetween(html: string, pattern: RegExp) {
  const match = html.match(pattern)
  return match?.[1] ? stripHtml(match[1]) : ""
}

function extractSlugFromUrl(url: string) {
  try {
    const { pathname } = new URL(url)
    const segments = pathname.split("/").filter(Boolean)
    const mangaIndex = segments.indexOf("manga")

    if (mangaIndex === -1 || !segments[mangaIndex + 1]) {
      return null
    }

    return segments[mangaIndex + 1]
  } catch {
    return null
  }
}

function extractMangaUrlsFromHtml(html: string) {
  const matches = html.match(
    /https:\/\/brainrotcomics\.com\/manga\/[^"'\\\s<]+\/?/g
  )

  if (!matches?.length) {
    return []
  }

  const seen = new Set<string>()
  const urls: string[] = []

  for (const match of matches) {
    if (match.includes("/chapter-")) {
      continue
    }

    const normalized = match.endsWith("/") ? match : `${match}/`

    if (seen.has(normalized)) {
      continue
    }

    seen.add(normalized)
    urls.push(normalized)
  }

  return urls
}

function extractImageUrlsFromChapterHtml(html: string) {
  const matches = html.match(
    /https:\/\/brainrotcomics\.com\/wp-content\/uploads\/WP-manga\/data\/[^"'\\\s>]+\.(?:jpg|jpeg|png|webp)/gi
  )

  if (!matches?.length) {
    return []
  }

  return [...new Set(matches)].sort((left, right) =>
    left.localeCompare(right, undefined, { numeric: true })
  )
}

function extractCoverImage(html: string) {
  const ogImage = getMetaContent(html, "og:image")

  if (ogImage) {
    return ogImage
  }

  const matches = html.match(
    /https:\/\/brainrotcomics\.com\/wp-content\/uploads\/[^"'\\\s>]+\.(?:jpg|jpeg|png|webp)/gi
  )

  if (!matches?.length) {
    return null
  }

  return (
    matches.find(
      (value) =>
        !value.includes("single-logo") &&
        !value.includes("cropped-single-logo") &&
        !value.includes("website_logo")
    ) ?? null
  )
}

function extractLabeledSection(html: string, label: string) {
  const pattern = new RegExp(
    `<div[^>]*class=["'][^"']*summary-heading[^"']*["'][^>]*>\\s*${label}\\s*<\\/div>[\\s\\S]*?<div[^>]*class=["'][^"']*summary-content[^"']*["'][^>]*>([\\s\\S]*?)<\\/div>`,
    "i"
  )

  return html.match(pattern)?.[1] ?? ""
}

function extractLinkedValues(sectionHtml: string) {
  const matches = [...sectionHtml.matchAll(/<a[^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match) => stripHtml(match[1] ?? ""))
    .filter(Boolean)

  return [...new Set(matches)]
}

function extractMangaDetailsFromHtml(
  html: string,
  slug: string
): ScrapedMangaDetails {
  const title =
    getMetaContent(html, "og:title")?.replace(/\s+[–-]\s+BrainRotComics$/i, "") ||
    extractBetween(html, /<title>([\s\S]*?)<\/title>/i).replace(
      /\s+[–-]\s+BrainRotComics$/i,
      ""
    ) ||
    toTitleCase(slug)

  const synopsis =
    toSynopsis(
      extractLabeledSection(html, "Summary") ||
        extractLabeledSection(html, "Description") ||
        getMetaContent(html, "description") ||
        ""
    )

  const authors = extractLinkedValues(extractLabeledSection(html, "Author"))
  const artists = extractLinkedValues(extractLabeledSection(html, "Artist"))
  const genres = extractLinkedValues(extractLabeledSection(html, "Genres"))
  const statusText =
    stripHtml(extractLabeledSection(html, "Status")) || "Ongoing"

  return {
    title,
    synopsis,
    coverImage: extractCoverImage(html),
    authors: authors.length ? authors : artists.length ? artists : ["Unknown author"],
    genres: genres.length ? genres : [PRIMARY_SOURCE_LABEL],
    status: mapStatus(statusText),
  }
}

async function fetchJson<T>(
  path: string,
  init?: RequestInit,
  revalidate = DEFAULT_REVALIDATE_SECONDS
): Promise<T | null> {
  const response = await fetch(`${COMICK_SOURCE_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
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

async function postJson<T>(
  path: string,
  body: Record<string, string | number | undefined>,
  revalidate = DEFAULT_REVALIDATE_SECONDS
) {
  return fetchJson<T>(
    path,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
    revalidate
  )
}

async function fetchHtml(url: string, revalidate = DEFAULT_REVALIDATE_SECONDS) {
  const response = await fetch(url, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
    },
    next: {
      revalidate,
    },
  }).catch(() => null)

  if (!response?.ok) {
    return null
  }

  return response.text().catch(() => null)
}

function mapChapter(
  chapter: SourceChapterResponse,
  mangaId: string
): SourceChapterInfo | null {
  if (!chapter.id || !chapter.url) {
    return null
  }

  const numericValue =
    typeof chapter.number === "number"
      ? chapter.number
      : Number.parseFloat(String(chapter.number ?? ""))

  return {
    id: chapter.id,
    mangaId,
    title: chapter.title?.trim() || `Chapter ${chapter.id}`,
    chapter:
      Number.isFinite(numericValue) || chapter.id
        ? String(chapter.number ?? chapter.id)
        : null,
    releaseDate: parseIsoDate(chapter.lastUpdated) ?? null,
    pageCount: 0,
    readable: true,
    translatedLanguage: "en",
    url: chapter.url,
  }
}

function sortChaptersDescending(chapters: SourceChapterInfo[]) {
  return [...chapters].sort((left, right) => {
    const leftNumber = Number.parseFloat(left.chapter ?? "")
    const rightNumber = Number.parseFloat(right.chapter ?? "")

    if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) {
      return rightNumber - leftNumber
    }

    return (right.releaseDate ?? "").localeCompare(left.releaseDate ?? "")
  })
}

function toPreview(info: SourceMangaInfo): SourceMangaPreview {
  const recentChapters = sortChaptersDescending(info.chapters).slice(0, 3)
  const latestChapter = recentChapters[0]?.chapter

  return {
    id: info.id,
    title: info.title,
    altTitles: info.altTitles ?? [],
    synopsis: info.synopsis,
    image: info.image,
    authors: info.authors,
    artists: info.artists,
    genres: info.genres ?? [PRIMARY_SOURCE_LABEL],
    status: info.status,
    contentRating: info.contentRating,
    readingDirection: info.readingDirection,
    updatedAt: info.updatedAt,
    chapterCount: info.chapterCount,
    lastChapterLabel: latestChapter ? `Ch. ${latestChapter}` : "Chapter unavailable",
    recentChapters,
    sourceUrl: info.url,
  }
}

function sortPreviews(items: SourceMangaPreview[], sort: string | undefined) {
  const nextItems = [...items]

  switch (sort) {
    case "title":
      return nextItems.sort((left, right) => left.title.localeCompare(right.title))
    case "chapters":
      return nextItems.sort((left, right) => right.chapterCount - left.chapterCount)
    default:
      return nextItems.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
  }
}

async function getSourceChaptersByUrl(url: string) {
  const response = await postJson<SourceChaptersResponse>("/api/chapters", {
    url,
    source: PRIMARY_SOURCE_NAME,
  })

  const slug = extractSlugFromUrl(url) ?? ""
  const chapters =
    response?.chapters
      ?.map((chapter) => mapChapter(chapter, slug))
      .filter((chapter): chapter is SourceChapterInfo => Boolean(chapter)) ?? []

  return {
    chapters: sortChaptersDescending(chapters),
    totalChapters: response?.totalChapters ?? chapters.length,
  }
}

const getSourceMangaInfoByUrl = cache(
  async (url: string): Promise<SourceMangaInfo | null> => {
    const slug = extractSlugFromUrl(url)

    if (!slug) {
      return null
    }

    const [html, chapterResult] = await Promise.all([
      fetchHtml(url),
      getSourceChaptersByUrl(url),
    ])

    if (!html) {
      return null
    }

    const details = extractMangaDetailsFromHtml(html, slug)
    const latestChapterDate = chapterResult.chapters.find(
      (chapter) => chapter.releaseDate
    )?.releaseDate

    return {
      id: slug,
      title: details.title,
      altTitles: [],
      genres: details.genres,
      image: details.coverImage,
      synopsis: details.synopsis,
      authors: details.authors,
      artists: [],
      status: details.status,
      contentRating: "everyone",
      readingDirection: "ltr",
      updatedAt: latestChapterDate ?? new Date(0).toISOString(),
      chapterCount: chapterResult.totalChapters,
      chapters: chapterResult.chapters,
      url,
      sourceId: PRIMARY_SOURCE_ID,
      sourceName: PRIMARY_SOURCE_LABEL,
    }
  }
)

export const getSourceHomepageManga = cache(async (limit = 18) => {
  const html = await fetchHtml(PRIMARY_SOURCE_BASE_URL)

  if (!html) {
    return []
  }

  const urls = extractMangaUrlsFromHtml(html).slice(0, limit)
  const items = await Promise.all(urls.map((url) => getSourceMangaInfoByUrl(url)))

  return items.filter((item): item is SourceMangaInfo => Boolean(item)).map(toPreview)
})

export async function browseSourceManga(
  filters: SourceBrowseFilters = {}
): Promise<SourceBrowseResult> {
  const limit = filters.limit ?? 12

  if (!filters.q?.trim()) {
    const homepageItems = await getSourceHomepageManga(limit)

    return {
      items: sortPreviews(homepageItems.slice(0, limit), filters.sort),
      total: homepageItems.length,
    }
  }

  const response = await postJson<SourceSearchResponse>("/api/search", {
    query: filters.q.trim(),
    source: PRIMARY_SOURCE_NAME,
  })

  const urls = [
    ...new Set(
      response?.results
        ?.map((result) => result.url?.trim())
        .filter((value): value is string => Boolean(value)) ?? []
    ),
  ].slice(0, limit)

  const items = await Promise.all(urls.map((url) => getSourceMangaInfoByUrl(url)))
  const previews = items.filter((item): item is SourceMangaInfo => Boolean(item)).map(toPreview)

  return {
    items: sortPreviews(previews, filters.sort),
    total: response?.results?.length ?? previews.length,
  }
}

export const getFeaturedSourceManga = cache(async (limit = 10) => {
  const items = await getSourceHomepageManga(Math.max(limit, 10))
  return items.slice(0, limit)
})

export const getRecentSourceManga = cache(async (limit = 6) => {
  const items = await getSourceHomepageManga(Math.max(limit, 12))
  return items.slice(0, limit)
})

export const getSpotlightSourceManga = cache(async (limit = 6) => {
  const items = await getSourceHomepageManga(Math.max(limit + 6, 12))
  return items.slice(6, 6 + limit)
})

export const getArchiveSourceManga = cache(async (limit = 6) => {
  const items = await getSourceHomepageManga(Math.max(limit + 12, 18))
  return items.slice(12, 12 + limit)
})

export const getSourceMangaInfo = cache(async (slug: string) => {
  return getSourceMangaInfoByUrl(`${PRIMARY_SOURCE_BASE_URL}/manga/${slug}/`)
})

export async function getSourceChapterPages(chapterUrl: string): Promise<MangaPage[]> {
  const html = await fetchHtml(chapterUrl, 3600)

  if (!html) {
    return []
  }

  return extractImageUrlsFromChapterHtml(html).map((src, index) => ({
    src,
    width: DEFAULT_PAGE_WIDTH,
    height: DEFAULT_PAGE_HEIGHT,
    pageNumber: index + 1,
    alt: `Manga page ${index + 1}`,
  }))
}

export function getMangaCardSummary(value: SourceMangaPreview) {
  return summarizeSynopsis(value.synopsis)
}

export function getPrimarySourceLabel() {
  return PRIMARY_SOURCE_LABEL
}
