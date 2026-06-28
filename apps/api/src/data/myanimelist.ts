
import { cache } from "../lib/cache"

import { normalizeTitleKey } from "./sources/create-comick-source-adapter"
import type { MangaStatus } from "@rinku/core"

// MyAnimeList metadata, served through Jikan — the free, no-key MAL API.
const JIKAN_BASE_URL = "https://api.jikan.moe/v4"

// MAL metadata barely changes; cache a full day to stay well under rate limits.
const REVALIDATE_SECONDS = 86400

// Media types we treat as a manga/manhwa match. Novels are excluded so a manga
// is never enriched with a same-named light-novel's data.
const COMIC_TYPES = new Set(["manga", "manhwa", "manhua", "oneshot", "doujinshi"])

export interface MalMetadata {
  coverImage: string | null
  synopsis: string | null
  genres: string[]
  authors: string[]
  serializations: string[]
  demographics: string[]
  status: MangaStatus | null
  rating: number | null
  ratingCount: number | null
  popularity: number | null
  publishedFrom: string | null
  publishedTo: string | null
  malUrl: string | null
  malType: string | null
}

type MalCandidate = {
  titles: string[]
  coverImage: string | null
  synopsis: string | null
  genres: string[]
  authors: string[]
  serializations: string[]
  demographics: string[]
  statusRaw: string | null
  rating: number | null
  ratingCount: number | null
  popularity: number | null
  publishedFrom: string | null
  publishedTo: string | null
  malUrl: string | null
  type: string | null
}

function mapStatus(raw: string | null): MangaStatus | null {
  const value = (raw ?? "").toLowerCase()

  if (!value) {
    return null
  }

  if (value.includes("finished") || value.includes("complete")) {
    return "completed"
  }

  if (value.includes("hiatus") || value.includes("discontinued") || value.includes("cancel")) {
    return "hiatus"
  }

  if (value.includes("publishing") || value.includes("ongoing") || value.includes("not yet")) {
    return "ongoing"
  }

  return null
}

function isComicType(type: string | null) {
  if (!type) {
    return true
  }

  return COMIC_TYPES.has(type.toLowerCase().replace(/[^a-z]/g, ""))
}

// MAL records authors as "Last, First"; show "First Last".
function reformatAuthor(name: string) {
  const match = name.trim().match(/^([^,]+),\s*(.+)$/)
  return match ? `${match[2].trim()} ${match[1].trim()}` : name.trim()
}

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))]
}

async function fetchJson(url: string): Promise<any> {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: REVALIDATE_SECONDS },
  }).catch(() => null)

  if (!response?.ok) {
    return null
  }

  return response.json().catch(() => null)
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function names(list: any): string[] {
  return unique((list ?? []).map((entry: any) => entry?.name).filter(Boolean))
}

function toCandidate(item: any): MalCandidate {
  return {
    titles: unique(
      [item.title, item.title_english, item.title_japanese, ...(item.title_synonyms ?? [])].filter(
        Boolean
      )
    ),
    coverImage:
      item.images?.jpg?.large_image_url ??
      item.images?.jpg?.image_url ??
      item.images?.webp?.large_image_url ??
      null,
    synopsis: item.synopsis ?? null,
    genres: unique([...(item.genres ?? []), ...(item.themes ?? [])].map((g: any) => g?.name)),
    authors: unique((item.authors ?? []).map((a: any) => reformatAuthor(a?.name ?? ""))),
    serializations: names(item.serializations),
    demographics: names(item.demographics),
    statusRaw: item.status ?? null,
    rating: typeof item.score === "number" ? item.score : null,
    ratingCount: typeof item.scored_by === "number" ? item.scored_by : null,
    popularity: typeof item.popularity === "number" ? item.popularity : null,
    publishedFrom: item.published?.from ?? null,
    publishedTo: item.published?.to ?? null,
    malUrl: item.url ?? null,
    type: item.type ?? null,
  }
}

async function fetchJikanCandidates(query: string): Promise<MalCandidate[]> {
  const json = await fetchJson(
    `${JIKAN_BASE_URL}/manga?q=${encodeURIComponent(query)}&limit=25`
  )
  const data: any[] = json?.data ?? []

  return data.map(toCandidate)
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function pickBestMatch(
  candidates: MalCandidate[],
  titleKey: string,
  altKeys: Set<string>
): MalCandidate | null {
  for (const candidate of candidates) {
    if (!isComicType(candidate.type)) {
      continue
    }

    const keys = candidate.titles.map(normalizeTitleKey)

    if (keys.includes(titleKey) || keys.some((key) => altKeys.has(key))) {
      return candidate
    }
  }

  return null
}

/**
 * Best-effort MyAnimeList metadata for a title. Conservative exact-title match;
 * returns null on no match, rate-limit, or any error so callers fall back to
 * source metadata.
 */
export const getMyAnimeListMetadata = cache(
  async (title: string, altTitles: string[] = []): Promise<MalMetadata | null> => {
    const titleKey = normalizeTitleKey(title)

    if (!titleKey) {
      return null
    }

    const altKeys = new Set(
      altTitles.map((value) => normalizeTitleKey(value)).filter(Boolean)
    )

    try {
      const candidates = await fetchJikanCandidates(title)
      const match = pickBestMatch(candidates, titleKey, altKeys)

      if (!match) {
        return null
      }

      return {
        coverImage: match.coverImage,
        synopsis: match.synopsis,
        genres: match.genres,
        authors: match.authors,
        serializations: match.serializations,
        demographics: match.demographics,
        status: mapStatus(match.statusRaw),
        rating: match.rating,
        ratingCount: match.ratingCount,
        popularity: match.popularity,
        publishedFrom: match.publishedFrom,
        publishedTo: match.publishedTo,
        malUrl: match.malUrl,
        malType: match.type,
      }
    } catch {
      return null
    }
  }
)
