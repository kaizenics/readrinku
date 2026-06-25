import { browseSourceManga } from "@/lib/data/source"
import { isAdultContent } from "@/lib/readrinku"

// Lightweight typeahead endpoint for the header search dropdown. It returns a
// slim payload (just what a suggestion row renders) for the top few matches,
// plus the full match count so the "View all results" link can show a total.
// Dynamic per query; the underlying source fetches stay cached via their own
// revalidate. The upstream sources expose their own `/api/search`, so this app
// route is named distinctly to avoid any confusion with that.
export const dynamic = "force-dynamic"

const SUGGEST_LIMIT = 5
const MIN_QUERY_LENGTH = 2

export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim()

  if (q.length < MIN_QUERY_LENGTH) {
    return Response.json({ q, items: [], total: 0 })
  }

  const result = await browseSourceManga({
    q,
    sort: "updated",
    limit: SUGGEST_LIMIT,
    page: 1,
  })

  const items = result.items.map((manga) => ({
    id: manga.id,
    title: manga.title,
    image: manga.image,
    chapterCount: manga.chapterCount,
    status: manga.status,
    genre: manga.genres[0] ?? null,
    // Carry the adult flag (not the raw genres) so the dropdown can blur covers
    // without re-deriving the rating client-side.
    isAdult: isAdultContent(manga.contentRating, manga.genres),
  }))

  return Response.json({ q, items, total: result.total })
}
