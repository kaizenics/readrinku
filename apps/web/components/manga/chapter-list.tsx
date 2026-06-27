"use client"

import Link from "next/link"
import { ArrowClockwiseIcon, CaretRightIcon, LockSimpleIcon } from "@phosphor-icons/react"

import { useReadRinku } from "@/components/providers/read-rinku-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDateLabel, getMangaProgress } from "@/lib/readrinku"
import type { Manga } from "@/lib/types/readrinku"

export function ChapterList({ manga }: { manga: Manga }) {
  const { progress } = useReadRinku()
  const currentProgress = getMangaProgress(progress, manga.id)

  return (
    <div className="flex flex-col gap-3">
      {manga.chapters.map((chapter) => {
        const isCurrent = currentProgress?.chapterSlug === chapter.slug
        const href = `/read/${manga.slug}/${chapter.slug}`

        return (
          <Card key={chapter.slug} className="border bg-card/80">
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    Chapter {chapter.number}: {chapter.title}
                  </p>
                  {isCurrent ? <Badge>Resume</Badge> : null}
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span>{chapter.pageCount} pages</span>
                  <span>{formatDateLabel(chapter.releaseDate)}</span>
                  <span>{chapter.readable ? "Readable demo" : "Coming with backend"}</span>
                </div>
              </div>
              {chapter.readable ? (
                <Button asChild variant={isCurrent ? "default" : "outline"} className="min-h-11">
                  <Link href={href}>
                    {isCurrent ? (
                      <ArrowClockwiseIcon data-icon="inline-start" />
                    ) : (
                      <CaretRightIcon data-icon="inline-start" />
                    )}
                    {isCurrent ? "Resume" : "Read"}
                  </Link>
                </Button>
              ) : (
                <Button type="button" variant="outline" disabled className="min-h-11">
                  <LockSimpleIcon data-icon="inline-start" />
                  Placeholder
                </Button>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
