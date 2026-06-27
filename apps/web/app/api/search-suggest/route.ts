import { getSearchMatches, getSearchSuggestions } from "@/lib/data/source"
import { hasAdultTitle, isAdultContent } from "@/lib/readrinku"

// Lightweight typeahead endpoint for the header search dropdown. It returns a
// slim payload (just what a suggestion row renders) for the top few matches,
// plus the full match count so the "View all results" link can show a total.
//
// Two phases keep it both fast and accurate: the default response is the cheap
// source matches (instant, title-based gating); `?enrich=1` overlays MyAnimeList
// covers + genres. The client renders the fast phase, then patches in the
// enriched one. Both skip the expensive per-result detail back-fill. The
// upstream sources expose their own `/api/search`, so this route is named
// distinctly to avoid confusion.
//
// The response is fully determined by the URL (q + enrich + safe), so it is
// edge-cacheable: popular/repeat searches are served instantly from the CDN
// instead of re-running the live upstream lookups, and stale-while-revalidate
// keeps it instant while a fresh copy is fetched in the background.
const SUGGEST_LIMIT = 5
const MIN_QUERY_LENGTH = 2
const CACHE_HEADER = {
  "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get("q") ?? "").trim()
  const enrich = searchParams.get("enrich") === "1"
  // Family Safe travels in the URL (not a cookie) so each variant caches
  // separately and correctly. Defaults to on.
  const familySafe = searchParams.get("safe") !== "0"

  if (q.length < MIN_QUERY_LENGTH) {
    return Response.json(
      { q, items: [], total: 0, enriched: enrich },
      { headers: CACHE_HEADER }
    )
  }

  // Fetch a few extra when filtering, so a handful of adult hits don't leave the
  // dropdown short of suggestions.
  const fetchLimit = familySafe ? SUGGEST_LIMIT + 4 : SUGGEST_LIMIT
  const result = enrich
    ? await getSearchSuggestions(q, fetchLimit)
    : await getSearchMatches(q, fetchLimit)

  const items = result.items
    .map((manga) => ({
      id: manga.id,
      title: manga.title,
      image: manga.image,
      chapterCount: manga.chapterCount,
      status: manga.status,
      genre: manga.genres[0] ?? null,
      // Carry the adult flag (not the raw genres) so the dropdown can blur covers
      // without re-deriving the rating client-side. In the fast phase only the
      // title check fires (genres aren't loaded yet); the enrich phase adds the
      // MyAnimeList genres, and the title check still covers what MAL can't (e.g.
      // doujinshi).
      isAdult:
        isAdultContent(manga.contentRating, manga.genres) ||
        hasAdultTitle(manga.title, manga.altTitles),
    }))
    .filter((manga) => !familySafe || !manga.isAdult)
    .slice(0, SUGGEST_LIMIT)

  return Response.json(
    { q, items, total: result.total, enriched: enrich },
    { headers: CACHE_HEADER }
  )
}
