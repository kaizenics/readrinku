import Link from "next/link"
import { notFound } from "next/navigation"
import { BookOpenIcon, TextAlignRightIcon } from "@phosphor-icons/react/ssr"

import { ChapterList } from "@/components/manga/chapter-list"
import { CoverImage } from "@/components/manga/cover-image"
import { LibrarySelect } from "@/components/manga/library-select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  contentRatingLabels,
  formatDateLabel,
  mangaStatusLabels,
} from "@/lib/readrinku"
import { mangaRepository } from "@/lib/data/manga-repository"

export default async function MangaDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const manga = await mangaRepository.getBySlug(slug)

  if (!manga) {
    notFound()
  }

  const firstReadableChapter = manga.chapters.find((chapter) => chapter.readable)

  return (
    <div className="page-frame flex flex-col gap-8 py-8 sm:py-10">
      <Card className="overflow-hidden border bg-card/90">
        <CardContent className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[240px_1fr]">
          <CoverImage src={manga.coverImage} alt={manga.title} priority />
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-2">
              <Badge>{mangaStatusLabels[manga.status]}</Badge>
              <Badge variant="secondary">{contentRatingLabels[manga.contentRating]}</Badge>
              <Badge variant="outline">{manga.readingDirection.toUpperCase()}</Badge>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <h1 className="font-heading text-3xl font-semibold tracking-tight">
                  {manga.title}
                </h1>
                <p className="text-muted-foreground">{manga.tagline}</p>
              </div>
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                {manga.synopsis}
              </p>
            </div>

            <dl className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border bg-background/70 p-3">
                <dt className="text-muted-foreground">Authors</dt>
                <dd className="mt-1 font-medium">{manga.authors.join(", ")}</dd>
              </div>
              <div className="rounded-lg border bg-background/70 p-3">
                <dt className="text-muted-foreground">Last updated</dt>
                <dd className="mt-1 font-medium">{formatDateLabel(manga.updatedAt)}</dd>
              </div>
              <div className="rounded-lg border bg-background/70 p-3">
                <dt className="text-muted-foreground">Direction</dt>
                <dd className="mt-1 flex items-center gap-2 font-medium">
                  <TextAlignRightIcon />
                  {manga.readingDirection === "rtl" ? "Right to left" : "Left to right"}
                </dd>
              </div>
              <div className="rounded-lg border bg-background/70 p-3">
                <dt className="text-muted-foreground">Genres</dt>
                <dd className="mt-1 font-medium">{manga.genres.join(", ")}</dd>
              </div>
            </dl>

            <div className="flex flex-col gap-3 sm:flex-row">
              {firstReadableChapter ? (
                <Button asChild className="min-h-11 px-4">
                  <Link href={`/read/${manga.slug}/${firstReadableChapter.slug}`}>
                    <BookOpenIcon data-icon="inline-start" />
                    Read chapter {firstReadableChapter.number}
                  </Link>
                </Button>
              ) : null}
              <LibrarySelect mangaId={manga.id} />
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Chapter list
          </h2>
          <p className="text-sm text-muted-foreground">
            One chapter is fully readable for the frontend prototype. The rest demonstrate list behavior.
          </p>
        </div>
        <ChapterList manga={manga} />
      </section>
    </div>
  )
}
