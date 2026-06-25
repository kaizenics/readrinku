"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRightIcon, BookOpenTextIcon } from "@phosphor-icons/react/ssr"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { RemoteCoverImage } from "@/components/manga/remote-cover-image"
import { confirmAdult, useAdultConfirmed } from "@/components/manga/adult-consent"
import {
  contentRatingLabels,
  formatRelativeLabel,
  isAdultContent,
  mangaStatusLabels,
} from "@/lib/readrinku"
import { cn } from "@/lib/utils"
import type { SourceMangaPreview } from "@/lib/types/readrinku"

function summarize(value: string, maxLength = 170) {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength - 3).trimEnd()}...`
}

export function LiveMangaCard({ manga }: { manga: SourceMangaPreview }) {
  const router = useRouter()
  const confirmed = useAdultConfirmed()
  const isAdult = isAdultContent(manga.contentRating, manga.genres)
  const gated = isAdult && !confirmed

  const mangaHref = `/manga/${manga.id}`
  const [open, setOpen] = useState(false)
  const [pendingHref, setPendingHref] = useState(mangaHref)

  // When the title is adult and unconfirmed, intercept navigation and ask first.
  function guard(targetHref: string) {
    return (event: React.MouseEvent) => {
      if (gated) {
        event.preventDefault()
        setPendingHref(targetHref)
        setOpen(true)
      }
    }
  }

  function accept() {
    confirmAdult()
    setOpen(false)
    router.push(pendingHref)
  }

  return (
    <Card className="group relative h-full overflow-hidden border bg-card">
      <CardContent className="flex h-full gap-4 p-4">
        <Link
          href={mangaHref}
          onClick={guard(mangaHref)}
          className="relative block w-38 shrink-0 self-stretch overflow-hidden rounded-md border bg-muted sm:w-52"
        >
          {manga.image ? (
            <RemoteCoverImage
              src={manga.image}
              alt={manga.title}
              sizes="(max-width: 640px) 112px, 128px"
              imageClassName={cn(
                "transition-transform duration-200 group-hover:scale-[1.02]",
                gated && "scale-110 blur-2xl"
              )}
              fallbackLabel={manga.title}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/60 p-4 text-center text-xs font-medium text-muted-foreground">
              <span className={cn("line-clamp-3", gated && "blur-sm")}>
                {manga.title}
              </span>
            </div>
          )}

          {gated ? (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 bg-black/45 text-center">
              <span className="rounded-md border border-white/50 px-2 py-0.5 text-base font-bold text-white">
                18+
              </span>
              <span className="px-2 text-[10px] font-medium uppercase tracking-wide text-white/85">
                Tap to verify age
              </span>
            </div>
          ) : null}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              <span className="truncate">{manga.genres[0] ?? "Comic"}</span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span className="truncate">
                {manga.readingDirection === "rtl" ? "Comic" : "Series"}
              </span>
            </div>

            <Link href={mangaHref} onClick={guard(mangaHref)} className="block">
              <CardTitle className="line-clamp-2 font-heading text-lg leading-snug tracking-tight">
                {manga.title}
              </CardTitle>
            </Link>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary">{mangaStatusLabels[manga.status]}</Badge>
              <span>{contentRatingLabels[manga.contentRating]}</span>
            </div>

            <p className="line-clamp-4 text-sm leading-7 text-muted-foreground">
              {summarize(manga.synopsis)}
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
                const chapterHref = `/read/${manga.id}/${chapter.id}`
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
                    href={chapterHref}
                    onClick={guard(chapterHref)}
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
              href={mangaHref}
              onClick={guard(mangaHref)}
              className="inline-flex items-center gap-1 font-medium text-foreground"
            >
              <BookOpenTextIcon />
              Open
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </div>
        </div>
      </CardContent>

      {isAdult ? (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Adult content ahead</AlertDialogTitle>
              <AlertDialogDescription>
                “{manga.title}” is an 18+ title. Please confirm you are 18 years or
                older to continue.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No, take me back</AlertDialogCancel>
              <AlertDialogAction onClick={accept}>Yes, I am 18+</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </Card>
  )
}
