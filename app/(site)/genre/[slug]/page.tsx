import type { Metadata } from "next"
import { Fragment } from "react"
import { notFound } from "next/navigation"

import { JsonLd } from "@/components/seo/json-ld"
import { AgeGate } from "@/components/manga/age-gate"
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
import { browseGenreManga } from "@/lib/data/source"
import { findGenre } from "@/lib/genres"
import { absoluteUrl, buildMetadata } from "@/lib/seo"

// Live, per-request paginated genre listing; underlying source fetches stay cached.
export const dynamic = "force-dynamic"

type SearchValue = string | string[] | undefined
const GENRE_PAGE_SIZE = 24

function toSingle(value: SearchValue) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? ""
}

function toPage(value: SearchValue) {
  const parsed = Number.parseInt(toSingle(value), 10)
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1
}

function buildGenreHref(slug: string, nextPage: number) {
  return nextPage > 1 ? `/genre/${slug}?page=${nextPage}` : `/genre/${slug}`
}

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1])
  return [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const genre = findGenre(slug)

  if (!genre) {
    return buildMetadata({
      title: "Genre Not Found",
      description: "This genre could not be found in ReadRinku.",
      path: `/genre/${slug}`,
      noIndex: true,
    })
  }

  return buildMetadata({
    title: `${genre.label} Comics`,
    description: `Browse ${genre.label} comics and webtoons and read available chapters in ReadRinku.`,
    path: `/genre/${genre.slug}`,
    keywords: [`${genre.label} comics`, `${genre.label} webtoons`, `read ${genre.label} comics`],
  })
}

export default async function GenrePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, SearchValue>>
}) {
  const { slug } = await params
  const genre = findGenre(slug)

  if (!genre) {
    notFound()
  }

  const search = await searchParams
  const currentPage = toPage(search.page)

  const result = await browseGenreManga(genre.slug, {
    limit: GENRE_PAGE_SIZE,
    page: currentPage,
  })
  const totalPages = Math.max(1, Math.ceil(result.total / GENRE_PAGE_SIZE))
  const normalizedPage = Math.min(currentPage, totalPages)
  const startResult = result.total === 0 ? 0 : (normalizedPage - 1) * GENRE_PAGE_SIZE + 1
  const endResult = Math.min(normalizedPage * GENRE_PAGE_SIZE, result.total)
  const visiblePages = getVisiblePages(normalizedPage, totalPages)

  const pageSchema = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${genre.label} comics`,
      url: absoluteUrl(`/genre/${genre.slug}`),
      description: `Browse ${genre.label} comics and webtoons in ReadRinku.`,
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

  const listing = (
    <>
      <LiveMangaShelf manga={result.items} />

      {result.total > GENRE_PAGE_SIZE ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Showing {startResult}-{endResult} of {result.total} titles.
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={buildGenreHref(genre.slug, Math.max(1, normalizedPage - 1))}
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
                        href={buildGenreHref(genre.slug, page)}
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
                  href={buildGenreHref(genre.slug, Math.min(totalPages, normalizedPage + 1))}
                  aria-disabled={normalizedPage >= totalPages}
                  className={normalizedPage >= totalPages ? "pointer-events-none opacity-50" : undefined}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}
    </>
  )

  return (
    <>
      <JsonLd data={pageSchema} />
      <div className="page-frame flex flex-col gap-8 py-8 sm:py-10">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Genre
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {genre.label} comics
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {genre.label} comics and webtoons from the live source catalog — open any
            title to read its available chapters.
          </p>
        </div>

        {genre.adult ? (
          <AgeGate genreLabel={genre.label}>{listing}</AgeGate>
        ) : (
          listing
        )}
      </div>
    </>
  )
}
