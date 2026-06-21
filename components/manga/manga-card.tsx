import Link from "next/link"
import { ArrowRightIcon, BookOpenTextIcon } from "@phosphor-icons/react/ssr"
import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import {
  formatRelativeLabel,
  getProgressPercent,
  getRecentChapters,
  mangaStatusLabels,
} from "@/lib/readrinku"
import type { Manga, ReadingProgress } from "@/lib/types/readrinku"
import { cn } from "@/lib/utils"

export function MangaCard({
  manga,
  progress,
}: {
  manga: Manga
  progress?: ReadingProgress
}) {
  const progressPercent = getProgressPercent(progress)
  const recentChapters = getRecentChapters(manga)

  return (
    <Card className="group relative h-full overflow-hidden border bg-card">
      <CardContent className="flex h-full gap-3 p-3 sm:gap-4 sm:p-4">
        <Link
          href={`/manga/${manga.slug}`}
          className="relative block w-38 shrink-0 self-stretch overflow-hidden rounded-md border bg-muted sm:w-52"
        >
          <div className="relative h-full min-h-56 w-full sm:min-h-60">
            <Image
              src={manga.coverImage}
              alt={manga.title}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 128px, 144px"
            />
          </div>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              <span className="truncate">{manga.genres[0]}</span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span className="truncate">
                {manga.readingDirection === "rtl" ? "Manga" : "Series"}
              </span>
            </div>

          <Link
            href={`/manga/${manga.slug}`}
            className="block"
          >
            <CardTitle className="line-clamp-2 font-heading text-lg leading-snug tracking-tight">
              {manga.title}
            </CardTitle>
          </Link>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary">{mangaStatusLabels[manga.status]}</Badge>
            </div>

            <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
              {manga.tagline}
            </p>
          </div>

          <div className="mt-3 flex min-h-[7.5rem] flex-col gap-2">
            {recentChapters.map((chapter, index) => (
              <div
                key={chapter.slug}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-md border px-2.5 py-2 text-xs",
                  index === 2 && "hidden xl:flex"
                )}
              >
                <span className="truncate text-foreground">
                  Ch. {String(chapter.number).padStart(2, "0")}{" "}
                  {chapter.readable ? "" : "EN"}
                </span>
                <span className="shrink-0 text-muted-foreground">
                  {formatRelativeLabel(chapter.releaseDate)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-auto flex items-center justify-between pt-4 text-sm">
            <span
              className={cn(
                "text-muted-foreground",
                progressPercent > 0 && "text-foreground"
              )}
            >
              {progressPercent > 0
                ? `${progressPercent}% read`
                : `${manga.chapterCount} chapters`}
            </span>
            <Link
              href={`/manga/${manga.slug}`}
              className="inline-flex items-center gap-1 font-medium text-foreground"
            >
              <BookOpenTextIcon />
              Open
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
