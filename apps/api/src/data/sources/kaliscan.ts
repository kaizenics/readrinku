
import {
  buildRecentChapters,
  createComickSourceAdapter,
  extractSlugFromUrl,
  htmlDecode,
  mapStatus,
  normalizeSourceImageUrl,
  normalizeUrl,
  parseRelativeDate,
  stripHtml,
  toSynopsis,
  toTitleCase,
  type ScrapedMangaDetails,
  type SourceCatalog,
  type SourceCatalogPage,
} from "./create-comick-source-adapter"
import {
  getSourceDefinition,
  type SourceDefinition,
} from "./source-config"
import { deriveContentRating } from "../_content"
import type {
  SourceChapterInfo,
  SourceMangaPreview,
} from "@rinku/core"

const sourceDefinition = getSourceDefinition("kaliscan")

// KaliScan renders its homepage/manga-list with client-side JavaScript, but the
// `/latest`, `/popular`, `/newest`, and `/az-list` listings are server-rendered
// with ~48 fully-detailed cards per page across ~1585 pages. We page through
// those listings to expose the entire catalog.
const CATALOG_PAGE_SIZE = 48

function getMetaContent(html: string, key: string) {
  const match = html.match(
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`,
      "i"
    )
  )

  return match?.[1] ? htmlDecode(match[1]).trim() : null
}

function parseMaxCatalogPage(html: string) {
  const pages = [...html.matchAll(/[?&]page=(\d+)/g)].map((match) =>
    Number.parseInt(match[1] ?? "", 10)
  )
  const max = pages.length ? Math.max(...pages) : 1

  return Number.isFinite(max) && max > 0 ? max : 1
}

function parseLatestChapter(text: string) {
  const label = stripHtml(text).replace(/^chapter\s*/i, "").trim()
  const value = Number.parseFloat(label)
  const hasValue = Boolean(label) && Number.isFinite(value) && value > 0

  return {
    label,
    number: hasValue ? value : null,
    chapterCount: hasValue ? Math.max(1, Math.round(value)) : 0,
    lastChapterLabel: label ? `Ch. ${label}` : "Chapter unavailable",
  }
}

function parseCatalogCard(
  block: string,
  baseUrl: string
): SourceMangaPreview | null {
  const urlMatch = block.match(/href="(\/manga\/\d+[^"]*)"/i)

  if (!urlMatch) {
    return null
  }

  const sourceUrl = normalizeUrl(htmlDecode(urlMatch[1]), baseUrl)
  const slug = sourceUrl ? extractSlugFromUrl(sourceUrl) : null

  if (!sourceUrl || !slug) {
    return null
  }

  const titleMatch =
    block.match(/<a[^>]*\btitle="([^"]+)"[^>]*href="\/manga\/\d+/i) ??
    block.match(/<h3[^>]*>\s*<a[^>]*>([\s\S]*?)<\/a>/i)
  const title = titleMatch
    ? stripHtml(htmlDecode(titleMatch[1] ?? ""))
    : toTitleCase(slug.replace(/^\d+-/, ""))

  const coverMatch =
    block.match(/data-src="([^"]+)"/i) ??
    block.match(/<img[^>]+src="(https?:[^"]+)"/i)
  const image = coverMatch
    ? normalizeSourceImageUrl(normalizeUrl(htmlDecode(coverMatch[1] ?? ""), baseUrl))
    : null

  const latestMatch =
    block.match(/class="latest-chapter"[^>]*>([^<]+)</i) ??
    block.match(/class="latest-chapter"[^>]*\btitle="([^"]+)"/i)
  const latest = parseLatestChapter(latestMatch?.[1] ?? "")

  const genresMatch = block.match(/<div class="genres">([\s\S]*?)<\/div>/i)
  const genres = genresMatch
    ? [
        ...new Set(
          [...genresMatch[1].matchAll(/<span[^>]*>([^<]+)<\/span>/gi)]
            .map((match) => stripHtml(match[1] ?? ""))
            .filter(Boolean)
        ),
      ]
    : []

  const summaryMatch = block.match(/<div class="summary">\s*<p[^>]*>([\s\S]*?)<\/p>/i)
  const synopsis = summaryMatch
    ? toSynopsis(summaryMatch[1])
    : "Synopsis unavailable from the selected source."

  return {
    id: slug,
    title,
    altTitles: [],
    synopsis,
    image,
    authors: [],
    artists: [],
    // Left empty when KaliScan's listing omits genres (common for brand-new
    // uploads); browseSourceManga back-fills these from the detail page so adult
    // titles are still caught.
    genres,
    status: "ongoing",
    contentRating: deriveContentRating(genres),
    readingDirection: "ltr",
    // Left blank so the adapter can stamp listing order as recency.
    updatedAt: "",
    chapterCount: latest.chapterCount,
    lastChapterLabel: latest.lastChapterLabel,
    recentChapters: buildRecentChapters({
      slug,
      latestLabel: latest.label,
      latestNumber: latest.number,
      sourceUrl,
    }),
    sourceUrl,
  }
}

function parseCatalogPage({
  html,
  baseUrl,
}: {
  html: string
  baseUrl: string
}): SourceCatalogPage {
  const blocks = html.split('<div class="book-item">').slice(1)
  const seen = new Set<string>()
  const previews: SourceMangaPreview[] = []

  for (const block of blocks) {
    const preview = parseCatalogCard(block, baseUrl)

    if (preview && !seen.has(preview.id)) {
      seen.add(preview.id)
      previews.push(preview)
    }
  }

  return {
    previews,
    totalPages: parseMaxCatalogPage(html),
  }
}

const catalog: SourceCatalog = {
  pageSize: CATALOG_PAGE_SIZE,
  buildPageUrl: ({ baseUrl, page, sort }) => {
    // KaliScan exposes four server-rendered listings; map our sort keys onto
    // them so each browse sort pages through the real upstream ordering.
    const path =
      sort === "title"
        ? "az-list"
        : sort === "popular" || sort === "chapters"
          ? "popular"
          : sort === "new" || sort === "added" || sort === "newest"
            ? "newest"
            : "latest"
    const url = new URL(`/${path}`, baseUrl)
    url.searchParams.set("page", String(page))

    return url.toString()
  },
  buildGenreUrl: ({ baseUrl, page, genre }) => {
    const url = new URL(`/genres/${genre}`, baseUrl)
    url.searchParams.set("page", String(page))

    return url.toString()
  },
  parsePage: parseCatalogPage,
}

function parseMetaFieldValues(html: string, label: string) {
  const match = html.match(
    new RegExp(
      `<strong>\\s*(?:<i[^>]*>\\s*</i>)?\\s*${label}\\s*:\\s*</strong>([\\s\\S]*?)</p>`,
      "i"
    )
  )

  if (!match) {
    return []
  }

  const anchorValues = [...match[1].matchAll(/<a[^>]*>([\s\S]*?)<\/a>/gi)]
    .map((anchor) => stripHtml(anchor[1] ?? "").replace(/[,;]+$/, "").trim())
    .filter(Boolean)

  if (anchorValues.length) {
    return [...new Set(anchorValues)]
  }

  const text = stripHtml(match[1])

  return text ? [text] : []
}

function parseDetailSynopsis(html: string, title: string) {
  const summaryBlock = html.match(
    /<div class="section-body summary">([\s\S]*?)<\/div>/i
  )

  if (summaryBlock) {
    const paragraphs = [...summaryBlock[1].matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .map((paragraph) => stripHtml(paragraph[1] ?? ""))
      .filter(Boolean)
    const realSynopsis = paragraphs.find(
      (paragraph) => !/^you(?:'| a)re reading/i.test(paragraph)
    )

    if (realSynopsis) {
      return realSynopsis
    }
  }

  const description = getMetaContent(html, "description")

  if (description) {
    const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    return toSynopsis(
      description
        .replace(new RegExp(`^read\\s+${escapedTitle}\\s*[-–—:]\\s*`, "i"), "")
        .replace(/^read\s+/i, "")
    )
  }

  return "Synopsis unavailable from the selected source."
}

function parseKaliscanDetails({
  html,
  slug,
  definition,
}: {
  html: string
  slug: string
  definition: SourceDefinition
}): ScrapedMangaDetails {
  const headingMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  const ogTitle = getMetaContent(html, "og:title")
  const title =
    (headingMatch ? stripHtml(headingMatch[1]) : "") ||
    (ogTitle
      ? ogTitle.replace(/^read\s+/i, "").replace(/\s*-\s*kaliscan\s*$/i, "").trim()
      : "") ||
    toTitleCase(slug.replace(/^\d+-/, ""))

  const altHeadingMatch = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)
  const altTitles = altHeadingMatch
    ? [
        ...new Set(
          stripHtml(altHeadingMatch[1])
            .split(/[,，、/|]/)
            .map((value) => value.trim())
            .filter(Boolean)
        ),
      ]
    : []

  const authors = parseMetaFieldValues(html, "Authors")
  const artists = parseMetaFieldValues(html, "Artists")
  const genres = parseMetaFieldValues(html, "Genres")
  const status = parseMetaFieldValues(html, "Status")[0] ?? "Ongoing"
  const lastUpdate = parseMetaFieldValues(html, "Last update")[0] ?? null

  return {
    title,
    synopsis: parseDetailSynopsis(html, title),
    coverImage: normalizeSourceImageUrl(getMetaContent(html, "og:image")),
    authors: authors.length ? authors : artists.length ? artists : ["Unknown author"],
    artists,
    genres: genres.length ? genres : [definition.label],
    status: mapStatus(status),
    altTitles,
    updatedAt: parseRelativeDate(lastUpdate),
  }
}

// KaliScan server-renders the COMPLETE chapter list (with release dates) inside
// `<ul id="chapter-list">`, so we parse it from the detail HTML we already
// fetched instead of the chapters API, which is flaky and date-less.
function parseKaliscanChapters({
  html,
  slug,
  baseUrl,
}: {
  html: string
  slug: string
  baseUrl: string
}): SourceChapterInfo[] {
  const listMatch = html.match(
    /<ul[^>]*id=["']chapter-list["'][^>]*>([\s\S]*?)<\/ul>/i
  )

  if (!listMatch) {
    return []
  }

  const seen = new Set<string>()
  const chapters: SourceChapterInfo[] = []

  for (const anchor of listMatch[1].matchAll(
    /<a[^>]+href=["']([^"']*?\/chapter-[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  )) {
    const url = normalizeUrl(htmlDecode(anchor[1]), baseUrl)
    const idMatch = url?.match(/\/chapter-([^/?#]+)/i)
    const id = idMatch ? decodeURIComponent(idMatch[1]) : null

    if (!url || !id || seen.has(id)) {
      continue
    }

    seen.add(id)

    const titleMatch = anchor[2].match(
      /class=["'][^"']*chapter-title[^"']*["'][^>]*>([\s\S]*?)<\//i
    )
    const title = titleMatch ? stripHtml(titleMatch[1]) : ""
    const dateMatch = anchor[2].match(
      /class=["'][^"']*chapter-update[^"']*["'][^>]*>([\s\S]*?)<\/time>/i
    )
    // KaliScan only exposes relative dates ("2 years ago"); keep that exact
    // label for display and derive an ISO date only for sorting/metadata.
    const releaseLabel = dateMatch ? stripHtml(dateMatch[1]) : ""

    chapters.push({
      id,
      mangaId: slug,
      title: title || `Chapter ${id}`,
      chapter: id,
      releaseDate: releaseLabel ? parseRelativeDate(releaseLabel) : null,
      releaseLabel: releaseLabel || null,
      pageCount: 0,
      readable: true,
      translatedLanguage: "en",
      url,
    })
  }

  return chapters
}

// Chapter pages live in a `var chapImages = "url1,url2,..."` string of signed,
// order-sensitive CDN URLs (rotating `s*.1stmggv7.xyz` hosts), not <img> tags.
function extractKaliscanChapterImages({ html }: { html: string }) {
  const match = html.match(/var\s+chapImages\s*=\s*(["'])([\s\S]*?)\1/)

  if (!match) {
    return []
  }

  return match[2]
    .split(",")
    .map((value) => htmlDecode(value.trim()))
    .filter((value) => /^https?:\/\//i.test(value))
}

export const kaliscanSource = createComickSourceAdapter({
  definition: sourceDefinition,
  buildMangaUrl: (slug, baseUrl) => new URL(`/manga/${slug}`, baseUrl).toString(),
  catalog,
  parseDetails: parseKaliscanDetails,
  parseChapters: parseKaliscanChapters,
  extractChapterImageUrls: extractKaliscanChapterImages,
  buildSearchPreviewsFromResults: true,
})
