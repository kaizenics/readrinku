import "server-only"

import { cache } from "react"

import { deriveContentRating } from "@/lib/readrinku"
import type {
  SourceAdapter,
  SourceBrowseFilters,
  SourceBrowseResult,
} from "@/lib/data/sources/types"
import type { SourceDefinition } from "@/lib/data/sources/source-config"
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

export type ScrapedMangaDetails = {
  title: string
  synopsis: string
  coverImage: string | null
  authors: string[]
  artists: string[]
  genres: string[]
  status: MangaStatus
  altTitles?: string[]
  updatedAt?: string | null
}

export type SourceCatalogPage = {
  previews: SourceMangaPreview[]
  totalPages: number
}

export type SourceCatalog = {
  pageSize: number
  buildPageUrl: (input: { baseUrl: string; page: number; sort?: string }) => string
  buildGenreUrl?: (input: { baseUrl: string; page: number; genre: string }) => string
  parsePage: (input: {
    html: string
    baseUrl: string
    definition: SourceDefinition
  }) => SourceCatalogPage
}

type ComickSourceAdapterOptions = {
  definition: SourceDefinition
  chapterImagePatterns?: RegExp[]
  titleSuffixPattern?: RegExp
  buildMangaUrl?: (slug: string, baseUrl: string) => string
  catalog?: SourceCatalog
  parseDetails?: (input: {
    html: string
    slug: string
    definition: SourceDefinition
  }) => ScrapedMangaDetails
  parseChapters?: (input: {
    html: string
    slug: string
    baseUrl: string
    definition: SourceDefinition
  }) => SourceChapterInfo[]
  extractChapterImageUrls?: (input: { html: string; baseUrl: string }) => string[]
  buildSearchPreviewsFromResults?: boolean
}

function clampPage(value: number | undefined) {
  if (!value || !Number.isFinite(value) || value < 1) {
    return 1
  }

  return Math.floor(value)
}

function paginateItems<T>(items: T[], limit: number | undefined, page: number) {
  if (!limit || !Number.isFinite(limit) || limit < 1) {
    return items
  }

  const start = (page - 1) * limit
  return items.slice(start, start + limit)
}

