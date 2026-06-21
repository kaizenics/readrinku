import { BrowseFilters } from "@/components/manga/browse-filters"
import { LiveMangaShelf } from "@/components/manga/live-manga-shelf"
import { browseMangadexManga, getMangadexTags } from "@/lib/data/mangadex"

type SearchValue = string | string[] | undefined

function toSingle(value: SearchValue) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? ""
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, SearchValue>>
}) {
  const params = await searchParams

  const initial = {
    q: toSingle(params.q),
    genre: toSingle(params.genre),
    status: toSingle(params.status),
    rating: toSingle(params.rating),
    sort: toSingle(params.sort) || "updated",
  }

  const [result, genres] = await Promise.all([
    browseMangadexManga({
      q: initial.q,
      genre: initial.genre,
      status: initial.status,
      rating: initial.rating,
      sort: initial.sort,
      limit: 12,
    }),
    getMangadexTags(),
  ])

  return (
    <div className="page-frame flex flex-col gap-8 py-8 sm:py-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Browse manga</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Search, sort, and filter live MangaDex titles while keeping everything in URL params.
        </p>
      </div>
      <BrowseFilters genres={genres} initial={initial} />
      <LiveMangaShelf
        title={`${result.total} result${result.total === 1 ? "" : "s"}`}
        description="These results are fetched server-side from the official MangaDex API."
        manga={result.items}
      />
    </div>
  )
}
