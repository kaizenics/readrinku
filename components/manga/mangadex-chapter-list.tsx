import Link from "next/link"
import {
  CalendarBlankIcon,
  GlobeHemisphereWestIcon,
  LockSimpleIcon,
} from "@phosphor-icons/react/ssr"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDateLabel } from "@/lib/readrinku"
import type { MangadexChapterInfo } from "@/lib/types/readrinku"

export function MangadexChapterList({
  chapters,
}: {
  chapters: MangadexChapterInfo[]
}) {
  return (
    <Card className="border bg-card/80">
      <CardHeader className="border-b">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Chapter list
            </CardTitle>
            <CardDescription>
              The latest readable chapters from MangaDex, arranged in a cleaner reading queue.
            </CardDescription>
          </div>
          <Badge variant="outline" className="h-8 rounded-md px-3">
            <GlobeHemisphereWestIcon />
            Live source
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <ScrollArea className="max-h-[42rem]">
          <div className="flex flex-col">
            {chapters.map((chapter) => {
              const content = (
                <div className="flex min-w-0 items-center justify-between gap-4 border-b px-4 py-4 transition-colors hover:bg-muted/30 sm:px-5">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-foreground">
                        {chapter.chapter ? `Chapter ${chapter.chapter}` : "Chapter"}
                      </span>
                      <Badge variant="secondary">{chapter.translatedLanguage.toUpperCase()}</Badge>
                    </div>
                    <p className="line-clamp-1 text-muted-foreground">{chapter.title}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1 text-right">
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <CalendarBlankIcon />
                      {chapter.releaseDate
                        ? formatDateLabel(chapter.releaseDate)
                        : "Release date unavailable"}
                    </span>
                    <span className="text-muted-foreground">{chapter.pageCount} pages</span>
                  </div>
                </div>
              )

              if (!chapter.readable) {
                return (
                  <div key={chapter.id} className="opacity-75">
                    <div className="flex items-center justify-between gap-3 px-4 pt-3 sm:px-5">
                      <Badge variant="outline">
                        <LockSimpleIcon />
                        External
                      </Badge>
                    </div>
                    {content}
                  </div>
                )
              }

              return (
                <Link key={chapter.id} href={`/read/${chapter.mangaId}/${chapter.id}`}>
                  {content}
                </Link>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
