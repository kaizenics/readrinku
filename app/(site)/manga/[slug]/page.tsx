import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  BookOpenIcon,
  CalendarBlankIcon,
  StarIcon,
} from "@phosphor-icons/react/ssr"

import { JsonLd } from "@/components/seo/json-ld"
import { CoverImage } from "@/components/manga/cover-image"
import { LibrarySelect } from "@/components/manga/library-select"
import { SourceChapterList } from "@/components/manga/source-chapter-list"
import { SynopsisPreview } from "@/components/manga/synopsis-preview"
import { TrendingManga } from "@/components/manga/trending-manga"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getRecentSourceManga } from "@/lib/data/source"
import { getMangaInfoBySlug } from "@/lib/data/manga-info"
import {
  contentRatingLabels,
  formatDateLabel,
  mangaStatusLabels,
} from "@/lib/readrinku"
import {
  absoluteUrl,
  buildMetadata,
  createBreadcrumbSchema,
  resolveImageUrl,
  truncateDescription,
} from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const result = await getMangaInfoBySlug(slug)

  if (!result) {
    return buildMetadata({
      title: "Manga Not Found",
      description: "This manga title could not be found in ReadRinku.",
      path: `/manga/${slug}`,
      noIndex: true,
    })
  }

  const { manga, display } = result
  const description = truncateDescription(
    manga.tagline ? `${manga.tagline} ${manga.synopsis}` : manga.synopsis
  )

  return buildMetadata({
    title: `${display.title} Manga`,
    description,
    path: `/manga/${slug}`,
    keywords: [
      display.title,
      `${display.title} manga`,
      `${display.title} chapters`,
      ...display.genres,
      ...manga.authors,
    ],
    image: display.coverImage,
  })
}

