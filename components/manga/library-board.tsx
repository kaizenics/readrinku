"use client"

import Link from "next/link"
import { BookmarksIcon } from "@phosphor-icons/react"

import { CoverImage } from "@/components/manga/cover-image"
import { useReadRinku } from "@/components/providers/read-rinku-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { libraryStatusLabels } from "@/lib/readrinku"
import type { LibraryStatus, Manga } from "@/lib/types/readrinku"

const statuses: LibraryStatus[] = ["reading", "planned", "completed", "bookmarked"]

export function LibraryBoard({ manga }: { manga: Manga[] }) {
  const { hydrated, library } = useReadRinku()

  return (
    <Tabs defaultValue="reading" className="gap-6">
      <TabsList>
        {statuses.map((status) => (
          <TabsTrigger key={status} value={status}>
            {libraryStatusLabels[status]}
          </TabsTrigger>
        ))}
      </TabsList>

      {statuses.map((status) => {
        const entries = library
          .filter((entry) => entry.status === status)
          .map((entry) => ({
            entry,
            manga: manga.find((item) => item.id === entry.mangaId),
          }))
          .filter((item) => item.manga)

        return (
          <TabsContent key={status} value={status}>
            {hydrated && entries.length === 0 ? (
              <Empty className="min-h-64 rounded-xl border-dashed">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <BookmarksIcon />
                  </EmptyMedia>
                  <EmptyTitle>{libraryStatusLabels[status]} is empty</EmptyTitle>
                  <EmptyDescription>
                    Save titles from the browse or detail page to build your library.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {entries.map(({ entry, manga: currentManga }) => (
                  <Card key={entry.mangaId} className="border bg-card/90">
                    <CardContent className="grid gap-4 p-4 sm:grid-cols-[120px_1fr]">
                      <CoverImage
                        src={currentManga!.coverImage}
                        alt={currentManga!.title}
                      />
                      <div className="flex flex-col justify-between gap-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-heading text-lg font-semibold tracking-tight">
                              {currentManga!.title}
                            </h3>
                            <Badge variant="secondary">
                              {libraryStatusLabels[entry.status]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {currentManga!.tagline}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button asChild className="min-h-11 sm:min-h-9">
                            <Link href={`/manga/${currentManga!.slug}`}>Open details</Link>
                          </Button>
                          {entry.latestProgress ? (
                            <Button asChild variant="outline" className="min-h-11 sm:min-h-9">
                              <Link
                                href={`/read/${currentManga!.slug}/${entry.latestProgress.chapterSlug}`}
                              >
                                Resume
                              </Link>
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )
      })}
    </Tabs>
  )
}