export function htmlDecode(value: string) {
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

export function stripHtml(value: string) {
  return htmlDecode(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

export function toTitleCase(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function toSynopsis(value: string) {
  const text = stripHtml(value)

  if (!text) {
    return "Synopsis unavailable from the selected source."
  }

  return text
}

const RELATIVE_DATE_UNIT_SECONDS: Record<string, number> = {
  second: 1,
  minute: 60,
  hour: 3600,
  day: 86400,
  week: 604800,
  month: 2629800,
  year: 31557600,
}

export function parseRelativeDate(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase() ?? ""

  if (!normalized) {
    return null
  }

  if (normalized.includes("just now") || normalized === "now") {
    return new Date().toISOString()
  }

  const match = normalized.match(
    /(\d+)\s*(second|minute|hour|day|week|month|year)s?/
  )

  if (!match) {
    const parsed = Date.parse(normalized)
    return Number.isNaN(parsed) ? null : new Date(parsed).toISOString()
  }

  const amount = Number.parseInt(match[1], 10)
  const unitSeconds = RELATIVE_DATE_UNIT_SECONDS[match[2]] ?? 0

  if (!Number.isFinite(amount) || unitSeconds === 0) {
    return null
  }

  return new Date(Date.now() - amount * unitSeconds * 1000).toISOString()
}

export function cleanSourceTitle(value: string) {
  // Some sources append a view count after line breaks, e.g.
  // "Solo Leveling\n   \n   9131331". Keep only the real title line.
  const firstLine = value.split(/[\r\n]/)[0] ?? value

  return firstLine
    .replace(/\s+\d[\d,]*\s*$/, "")
    .replace(/\s+/g, " ")
    .trim()
}

export function normalizeTitleKey(value: string) {
  return cleanSourceTitle(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
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

export function mapStatus(value: string | undefined): MangaStatus {
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

export function normalizeUrl(value: string, baseUrl: string) {
  try {
    return new URL(value, baseUrl).toString()
  } catch {
    return null
  }
}

export function normalizeSourceImageUrl(value: string | null) {
  if (!value) {
    return null
  }

  try {
    const url = new URL(value)
    let pathname = url.pathname

    for (let index = 0; index < 3; index += 1) {
      try {
        const decoded = decodeURIComponent(pathname)

        if (decoded === pathname) {
          break
        }

        pathname = decoded
      } catch {
        break
      }
    }

    url.pathname = pathname
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/")

    return url.toString()
  } catch {
    return value
  }
}

export function extractSlugFromUrl(url: string) {
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

function extractLabeledSection(html: string, label: string) {
  const pattern = new RegExp(
    `<div[^>]*class=["'][^"']*summary-heading[^"']*["'][^>]*>\\s*${label}\\s*<\\/div>[\\s\\S]*?<div[^>]*class=["'][^"']*summary-content[^"']*["'][^>]*>([\\s\\S]*?)<\\/div>`,
    "i"
  )

  return html.match(pattern)?.[1] ?? ""
}

function extractStatValue(html: string, label: string) {
  const match = html.match(
    new RegExp(
      `<li[^>]*>\\s*${label}\\s*<\\/li>\\s*<li[^>]*>([\\s\\S]*?)<\\/li>`,
      "i"
    )
  )

  return match?.[1] ? stripHtml(match[1]) : ""
}

function extractGenresFromList(html: string) {
  const match = html.match(
    /<div[^>]*class=["'][^"']*genres-list[^"']*["'][^>]*>([\s\S]*?)<\/div>/i
  )

  if (!match?.[1]) {
    return []
  }

  return [...new Set(
    [...match[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
      .map((genreMatch) => stripHtml(genreMatch[1] ?? ""))
      .filter(Boolean)
  )]
}

function extractLinkedValues(sectionHtml: string) {
  const linkedMatches = [...sectionHtml.matchAll(/<a[^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match) => stripHtml(match[1] ?? ""))
    .filter(Boolean)

  if (linkedMatches.length > 0) {
    return [...new Set(linkedMatches)]
  }

  const textValue = stripHtml(sectionHtml)

  return textValue ? [textValue] : []
}

function extractMangaUrlsFromHtmlWithBuilder(
  html: string,
  baseUrl: string,
  buildMangaUrl: (slug: string, baseUrl: string) => string
) {
  const matches = html.match(/(?:https?:\/\/[^"'\s<]+)?\/manga\/[^"'\s<]+/gi) ?? []

  if (matches.length === 0) {
    return []
  }

  const seen = new Set<string>()
  const urls: string[] = []

  for (const match of matches) {
    const normalizedUrl = normalizeUrl(match, baseUrl)
    const slug = normalizedUrl ? extractSlugFromUrl(normalizedUrl) : null

    if (!normalizedUrl || !slug || normalizedUrl.includes("/chapter-")) {
      continue
    }

    const canonicalUrl = buildMangaUrl(slug, baseUrl)

    if (seen.has(canonicalUrl)) {
      continue
    }

    seen.add(canonicalUrl)
    urls.push(canonicalUrl)
  }

  return urls
}

function extractAttributeUrls(html: string, baseUrl: string) {
  return [...new Set(
    [...html.matchAll(/(?:src|data-src|href)=["']([^"']+)["']/gi)]
      .map((match) => normalizeUrl(htmlDecode(match[1] ?? ""), baseUrl))
      .filter((value): value is string => Boolean(value))
  )]
}

function extractImageUrlsFromChapterHtml(
  html: string,
  baseUrl: string,
  patterns: RegExp[]
) {
  const matches = extractAttributeUrls(html, baseUrl).filter((url) =>
    patterns.some((pattern) => pattern.test(url))
  )

  return [...new Set(matches)].sort((left, right) =>
    left.localeCompare(right, undefined, { numeric: true })
  )
}

function extractCoverImage(html: string, baseUrl: string) {
  const metaImage =
    getMetaContent(html, "og:image") ??
    getMetaContent(html, "image") ??
    getMetaContent(html, "twitter:image")

  if (metaImage) {
    return normalizeSourceImageUrl(normalizeUrl(metaImage, baseUrl))
  }

  const fallbackImage = extractAttributeUrls(html, baseUrl).find((value) =>
    /\.(?:jpg|jpeg|png|webp)$/i.test(value)
  )

  return normalizeSourceImageUrl(fallbackImage ?? null)
}

function extractSynopsisFromHtml(html: string) {
  const summarySection =
    extractLabeledSection(html, "Summary") ||
    extractLabeledSection(html, "Description")

  if (summarySection) {
    return summarySection
  }

  const textBlockMatch = html.match(
    /<div[^>]*class=["'][^"']*white-font[^"']*["'][^>]*>([\s\S]*?)<\/div>/i
  )

  if (textBlockMatch?.[1]) {
    return textBlockMatch[1]
  }

  return getMetaContent(html, "description") ?? ""
}

function extractMangaDetailsFromHtml(
  html: string,
  slug: string,
  definition: SourceDefinition,
  titleSuffixPattern?: RegExp
): ScrapedMangaDetails {
  const rawTitle =
    getMetaContent(html, "og:title") ||
    extractBetween(html, /<title>([\s\S]*?)<\/title>/i) ||
    toTitleCase(slug)

  const title = titleSuffixPattern
    ? rawTitle.replace(titleSuffixPattern, "").trim()
    : rawTitle.trim()

  const authorSectionValues = extractLinkedValues(extractLabeledSection(html, "Author"))
  const artistSectionValues = extractLinkedValues(extractLabeledSection(html, "Artist"))
  const genreSectionValues = extractLinkedValues(extractLabeledSection(html, "Genres"))

  const authors = [
    ...new Set(
      [...authorSectionValues, extractStatValue(html, "Author")].filter(Boolean)
    ),
  ]
  const artists = [
    ...new Set(
      [...artistSectionValues, extractStatValue(html, "Artist")].filter(Boolean)
    ),
  ]
  const genres = [
    ...new Set([...genreSectionValues, ...extractGenresFromList(html)].filter(Boolean)),
  ]
  const statusText =
    stripHtml(extractLabeledSection(html, "Status")) ||
    extractStatValue(html, "Status") ||
    "Ongoing"

  return {
    title,
    synopsis: toSynopsis(extractSynopsisFromHtml(html)),
    coverImage: extractCoverImage(html, definition.baseUrl),
    authors: authors.length ? authors : artists.length ? artists : ["Unknown author"],
    artists,
    genres: genres.length ? genres : [definition.label],
    status: mapStatus(statusText),
    altTitles: [],
  }
}

// Catalog/search listings only expose the latest chapter, so synthesize the
// most recent few (latest, latest-1, latest-2) for preview cards. The id is the
// chapter number, which is exactly what the reader resolves a chapter by, so the
// card rows link straight to the reader. The detail page still shows the real
// full chapter list.
export function buildRecentChapters({
  slug,
  latestLabel,
  latestNumber,
  sourceUrl,
}: {
  slug: string
  latestLabel: string
  latestNumber: number | null
  sourceUrl: string
}): SourceChapterInfo[] {
  if (!latestLabel) {
    return []
  }

  const makeChapter = (label: string): SourceChapterInfo => ({
    id: label,
    mangaId: slug,
    title: `Chapter ${label}`,
    chapter: label,
    releaseDate: null,
    pageCount: 0,
    readable: true,
    translatedLanguage: "en",
    url: sourceUrl,
  })

  const hasNumber = latestNumber !== null && Number.isFinite(latestNumber)
  const chapters = [makeChapter(hasNumber ? String(latestNumber) : latestLabel)]

  if (hasNumber) {
    for (
      let value = Math.floor(latestNumber as number) - 1;
      value >= 1 && chapters.length < 3;
      value -= 1
    ) {
      chapters.push(makeChapter(String(value)))
    }
  }

  return chapters.slice(0, 3)
}

function buildSearchPreview(
  result: SourceSearchResult
): SourceMangaPreview | null {
  const url = result.url?.trim()

  if (!url) {
    return null
  }

  const slug = extractSlugFromUrl(url)

  if (!slug) {
    return null
  }

  const latestNumber =
    typeof result.latestChapter === "number"
      ? result.latestChapter
      : Number.parseFloat(String(result.latestChapter ?? ""))
  const hasLatest = Number.isFinite(latestNumber) && latestNumber > 0
  const latestLabel = hasLatest ? String(result.latestChapter).trim() : ""

  return {
    id: slug,
    title: cleanSourceTitle(result.title ?? "") || toTitleCase(slug.replace(/^\d+-/, "")),
    altTitles: [],
    synopsis: "Synopsis unavailable from the selected source.",
    image: normalizeSourceImageUrl(result.coverImage ?? null),
    authors: [],
    artists: [],
    // Search results carry no genres; left empty so browseSourceManga back-fills
    // them (from the detail page / MyAnimeList) and adult titles get gated.
    genres: [],
    status: "ongoing",
    contentRating: "everyone",
    readingDirection: "ltr",
    updatedAt: parseRelativeDate(result.lastUpdated) ?? new Date(0).toISOString(),
    chapterCount: hasLatest ? Math.max(1, Math.round(latestNumber)) : 0,
    lastChapterLabel: latestLabel ? `Ch. ${latestLabel}` : "Chapter unavailable",
    recentChapters: buildRecentChapters({
      slug,
      latestLabel,
      latestNumber: hasLatest ? latestNumber : null,
      sourceUrl: url,
    }),
    sourceUrl: url,
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

export function sortChaptersDescending(chapters: SourceChapterInfo[]) {
  return [...chapters].sort((left, right) => {
    const leftNumber = Number.parseFloat(left.chapter ?? "")
    const rightNumber = Number.parseFloat(right.chapter ?? "")

    if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) {
      return rightNumber - leftNumber
    }

    return (right.releaseDate ?? "").localeCompare(left.releaseDate ?? "")
  })
}

export function sortSourceMangaPreviews(
  items: SourceMangaPreview[],
  sort: string | undefined
) {
  const nextItems = [...items]

  switch (sort) {
    case "title":
      return nextItems.sort((left, right) => left.title.localeCompare(right.title))
    // Search results carry no popularity signal, so approximate "popular" with
    // chapter count (a longer run usually means a more-followed series). The
    // catalog browse path gets the real /popular ordering from upstream instead.
    case "chapters":
    case "popular":
      return nextItems.sort((left, right) => right.chapterCount - left.chapterCount)
    // "new"/"added"/"newest" and the default all fall back to recency here.
    default:
      return nextItems.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
  }
}

function toPreview(info: SourceMangaInfo, definition: SourceDefinition): SourceMangaPreview {
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
    genres: info.genres ?? [definition.label],
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

export function createComickSourceAdapter(
  options: ComickSourceAdapterOptions
): SourceAdapter {
  const {
    definition,
    chapterImagePatterns,
    titleSuffixPattern,
    catalog,
    parseDetails,
    parseChapters,
    extractChapterImageUrls,
    buildSearchPreviewsFromResults,
    buildMangaUrl = (slug, baseUrl) =>
      new URL(`/manga/${slug}/`, baseUrl).toString(),
  } = options

  async function getSourceChaptersByUrl(url: string) {
    const response = await postJson<SourceChaptersResponse>("/api/chapters", {
      url,
      source: definition.id,
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

      // When the source can parse its chapter list straight from the detail
      // HTML (which we fetch anyway), skip the chapters API — it is the more
      // reliable, complete source and also carries release dates.
      const [html, apiChapters] = await Promise.all([
        fetchHtml(url),
        parseChapters ? Promise.resolve(null) : getSourceChaptersByUrl(url),
      ])

      if (!html) {
        return null
      }

      let chapters: SourceChapterInfo[]
      let totalChapters: number

      if (parseChapters) {
        chapters = sortChaptersDescending(
          parseChapters({ html, slug, baseUrl: definition.baseUrl, definition })
        )
        totalChapters = chapters.length

        if (!chapters.length) {
          const fallback = await getSourceChaptersByUrl(url)
          chapters = fallback.chapters
          totalChapters = fallback.totalChapters
        }
      } else {
        chapters = apiChapters?.chapters ?? []
        totalChapters = apiChapters?.totalChapters ?? chapters.length
      }

      // Stamp each chapter with its origin so merged lists can route the reader
      // to the right source for page extraction.
      chapters = chapters.map((chapter) => ({
        ...chapter,
        sourceId: definition.id,
        sourceName: definition.name,
      }))

      const details = parseDetails
        ? parseDetails({ html, slug, definition })
        : extractMangaDetailsFromHtml(html, slug, definition, titleSuffixPattern)
      const latestChapterDate = chapters.find(
        (chapter) => chapter.releaseDate
      )?.releaseDate

      return {
        id: slug,
        title: details.title,
        altTitles: details.altTitles ?? [],
        genres: details.genres,
        image: details.coverImage,
        synopsis: details.synopsis,
        authors: details.authors,
        artists: details.artists,
        status: details.status,
        contentRating: deriveContentRating(details.genres),
        readingDirection: "ltr",
        updatedAt:
          latestChapterDate ?? details.updatedAt ?? new Date(0).toISOString(),
        chapterCount: totalChapters,
        chapters,
        url,
        sourceId: definition.id,
        sourceName: definition.name,
      }
    }
  )

  function assignCatalogDates(
    previews: SourceMangaPreview[],
    catalogPage: number,
    pageSize: number
  ) {
    const base = Date.now()

    return previews.map((preview, index) => {
      if (preview.updatedAt) {
        return preview
      }

      const globalIndex = (catalogPage - 1) * pageSize + index

      return {
        ...preview,
        updatedAt: new Date(base - globalIndex * 60_000).toISOString(),
      }
    })
  }

  const fetchCatalogPage = cache(
    async (catalogPage: number, sort?: string, genre?: string) => {
    if (!catalog) {
      return { previews: [] as SourceMangaPreview[], totalPages: catalogPage }
    }

    const url =
      genre && catalog.buildGenreUrl
        ? catalog.buildGenreUrl({
            baseUrl: definition.baseUrl,
            page: catalogPage,
            genre,
          })
        : catalog.buildPageUrl({
            baseUrl: definition.baseUrl,
            page: catalogPage,
            sort,
          })
    const html = await fetchHtml(url)

    if (!html) {
      return { previews: [] as SourceMangaPreview[], totalPages: catalogPage }
    }

    const result = catalog.parsePage({
      html,
      baseUrl: definition.baseUrl,
      definition,
    })

    return {
      previews: assignCatalogDates(result.previews, catalogPage, catalog.pageSize),
      totalPages: Math.max(result.totalPages, catalogPage),
    }
  })

  async function browseCatalog(
    filters: SourceBrowseFilters
  ): Promise<SourceBrowseResult> {
    if (!catalog) {
      return { items: [], total: 0 }
    }

    const { pageSize } = catalog
    const limit = filters.limit && filters.limit > 0 ? filters.limit : pageSize
    const page = clampPage(filters.page)
    const start = (page - 1) * limit
    const end = start + limit
    const firstCatalogPage = Math.floor(start / pageSize) + 1
    const lastCatalogPage = Math.max(
      firstCatalogPage,
      Math.floor((end - 1) / pageSize) + 1
    )

    const catalogPageNumbers: number[] = []
    for (let current = firstCatalogPage; current <= lastCatalogPage; current += 1) {
      catalogPageNumbers.push(current)
    }

    const pages = await Promise.all(
      catalogPageNumbers.map((current) =>
        fetchCatalogPage(current, filters.sort, filters.genre)
      )
    )
    const totalPages = pages[0]?.totalPages ?? firstCatalogPage
    const offset = (firstCatalogPage - 1) * pageSize
    const flat = pages.flatMap((result) => result.previews)
    const items = flat.slice(start - offset, start - offset + limit)

    return {
      items,
      total: Math.max(totalPages * pageSize, offset + flat.length),
    }
  }

  const getHomepageManga = cache(async (limit?: number) => {
    if (catalog) {
      const result = await browseCatalog({
        sort: "updated",
        page: 1,
        limit:
          typeof limit === "number" && Number.isFinite(limit)
            ? limit
            : catalog.pageSize,
      })

      return result.items
    }

    const html = await fetchHtml(definition.baseUrl)

    if (!html) {
      return []
    }

    const urls = extractMangaUrlsFromHtmlWithBuilder(
      html,
      definition.baseUrl,
      buildMangaUrl
    )
    const scopedUrls =
      typeof limit === "number" && Number.isFinite(limit)
        ? urls.slice(0, limit)
        : urls
    const items = await Promise.all(scopedUrls.map((url) => getSourceMangaInfoByUrl(url)))

    return items
      .filter((item): item is SourceMangaInfo => Boolean(item))
      .map((item) => toPreview(item, definition))
  })

  async function browseSearch(
    filters: SourceBrowseFilters
  ): Promise<SourceBrowseResult> {
    const response = await postJson<SourceSearchResponse>("/api/search", {
      query: (filters.q ?? "").trim(),
      source: definition.id,
    })

    if (buildSearchPreviewsFromResults) {
      const seen = new Set<string>()
      const previews: SourceMangaPreview[] = []

      for (const result of response?.results ?? []) {
        const preview = buildSearchPreview(result)

        if (preview && !seen.has(preview.id)) {
          seen.add(preview.id)
          previews.push(preview)
        }
      }

      const sorted = sortSourceMangaPreviews(previews, filters.sort)

      return {
        items: paginateItems(sorted, filters.limit, clampPage(filters.page)),
        total: sorted.length,
      }
    }

    const urls = [
      ...new Set(
        response?.results
          ?.map((result) => result.url?.trim())
          .filter((value): value is string => Boolean(value)) ?? []
      ),
    ]
    const pagedUrls = paginateItems(urls, filters.limit, clampPage(filters.page))

    const items = await Promise.all(pagedUrls.map((url) => getSourceMangaInfoByUrl(url)))
    const previews = items
      .filter((item): item is SourceMangaInfo => Boolean(item))
      .map((item) => toPreview(item, definition))

    return {
      items: sortSourceMangaPreviews(previews, filters.sort),
      total: response?.results?.length ?? urls.length,
    }
  }

  async function browse(
    filters: SourceBrowseFilters = {}
  ): Promise<SourceBrowseResult> {
    if (filters.q?.trim()) {
      return browseSearch(filters)
    }

    if (catalog) {
      return browseCatalog(filters)
    }

    const homepageItems = await getHomepageManga()
    const sortedItems = sortSourceMangaPreviews(homepageItems, filters.sort)

    return {
      items: paginateItems(sortedItems, filters.limit, clampPage(filters.page)),
      total: sortedItems.length,
    }
  }

  async function getMangaInfoBySlug(slug: string) {
    return getSourceMangaInfoByUrl(buildMangaUrl(slug, definition.baseUrl))
  }

  async function getChapterPages(chapterUrl: string): Promise<MangaPage[]> {
    const html = await fetchHtml(chapterUrl, 3600)

    if (!html) {
      return []
    }

    const urls = extractChapterImageUrls
      ? extractChapterImageUrls({ html, baseUrl: definition.baseUrl })
      : extractImageUrlsFromChapterHtml(
          html,
          definition.baseUrl,
          chapterImagePatterns ?? []
        )

    return urls.map((src, index) => ({
      src,
      width: DEFAULT_PAGE_WIDTH,
      height: DEFAULT_PAGE_HEIGHT,
      pageNumber: index + 1,
      alt: `Manga page ${index + 1}`,
    }))
  }

  return {
    definition,
    getHomepageManga,
    browse,
    getMangaInfoBySlug: cache(getMangaInfoBySlug),
    getChapterPages,
    catalog: catalog ? { pageSize: catalog.pageSize } : undefined,
  }
}
