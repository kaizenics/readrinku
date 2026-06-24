import "server-only"

import { cache } from "react"

import { normalizeTitleKey } from "@/lib/data/sources/create-comick-source-adapter"
import type { MangaStatus } from "@/lib/types/readrinku"

// MyAnimeList metadata, fetched through Jikan (the free, no-key MAL mirror) by
// default. Set MAL_CLIENT_ID to use the official MAL API instead — same data.
const JIKAN_BASE_URL = "https://api.jikan.moe/v4"
const MAL_BASE_URL = "https://api.myanimelist.net/v2"
const MAL_CLIENT_ID = process.env.MAL_CLIENT_ID

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
  status: MangaStatus | null
  rating: number | null
  ratingCount: number | null
  publishedFrom: string | null
  publishedTo: string | null
  malUrl: string | null
  malType: string | null
}

// Shape shared by both providers after normalization.
type MalCandidate = {
  titles: string[]
  coverImage: string | null
  synopsis: string | null
  genres: string[]
  authors: string[]
  statusRaw: string | null
  rating: number | null
  ratingCount: number | null
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

async function fetchJson(url: string, headers?: Record<string, string>) {
  const response = await fetch(url, {
    headers: { Accept: "application/json", ...(headers ?? {}) },
    next: { revalidate: REVALIDATE_SECONDS },
  }).catch(() => null)

  if (!response?.ok) {
    return null
  }

  return response.json().catch(() => null)
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function fetchJikanCandidates(query: string): Promise<MalCandidate[]> {
  const json = await fetchJson(
    `${JIKAN_BASE_URL}/manga?q=${encodeURIComponent(query)}&limit=25`
  )
  const data: any[] = json?.data ?? []

  return data.map((item) => ({
    titles: unique([
      item.title,
      item.title_english,
      item.title_japanese,
      ...(item.title_synonyms ?? []),
    ].filter(Boolean)),
    coverImage:
      item.images?.jpg?.large_image_url ??
      item.images?.jpg?.image_url ??
      item.images?.webp?.large_image_url ??
      null,
    synopsis: item.synopsis ?? null,
    genres: unique(
      [...(item.genres ?? []), ...(item.themes ?? [])].map((g: any) => g?.name)
    ),
    authors: unique((item.authors ?? []).map((a: any) => reformatAuthor(a?.name ?? ""))),
    statusRaw: item.status ?? null,
    rating: typeof item.score === "number" ? item.score : null,
    ratingCount: typeof item.scored_by === "number" ? item.scored_by : null,
    publishedFrom: item.published?.from ?? null,
    publishedTo: item.published?.to ?? null,
    malUrl: item.url ?? null,
    type: item.type ?? null,
  }))
}

async function fetchMalCandidates(query: string): Promise<MalCandidate[]> {
  if (!MAL_CLIENT_ID) {
    return []
  }

  const fields =
    "id,title,main_picture,alternative_titles,synopsis,mean,num_scoring_users,status,media_type,genres,authors{first_name,last_name},start_date,end_date"
  const json = await fetchJson(
    `${MAL_BASE_URL}/manga?q=${encodeURIComponent(query)}&limit=25&fields=${encodeURIComponent(fields)}`,
    { "X-MAL-CLIENT-ID": MAL_CLIENT_ID }
  )
  const data: { node?: any }[] = json?.data ?? []

  return data
    .map(({ node }) => node)
    .filter(Boolean)
    .map((node) => {
      const alt = node.alternative_titles ?? {}

      return {
        titles: unique([node.title, alt.en, alt.ja, ...(alt.synonyms ?? [])].filter(Boolean)),
        coverImage: node.main_picture?.large ?? node.main_picture?.medium ?? null,
        synopsis: node.synopsis ?? null,
        genres: unique((node.genres ?? []).map((g: any) => g?.name)),
        authors: unique(
          (node.authors ?? []).map((a: any) =>
            reformatAuthor(
              [a?.node?.last_name, a?.node?.first_name].filter(Boolean).join(", ")
            )
          )
        ),
        statusRaw: node.status ?? null,
        rating: typeof node.mean === "number" ? node.mean : null,
        ratingCount:
          typeof node.num_scoring_users === "number" ? node.num_scoring_users : null,
        publishedFrom: node.start_date ?? null,
        publishedTo: node.end_date ?? null,
        malUrl: `https://myanimelist.net/manga/${node.id}`,
        type: node.media_type ?? null,
      }
    })
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
      const candidates = MAL_CLIENT_ID
        ? await fetchMalCandidates(title)
        : await fetchJikanCandidates(title)
      const match = pickBestMatch(candidates, titleKey, altKeys)

      if (!match) {
        return null
      }

      return {
        coverImage: match.coverImage,
        synopsis: match.synopsis,
        genres: match.genres,
        authors: match.authors,
        status: mapStatus(match.statusRaw),
        rating: match.rating,
        ratingCount: match.ratingCount,
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
