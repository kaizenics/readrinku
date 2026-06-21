import Link from "next/link"
import { CalendarBlankIcon, LinkSimpleIcon } from "@phosphor-icons/react/ssr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDateLabel } from "@/lib/readrinku"
import type { MangadexChapterInfo } from "@/lib/types/readrinku"

export function MangadexChapterList({
  chapters,
}: {
  chapters: MangadexChapterInfo[]
}) {
  return (
    <div className="flex flex-col gap-3">
      {chapters.map((chapter) => (
        <Card key={chapter.id} className="border bg-card">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">MangaDex</Badge>
                <p className="font-medium">
                  {chapter.chapter ? `Ch. ${chapter.chapter}` : "Chapter"}: {chapter.title}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <LinkSimpleIcon />
                  {chapter.translatedLanguage.toUpperCase()}
                </span>
                {chapter.releaseDate ? (
                  <span className="inline-flex items-center gap-2">
                    <CalendarBlankIcon />
                    {formatDateLabel(chapter.releaseDate)}
                  </span>
                ) : (
                  <span>Release date unavailable</span>
                )}
                <span>{chapter.pageCount} pages</span>
              </div>
            </div>
            {chapter.readable ? (
              <Button asChild className="min-h-11 px-4">
                <Link href={`/read/${chapter.mangaId}/${chapter.id}`}>Open chapter</Link>
              </Button>
            ) : (
              <Button type="button" variant="outline" disabled className="min-h-11 px-4">
                External chapter
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
