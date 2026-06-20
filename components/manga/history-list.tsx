"use client"

import Link from "next/link"
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react"

import { useReadRinku } from "@/components/providers/read-rinku-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { formatRelativeLabel } from "@/lib/readrinku"
import type { Manga } from "@/lib/types/readrinku"

export function HistoryList({ manga }: { manga: Manga[] }) {
  const { hydrated, progress } = useReadRinku()

  if (hydrated && progress.length === 0) {
    return (
      <Empty className="min-h-64 rounded-xl border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ClockCounterClockwiseIcon />
          </EmptyMedia>
          <EmptyTitle>No history yet</EmptyTitle>
          <EmptyDescription>
            When you open a chapter, the recent activity list will appear here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {progress.map((entry) => {
        const currentManga = manga.find((item) => item.id === entry.mangaId)

        if (!currentManga) {
          return null
        }

        return (
          <Card key={`${entry.mangaId}-${entry.chapterSlug}`} className="border bg-card/90">
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{currentManga.title}</h3>
                  <Badge variant="secondary">Chapter {entry.chapterSlug.replace("chapter-", "")}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Page {entry.page} of {entry.totalPages}
                </p>
                <p className="text-xs text-muted-foreground">
                  Updated {formatRelativeLabel(entry.updatedAt)}
                </p>
              </div>
              <Button asChild className="min-h-11 sm:min-h-9">
                <Link href={`/read/${currentManga.slug}/${entry.chapterSlug}`}>Resume</Link>
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
