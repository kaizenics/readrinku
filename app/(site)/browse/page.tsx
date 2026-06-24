import type { Metadata } from "next"
import { Fragment, Suspense } from "react"

import { JsonLd } from "@/components/seo/json-ld"
import { BrowseFilters } from "@/components/manga/browse-filters"
import { LiveMangaShelf } from "@/components/manga/live-manga-shelf"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { browseSourceManga } from "@/lib/data/source"
import { absoluteUrl, buildMetadata } from "@/lib/seo"

// Browse is a per-request, paginated live view driven by the URL (page/q/sort);
// render it dynamically. The underlying catalog fetches stay cached via their
// own `revalidate`, so this only opts the page shell out of static prerender.
export const dynamic = "force-dynamic"

type SearchValue = string | string[] | undefined
const BROWSE_PAGE_SIZE = 24

function toSingle(value: SearchValue) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? ""
}

function toPage(value: SearchValue) {
  const parsed = Number.parseInt(toSingle(value), 10)

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1
  }

  return parsed
}

function buildBrowseHref(
  params: Record<string, SearchValue>,
  nextPage: number
) {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    const currentValue = toSingle(value)

    if (!currentValue || key === "page") {
      continue
    }

    search.set(key, currentValue)
  }

  if (nextPage > 1) {
    search.set("page", String(nextPage))
  }

  const query = search.toString()
  return query ? `/browse?${query}` : "/browse"
}

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1])
  return [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b)
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
      "Browse manga titles, compare recent updates, and discover readable series from the ReadRinku source catalog.",
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
  const currentPage = toPage(params.page)

  const initial = {
    q: toSingle(params.q),
    sort: toSingle(params.sort) || "updated",
  }

  const result = await browseSourceManga({
    q: initial.q,
    sort: initial.sort,
    limit: BROWSE_PAGE_SIZE,
    page: currentPage,
  })
  const totalPages = Math.max(1, Math.ceil(result.total / BROWSE_PAGE_SIZE))
  const normalizedPage = Math.min(currentPage, totalPages)
  const startResult = result.total === 0 ? 0 : (normalizedPage - 1) * BROWSE_PAGE_SIZE + 1
  const endResult = Math.min(normalizedPage * BROWSE_PAGE_SIZE, result.total)
  const visiblePages = getVisiblePages(normalizedPage, totalPages)

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
            browse state in the URL for sharable discovery across multiple sources.
          </p>
        </div>
        <Suspense
          fallback={
            <div className="h-[7.5rem] rounded-xl border bg-card/70" />
          }
        >
          <BrowseFilters initial={initial} />
        </Suspense>
        <LiveMangaShelf
          title={`${result.total} result${result.total === 1 ? "" : "s"}`}
          description="These manga results are fetched server-side and updated from the current live source catalog."
          manga={result.items}
        />
        {result.total > BROWSE_PAGE_SIZE ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Showing {startResult}-{endResult} of {result.total} titles.
            </p>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={buildBrowseHref(params, Math.max(1, normalizedPage - 1))}
                    aria-disabled={normalizedPage <= 1}
                    className={normalizedPage <= 1 ? "pointer-events-none opacity-50" : undefined}
                  />
                </PaginationItem>
                {visiblePages.map((page, index) => {
                  const previousPage = visiblePages[index - 1]
                  const needsEllipsis = previousPage && page - previousPage > 1

                  return (
                    <Fragment key={page}>
                      {needsEllipsis ? (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : null}
                      <PaginationItem>
                        <PaginationLink
                          href={buildBrowseHref(params, page)}
                          isActive={page === normalizedPage}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    </Fragment>
                  )
                })}
                <PaginationItem>
                  <PaginationNext
                    href={buildBrowseHref(params, Math.min(totalPages, normalizedPage + 1))}
                    aria-disabled={normalizedPage >= totalPages}
                    className={normalizedPage >= totalPages ? "pointer-events-none opacity-50" : undefined}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        ) : null}
      </div>
    </>
  )
}
