import type { Metadata } from "next"

import { JsonLd } from "@/components/seo/json-ld"
import { BrowseFilters } from "@/components/manga/browse-filters"
import { LiveMangaShelf } from "@/components/manga/live-manga-shelf"
import { browseSourceManga } from "@/lib/data/source"
import { absoluteUrl, buildMetadata } from "@/lib/seo"

type SearchValue = string | string[] | undefined

function toSingle(value: SearchValue) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? ""
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, SearchValue>>
}): Promise<Metadata> {
  const params = await searchParams
  const q = toSingle(params.q).trim()

  if (q) {
    return buildMetadata({
      title: `Search Manga: ${q}`,
      description: `Search results for ${q} inside the ReadRinku manga browser.`,
      path: "/browse",
      keywords: [q, `${q} manga`, `${q} chapters`],
      noIndex: true,
    })
  }

  return buildMetadata({
    title: "Browse Manga",
    description:
      "Browse manga titles, compare recent updates, and discover readable series from the ReadRinku source feed.",
    path: "/browse",
    keywords: ["browse manga", "manga search", "manga discovery"],
  })
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

  const pageSchema = [
    {
      "@context": "https://schema.org",
      "@type": initial.q ? "SearchResultsPage" : "CollectionPage",
      name: initial.q ? `Manga search results for ${initial.q}` : "Browse manga",
      url: absoluteUrl(initial.q ? `/browse?q=${encodeURIComponent(initial.q)}` : "/browse"),
      description: initial.q
        ? `Search results for ${initial.q} in the ReadRinku manga browser.`
        : "Browse manga discovery results and recent source updates in ReadRinku.",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: result.items.map((entry, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: entry.title,
          url: absoluteUrl(`/manga/${entry.id}`),
        })),
      },
    },
  ]

  return (
    <>
      <JsonLd data={pageSchema} />
      <div className="page-frame flex flex-col gap-8 py-8 sm:py-10">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Browse manga
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Search live manga titles, compare recent updates, and keep the current
            browse state in the URL for sharable discovery.
          </p>
        </div>
        <BrowseFilters initial={initial} />
        <LiveMangaShelf
          title={`${result.total} result${result.total === 1 ? "" : "s"}`}
          description="These manga results are fetched server-side through the Comick Source API with Arya Scans as the main source."
          manga={result.items}
        />
      </div>
    </>
  )
}
