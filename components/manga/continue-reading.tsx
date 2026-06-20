"use client"

import Link from "next/link"
import { ArrowClockwiseIcon, BookOpenIcon } from "@phosphor-icons/react"

import { CoverImage } from "@/components/manga/cover-image"
import { useReadRinku } from "@/components/providers/read-rinku-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { getMangaProgress, getProgressPercent } from "@/lib/readrinku"
import type { Manga } from "@/lib/types/readrinku"

export function ContinueReading({ manga }: { manga: Manga[] }) {
  const { progress, hydrated } = useReadRinku()

  const entries = manga
    .map((item) => ({
      manga: item,
      progress: getMangaProgress(progress, item.id),
    }))
    .filter((entry) => entry.progress)
    .sort((left, right) =>
      (right.progress?.updatedAt ?? "").localeCompare(left.progress?.updatedAt ?? "")
    )
    .slice(0, 3)

  if (hydrated && entries.length === 0) {
    return (
      <Empty className="quiet-panel min-h-56 rounded-xl border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BookOpenIcon />
          </EmptyMedia>
          <EmptyTitle>No reading history yet</EmptyTitle>
          <EmptyDescription>
            Open a placeholder chapter and your progress will appear here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">Continue reading</h2>
        <p className="text-sm text-muted-foreground">
          Recent progress is saved locally in your browser.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {entries.map(({ manga, progress: currentProgress }) => (
          <Card key={manga.id} className="border bg-card/90">
            <CardContent className="grid gap-4 p-4 sm:grid-cols-[112px_1fr]">
              <CoverImage src={manga.coverImage} alt={manga.title} />
              <div className="flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <h3 className="font-heading text-lg font-semibold tracking-tight">
                    {manga.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{manga.tagline}</p>
                  <p className="text-sm">
                    Page {currentProgress?.page} of {currentProgress?.totalPages}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getProgressPercent(currentProgress)}% completed
                  </p>
                </div>
                {currentProgress ? (
                  <Button asChild className="min-h-11 sm:min-h-9">
                    <Link href={`/read/${manga.slug}/${currentProgress.chapterSlug}`}>
                      <ArrowClockwiseIcon data-icon="inline-start" />
                      Resume
                    </Link>
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
