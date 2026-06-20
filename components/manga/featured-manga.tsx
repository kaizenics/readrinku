import Link from "next/link"
import { ArrowRightIcon, BookOpenIcon } from "@phosphor-icons/react/ssr"

import { CoverImage } from "@/components/manga/cover-image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { contentRatingLabels, formatDateLabel, mangaStatusLabels } from "@/lib/readrinku"
import type { Manga } from "@/lib/types/readrinku"

export function FeaturedManga({ manga }: { manga: Manga }) {
  const firstReadableChapter = manga.chapters.find((chapter) => chapter.readable)

  return (
    <Card className="overflow-hidden border bg-card/90">
      <CardContent className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,260px)_1fr]">
        <CoverImage src={manga.coverImage} alt={manga.title} priority />
        <div className="flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge>{mangaStatusLabels[manga.status]}</Badge>
              <Badge variant="secondary">{contentRatingLabels[manga.contentRating]}</Badge>
              <Badge variant="outline">{manga.readingDirection.toUpperCase()}</Badge>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                Featured this week
              </p>
              <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                {manga.title}
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground">{manga.synopsis}</p>
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-lg border bg-background/70 p-3">
                <dt className="text-muted-foreground">Updated</dt>
                <dd className="mt-1 font-medium">{formatDateLabel(manga.updatedAt)}</dd>
              </div>
              <div className="rounded-lg border bg-background/70 p-3">
                <dt className="text-muted-foreground">Authors</dt>
                <dd className="mt-1 font-medium">{manga.authors.join(", ")}</dd>
              </div>
              <div className="rounded-lg border bg-background/70 p-3">
                <dt className="text-muted-foreground">Chapters</dt>
                <dd className="mt-1 font-medium">{manga.chapterCount} total</dd>
              </div>
            </dl>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {firstReadableChapter ? (
              <Button asChild className="min-h-11 px-4">
                <Link href={`/read/${manga.slug}/${firstReadableChapter.slug}`}>
                  <BookOpenIcon data-icon="inline-start" />
                  Start reading
                </Link>
              </Button>
            ) : null}
            <Button asChild variant="outline" className="min-h-11 px-4">
              <Link href={`/manga/${manga.slug}`}>
                View details
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
