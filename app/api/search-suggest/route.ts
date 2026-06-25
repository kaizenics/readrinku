import { getSearchSuggestions } from "@/lib/data/source"
import { hasAdultTitle, isAdultContent } from "@/lib/readrinku"

// Lightweight typeahead endpoint for the header search dropdown. It returns a
// slim payload (just what a suggestion row renders) for the top few matches,
// plus the full match count so the "View all results" link can show a total.
// Backed by getSearchSuggestions, which skips the expensive per-result detail
// back-fill so the dropdown stays fast. The upstream sources expose their own
// `/api/search`, so this app route is named distinctly to avoid confusion.
export const dynamic = "force-dynamic"

const SUGGEST_LIMIT = 5
const MIN_QUERY_LENGTH = 2

export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim()

  if (q.length < MIN_QUERY_LENGTH) {
    return Response.json({ q, items: [], total: 0 })
  }

  const result = await getSearchSuggestions(q, SUGGEST_LIMIT)

  const items = result.items.map((manga) => ({
    id: manga.id,
    title: manga.title,
    image: manga.image,
    chapterCount: manga.chapterCount,
    status: manga.status,
    genre: manga.genres[0] ?? null,
    // Carry the adult flag (not the raw genres) so the dropdown can blur covers
    // without re-deriving the rating client-side. Fall back to the title check
    // for the obscure titles MyAnimeList doesn't carry (e.g. doujinshi).
    isAdult:
      isAdultContent(manga.contentRating, manga.genres) ||
      hasAdultTitle(manga.title, manga.altTitles),
  }))

  return Response.json({ q, items, total: result.total })
}
