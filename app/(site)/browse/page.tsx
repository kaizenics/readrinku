import { BrowseFilters } from "@/components/manga/browse-filters"
import { LiveMangaShelf } from "@/components/manga/live-manga-shelf"
import { browseSourceManga } from "@/lib/data/source"

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
    sort: toSingle(params.sort) || "updated",
  }

  const result = await browseSourceManga({
    q: initial.q,
    sort: initial.sort,
    limit: 12,
  })

  return (
    <div className="page-frame flex flex-col gap-8 py-8 sm:py-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Browse manga</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Search Brainrot Comics titles through the Comick Source API and keep the query in the URL.
        </p>
      </div>
      <BrowseFilters initial={initial} />
      <LiveMangaShelf
        title={`${result.total} result${result.total === 1 ? "" : "s"}`}
        description="These results are fetched server-side from the Comick Source API using Arya Scans as the main source."
        manga={result.items}
      />
    </div>
  )
}
