import Link from "next/link"
import { ArrowRightIcon, BookOpenTextIcon } from "@phosphor-icons/react/ssr"

import { CoverImage } from "@/components/manga/cover-image"
import { ProgressRail } from "@/components/manga/progress-rail"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { contentRatingLabels, getLatestChapter, getProgressPercent, mangaStatusLabels } from "@/lib/readrinku"
import type { Manga, ReadingProgress } from "@/lib/types/readrinku"
import { cn } from "@/lib/utils"

export function MangaCard({
  manga,
  progress,
}: {
  manga: Manga
  progress?: ReadingProgress
}) {
  const latestChapter = getLatestChapter(manga)
  const progressPercent = getProgressPercent(progress)

  return (
    <Card className="group relative h-full overflow-hidden border bg-card/90">
      <div className="absolute inset-y-4 left-3">
        <ProgressRail percent={progressPercent} />
      </div>
      <CardHeader className="pl-8">
        <Link href={`/manga/${manga.slug}`} className="flex flex-col gap-4">
          <CoverImage src={manga.coverImage} alt={manga.title} />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary">{mangaStatusLabels[manga.status]}</Badge>
              <span>{contentRatingLabels[manga.contentRating]}</span>
            </div>
            <CardTitle className="font-heading text-base leading-tight tracking-tight">
              {manga.title}
            </CardTitle>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {manga.tagline}
            </p>
          </div>
        </Link>
      </CardHeader>
      <CardContent className="pl-8">
        <div className="flex flex-wrap gap-2">
          {manga.genres.slice(0, 3).map((genre) => (
            <Badge key={genre} variant="outline">
              {genre}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="items-center justify-between pl-8 text-sm">
        <span className={cn("text-muted-foreground", progressPercent > 0 && "text-foreground")}>
          {progressPercent > 0
            ? `${progressPercent}% read`
            : `Ch. ${latestChapter.number} latest`}
        </span>
        <Link
          href={`/manga/${manga.slug}`}
          className="inline-flex items-center gap-1 font-medium text-foreground"
        >
          <BookOpenTextIcon />
          Open
          <ArrowRightIcon />
        </Link>
      </CardFooter>
    </Card>
  )
}
