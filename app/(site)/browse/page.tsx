import { BrowseFilters } from "@/components/manga/browse-filters"
import { MangaShelf } from "@/components/manga/manga-shelf"
import { filterManga, sortManga } from "@/lib/readrinku"
import { mangaRepository } from "@/lib/data/manga-repository"

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
  const manga = await mangaRepository.getAll()

  const initial = {
    q: toSingle(params.q),
    genre: toSingle(params.genre),
    status: toSingle(params.status),
    rating: toSingle(params.rating),
    sort: toSingle(params.sort) || "updated",
  }

  const filtered = sortManga(
    filterManga(manga, initial),
    initial.sort
  )

  const genres = [...new Set(manga.flatMap((entry) => entry.genres))].sort()

  return (
    <div className="page-frame flex flex-col gap-8 py-8 sm:py-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Browse manga</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Search, sort, and filter the placeholder catalog while keeping everything in URL params.
        </p>
      </div>
      <BrowseFilters genres={genres} initial={initial} />
      <MangaShelf
        title={`${filtered.length} result${filtered.length === 1 ? "" : "s"}`}
        description="This list is server-rendered from fixture data so the backend can drop in later."
        manga={filtered}
      />
    </div>
  )
}