export default async function MangaDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [result, trending] = await Promise.all([
    getMangaInfoBySlug(slug),
    getRecentSourceManga(6),
  ])

  if (!result) {
    notFound()
  }

  const { manga, sourceInfo, display } = result
  const latestReadableChapter = manga.chapters.find((chapter) => chapter.readable)
  const suggestedManga = trending.filter((entry) => entry.id !== manga.id).slice(0, 5)
  const pageSchema = [
    createBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Browse", path: "/browse" },
      { name: display.title, path: `/manga/${manga.slug}` },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `${display.title} manga details`,
      url: absoluteUrl(`/manga/${manga.slug}`),
      description: truncateDescription(manga.synopsis),
      about: display.genres,
      isPartOf: {
        "@type": "WebSite",
        name: "ReadRinku",
        url: absoluteUrl("/"),
      },
      primaryImageOfPage: resolveImageUrl(display.coverImage),
    },
    {
      "@context": "https://schema.org",
      "@type": "BookSeries",
      name: display.title,
      alternateName: display.altTitles,
      description: manga.synopsis,
      genre: display.genres,
      author: manga.authors.map((author) => ({
        "@type": "Person",
        name: author,
      })),
      image: resolveImageUrl(display.coverImage),
      url: absoluteUrl(`/manga/${manga.slug}`),
      inLanguage: "en",
      numberOfItems: sourceInfo.chapters.length,
      isAccessibleForFree: true,
      provider: {
        "@type": "Organization",
        name: "ReadRinku",
      },
    },
  ]

  return (
    <>
      <JsonLd data={pageSchema} />
      <div className="page-frame flex flex-col gap-8 py-8 sm:py-10">
        <section className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_280px]">
          <div className="xl:self-start">
            <CoverImage src={display.coverImage} alt={display.title} priority />
          </div>

          <Card className="border bg-card/80">
            <CardHeader className="gap-3 border-b">
              <div className="flex flex-wrap gap-2">
                <Badge>{mangaStatusLabels[manga.status]}</Badge>
                <Badge variant="secondary">
                  {contentRatingLabels[manga.contentRating]}
                </Badge>
                <Badge variant="outline">{manga.readingDirection.toUpperCase()}</Badge>
                <Badge variant="outline">Live source</Badge>
              </div>
              <div className="flex flex-col gap-1">
                <CardDescription className="uppercase tracking-[0.24em]">
                  Manga details
                </CardDescription>
                <h1 className="font-heading text-4xl font-semibold tracking-tight">
                  {display.title}
                </h1>
                <p className="text-base leading-7 text-muted-foreground">
                  {manga.tagline}
                </p>
                {display.altTitles.length > 0 ? (
                  <CardDescription>
                    Also known as: {display.altTitles.slice(0, 3).join(", ")}
                  </CardDescription>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <h2 className="font-heading text-2xl font-semibold tracking-tight">
                  Synopsis
                </h2>
                <SynopsisPreview title={display.title} synopsis={manga.synopsis} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border bg-background/60 p-3">
                  <dt className="text-muted-foreground">Authors</dt>
                  <dd className="mt-1 font-medium">{manga.authors.join(", ")}</dd>
                </div>
                <div className="rounded-lg border bg-background/60 p-3">
                  <dt className="text-muted-foreground">Genres</dt>
                  <dd className="mt-1 font-medium">{display.genres.join(", ")}</dd>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {latestReadableChapter ? (
                  <Button asChild className="min-h-11 px-4">
                    <Link href={`/read/${manga.slug}/${latestReadableChapter.slug}`}>
                      <BookOpenIcon data-icon="inline-start" />
                      Open latest chapter
                    </Link>
                  </Button>
                ) : null}
                <LibrarySelect mangaId={manga.id} />
              </div>
            </CardContent>
          </Card>

          <Card className="border bg-card/80 xl:self-start">
            <CardHeader className="border-b">
              <CardTitle className="text-xl font-semibold tracking-tight">
                Details
              </CardTitle>
              <CardDescription>
                Quick metadata for this manga title.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="rounded-lg border bg-background/60 p-3">
                <dt className="text-muted-foreground">Last updated</dt>
                <dd className="mt-1 font-medium">
                  {sourceInfo.chapters[0]?.releaseLabel ?? formatDateLabel(manga.updatedAt)}
                </dd>
              </div>
              {manga.rating ? (
                <div className="rounded-lg border bg-background/60 p-3">
                  <dt className="text-muted-foreground">Rating</dt>
                  <dd className="mt-1 flex flex-wrap items-center gap-2 font-medium">
                    <StarIcon weight="fill" className="text-amber-400" />
                    {manga.rating.toFixed(2)} / 10
                    {manga.ratingCount ? (
                      <span className="text-xs font-normal text-muted-foreground">
                        ({manga.ratingCount.toLocaleString()} ratings)
                      </span>
                    ) : null}
                  </dd>
                </div>
              ) : null}
              {manga.popularity ? (
                <div className="rounded-lg border bg-background/60 p-3">
                  <dt className="text-muted-foreground">Popularity</dt>
                  <dd className="mt-1 font-medium">#{manga.popularity.toLocaleString()}</dd>
                </div>
              ) : null}
              {manga.publishedFrom ? (
                <div className="rounded-lg border bg-background/60 p-3">
                  <dt className="text-muted-foreground">Published</dt>
                  <dd className="mt-1 flex items-center gap-2 font-medium">
                    <CalendarBlankIcon />
                    {formatDateLabel(manga.publishedFrom)} –{" "}
                    {manga.publishedTo
                      ? formatDateLabel(manga.publishedTo)
                      : "Ongoing"}
                  </dd>
                </div>
              ) : null}
              {manga.malType ? (
                <div className="rounded-lg border bg-background/60 p-3">
                  <dt className="text-muted-foreground">Type</dt>
                  <dd className="mt-1 font-medium">{manga.malType}</dd>
                </div>
              ) : null}
              {manga.demographics?.length ? (
                <div className="rounded-lg border bg-background/60 p-3">
                  <dt className="text-muted-foreground">Demographic</dt>
                  <dd className="mt-1 font-medium">{manga.demographics.join(", ")}</dd>
                </div>
              ) : null}
              {manga.serializations?.length ? (
                <div className="rounded-lg border bg-background/60 p-3">
                  <dt className="text-muted-foreground">Serialization</dt>
                  <dd className="mt-1 font-medium">{manga.serializations.join(", ")}</dd>
                </div>
              ) : null}
              <div className="rounded-lg border bg-background/60 p-3">
                <dt className="text-muted-foreground">Chapters</dt>
                <dd className="mt-1 font-medium">
                  {sourceInfo.chapters.length} available entries
                </dd>
              </div>
              {manga.malUrl ? (
                <a
                  href={manga.malUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-1 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                >
                  Metadata from MyAnimeList
                </a>
              ) : null}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0">
            <SourceChapterList chapters={sourceInfo.chapters} />
          </div>
          <aside className="xl:sticky xl:top-24 xl:self-start">
            <TrendingManga manga={suggestedManga} />
          </aside>
        </section>
      </div>
    </>
  )
}
