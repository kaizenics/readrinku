import Link from "next/link"
import { ArrowRightIcon, BookOpenTextIcon } from "@phosphor-icons/react/ssr"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { RemoteCoverImage } from "@/components/manga/remote-cover-image"
import {
  contentRatingLabels,
  formatRelativeLabel,
  mangaStatusLabels,
} from "@/lib/readrinku"
import { getMangaCardSummary } from "@/lib/data/source"
import type { SourceMangaPreview } from "@/lib/types/readrinku"

export function LiveMangaCard({ manga }: { manga: SourceMangaPreview }) {
  return (
    <Card className="group relative h-full overflow-hidden border bg-card">
      <CardContent className="flex h-full gap-4 p-4">
        <Link
          href={`/manga/${manga.id}`}
          className="relative block w-38 shrink-0 self-stretch overflow-hidden rounded-md border bg-muted sm:w-52"
        >
          {manga.image ? (
            <RemoteCoverImage
              src={manga.image}
              alt={manga.title}
              sizes="(max-width: 640px) 112px, 128px"
              imageClassName="transition-transform duration-200 group-hover:scale-[1.02]"
              fallbackLabel={manga.title}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/60 p-4 text-center text-xs font-medium text-muted-foreground">
              <span className="line-clamp-3">{manga.title}</span>
            </div>
          )}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              <span className="truncate">{manga.genres[0] ?? "Manga"}</span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span className="truncate">
                {manga.readingDirection === "rtl" ? "Manga" : "Series"}
              </span>
            </div>

            <Link href={`/manga/${manga.id}`} className="block">
              <CardTitle className="line-clamp-2 font-heading text-lg leading-snug tracking-tight">
                {manga.title}
              </CardTitle>
            </Link>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary">{mangaStatusLabels[manga.status]}</Badge>
              <span>{contentRatingLabels[manga.contentRating]}</span>
            </div>

            <p className="line-clamp-4 text-sm leading-7 text-muted-foreground">
              {getMangaCardSummary(manga)}
            </p>
          </div>

          <div className="mt-4 flex min-h-[8.5rem] flex-col gap-2">
            {(manga.recentChapters.length > 0
              ? manga.recentChapters
              : [
                  {
                    id: manga.lastChapterLabel.replace("Ch. ", ""),
                    mangaId: manga.id,
                    title: manga.lastChapterLabel,
                    chapter: manga.lastChapterLabel.replace("Ch. ", ""),
                    releaseDate: null,
                    pageCount: 0,
                    readable: false,
                    translatedLanguage: "unknown",
                    url: manga.sourceUrl,
                  },
                ]
            )
              .slice(0, 3)
              .map((chapter) => {
                const number = chapter.chapter?.trim()
                const canRead = Boolean(number) && number !== "Chapter unavailable"
                const rowClassName =
                  "flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-xs"
                const rowContent = (
                  <>
                    <span className="truncate text-foreground">
                      {chapter.chapter ? `Ch. ${chapter.chapter}` : chapter.title}
                    </span>
                    <span className="shrink-0 text-muted-foreground">
                      {chapter.releaseLabel
                        ? chapter.releaseLabel
                        : chapter.releaseDate
                          ? formatRelativeLabel(chapter.releaseDate)
                          : null}
                    </span>
                  </>
                )

                return canRead ? (
                  <Link
                    key={chapter.id}
                    href={`/read/${manga.id}/${chapter.id}`}
                    className={`${rowClassName} transition-colors hover:border-foreground/40 hover:bg-muted/40`}
                  >
                    {rowContent}
                  </Link>
                ) : (
                  <div key={chapter.id} className={rowClassName}>
                    {rowContent}
                  </div>
                )
              })}
          </div>

          <div className="mt-auto flex items-center justify-between pt-4 text-sm">
            <span className="text-muted-foreground">
              {manga.chapterCount > 0
                ? `${manga.chapterCount} chapters`
                : "Chapter count unavailable"}
            </span>
            <Link
              href={`/manga/${manga.id}`}
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
