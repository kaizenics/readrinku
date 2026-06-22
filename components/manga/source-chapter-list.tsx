"use client"

import Link from "next/link"
import { CalendarBlankIcon, GlobeHemisphereWestIcon } from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDateLabel } from "@/lib/readrinku"
import type { SourceChapterInfo } from "@/lib/types/readrinku"

export function SourceChapterList({
  chapters,
}: {
  chapters: SourceChapterInfo[]
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
              Showing {chapters.length} chapter{chapters.length === 1 ? "" : "s"} available to read now.
            </CardDescription>
          </div>
          <Badge variant="outline" className="h-8 rounded-md px-3">
            <GlobeHemisphereWestIcon />
            Live source
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <ScrollArea className="h-[34rem] md:h-[38rem] xl:h-[42rem]">
          {chapters.length ? (
            <div className="flex flex-col">
              {chapters.map((chapter) => {
                const chapterLabel = chapter.chapter ? `Chapter ${chapter.chapter}` : "Chapter"

                return (
                  <Link key={chapter.id} href={`/read/${chapter.mangaId}/${chapter.id}`}>
                    <div className="flex min-w-0 items-center justify-between gap-4 border-b px-4 py-4 transition-colors hover:bg-muted/30 sm:px-5">
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-foreground">
                            {chapterLabel}
                          </span>
                          <Badge variant="secondary">English</Badge>
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
                        <span className="text-muted-foreground">
                          {chapter.pageCount > 0
                            ? `${chapter.pageCount} pages`
                            : "Page count loads in reader"}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="px-4 py-6 sm:px-5">
              <Empty className="min-h-52 rounded-none border-0 border-t px-0 py-10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <GlobeHemisphereWestIcon />
                  </EmptyMedia>
                  <EmptyTitle>No chapters available yet</EmptyTitle>
                  <EmptyDescription>
                    This source did not return any readable chapters for the current title.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
