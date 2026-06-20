"use client"

import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowsOutCardinalIcon,
  BookOpenIcon,
  CaretLeftIcon,
  CaretRightIcon,
  RowsIcon,
  XIcon,
} from "@phosphor-icons/react"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { useReadRinku } from "@/components/providers/read-rinku-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  directionBehaviorLabels,
  getReaderWidthClass,
  readerModeLabels,
  readerWidthLabels,
} from "@/lib/readrinku"
import type { Chapter, Manga, ReadingDirection } from "@/lib/types/readrinku"
import { cn } from "@/lib/utils"

function getEffectiveDirection(
  titleDirection: ReadingDirection,
  behavior: "manga-default" | "force-ltr" | "force-rtl"
) {
  if (behavior === "force-ltr") {
    return "ltr"
  }

  if (behavior === "force-rtl") {
    return "rtl"
  }

  return titleDirection
}

export function MangaReader({
  manga,
  chapter,
}: {
  manga: Manga
  chapter: Chapter
}) {
  const { preferences, progress, updatePreferences, updateProgress } = useReadRinku()
  const pages = useMemo(() => chapter.pages ?? [], [chapter.pages])
  const saved = progress.find(
    (entry) =>
      entry.mangaId === manga.id && entry.chapterSlug === chapter.slug
  )
  const [currentPage, setCurrentPage] = useState(saved?.page ?? 1)
  const [showControls, setShowControls] = useState(true)
  const verticalContainerRef = useRef<HTMLDivElement | null>(null)
  const hideTimeoutRef = useRef<number | null>(null)

  const direction = getEffectiveDirection(
    manga.readingDirection,
    preferences.directionBehavior
  )

  const totalPages = pages.length

  const currentImage = pages[currentPage - 1]
  const canGoBack = currentPage > 1
  const canGoForward = currentPage < totalPages

  const nextChapter = manga.chapters.find(
    (entry) => entry.number === chapter.number + 1 && entry.readable
  )
  const previousChapter = manga.chapters.find(
    (entry) => entry.number === chapter.number - 1 && entry.readable
  )

  const revealControls = useCallback(() => {
    setShowControls(true)

    if (preferences.controlsVisibility === "always") {
      return
    }

    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current)
    }

    hideTimeoutRef.current = window.setTimeout(() => {
      setShowControls(false)
    }, 2200)
  }, [preferences.controlsVisibility])

  const goToPrevious = useCallback(() => {
    if (!canGoBack) {
      return
    }

    setCurrentPage((page) => page - 1)
    revealControls()
  }, [canGoBack, revealControls])

  const goToNext = useCallback(() => {
    if (!canGoForward) {
      return
    }

    setCurrentPage((page) => page + 1)
    revealControls()
  }, [canGoForward, revealControls])

  useEffect(() => {
    if (preferences.controlsVisibility === "always") {
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current)
        hideTimeoutRef.current = null
      }
      return
    }

    hideTimeoutRef.current = window.setTimeout(() => {
      setShowControls(false)
    }, 2200)

    return () => {
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current)
        hideTimeoutRef.current = null
      }
    }
  }, [preferences.controlsVisibility])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (preferences.mode === "vertical") {
        if (event.key === "Escape") {
          setShowControls((value) => !value)
        }
        return
      }

      if (event.key === "Escape") {
        setShowControls((value) => !value)
      }

      if ((direction === "rtl" && event.key === "ArrowLeft") || (direction === "ltr" && event.key === "ArrowRight")) {
        goToNext()
      }

      if ((direction === "rtl" && event.key === "ArrowRight") || (direction === "ltr" && event.key === "ArrowLeft")) {
        goToPrevious()
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [direction, goToNext, goToPrevious, preferences.mode])

  useEffect(() => {
    if (preferences.mode !== "paged") {
      return
    }

    const adjacent = [pages[currentPage], pages[currentPage - 2]].filter(Boolean)
    adjacent.forEach((page) => {
      const preload = new window.Image()
      preload.src = page!.src
    })
  }, [currentPage, pages, preferences.mode])

  useEffect(() => {
    updateProgress({
      mangaId: manga.id,
      mangaSlug: manga.slug,
      chapterSlug: chapter.slug,
      page: currentPage,
      totalPages,
      scrollPercent: totalPages === 0 ? 0 : currentPage / totalPages,
      updatedAt: new Date().toISOString(),
    })
  }, [chapter.slug, currentPage, manga.id, manga.slug, totalPages, updateProgress])

  useEffect(() => {
    if (preferences.mode !== "vertical") {
      return
    }

    const nodes = verticalContainerRef.current?.querySelectorAll<HTMLElement>(
      "[data-page-number]"
    )

    if (!nodes?.length) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)

        if (!visible[0]) {
          return
        }

        const nextPage = Number(
          (visible[0].target as HTMLElement).dataset.pageNumber
        )

        if (!Number.isNaN(nextPage)) {
          setCurrentPage(nextPage)
        }
      },
      {
        threshold: [0.45, 0.8],
        rootMargin: "-10% 0px -35% 0px",
      }
    )

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [pages, preferences.mode])

  const progressPercent = useMemo(() => {
    if (!totalPages) {
      return 0
    }

    return Math.round((currentPage / totalPages) * 100)
  }, [currentPage, totalPages])

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      onPointerMove={() => revealControls()}
      onClick={() => revealControls()}
    >
      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 z-30 border-b bg-background/92 backdrop-blur-sm transition-opacity duration-200",
          showControls || preferences.controlsVisibility === "always"
            ? "opacity-100"
            : "opacity-0"
        )}
      >
        <div className="page-frame flex min-h-16 items-center justify-between gap-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Button asChild variant="outline" size="sm" className="h-10 px-3">
              <Link href={`/manga/${manga.slug}`}>
                <ArrowLeftIcon data-icon="inline-start" />
                Back
              </Link>
            </Button>
            <div className="min-w-0">
              <p className="truncate font-heading text-lg font-semibold tracking-tight">
                {manga.title}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                Chapter {chapter.number}: {chapter.title}
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Badge variant="secondary">{progressPercent}%</Badge>
            <Select
              value={preferences.mode}
              onValueChange={(value) =>
                updatePreferences({ mode: value as typeof preferences.mode })
              }
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Object.entries(readerModeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select
              value={preferences.width}
              onValueChange={(value) =>
                updatePreferences({ width: value as typeof preferences.width })
              }
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Object.entries(readerWidthLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 top-0 z-20 w-1 bg-muted">
        <div
          className="absolute bottom-0 left-0 w-full bg-primary transition-[height] duration-150"
          style={{ height: `${progressPercent}%` }}
        />
      </div>

      <main className="px-4 pb-20 pt-24 sm:px-6">
        {preferences.mode === "vertical" ? (
          <div
            ref={verticalContainerRef}
            className={cn("mx-auto flex w-full flex-col gap-4", getReaderWidthClass(preferences.width))}
          >
            {pages.map((page) => (
              <article
                key={page.pageNumber}
                data-page-number={page.pageNumber}
                className="overflow-hidden rounded-lg border bg-card shadow-sm"
              >
                <Image
                  src={page.src}
                  alt={page.alt}
                  width={page.width}
                  height={page.height}
                  className="h-auto w-full"
                  priority={page.pageNumber === 1}
                />
              </article>
            ))}
          </div>
        ) : currentImage ? (
          <div className="relative mx-auto flex min-h-[75vh] w-full items-center justify-center">
            <button
              type="button"
              className="reader-zone reader-zone-start"
              onClick={direction === "rtl" ? goToNext : goToPrevious}
              aria-label={direction === "rtl" ? "Next page" : "Previous page"}
            />
            <button
              type="button"
              className="reader-zone reader-zone-end"
              onClick={direction === "rtl" ? goToPrevious : goToNext}
              aria-label={direction === "rtl" ? "Previous page" : "Next page"}
            />
            <div className={cn("w-full rounded-xl border bg-card p-2 shadow-sm", getReaderWidthClass(preferences.width))}>
              <Image
                src={currentImage.src}
                alt={currentImage.alt}
                width={currentImage.width}
                height={currentImage.height}
                priority
                className="mx-auto h-auto w-full rounded-md"
              />
            </div>
          </div>
        ) : null}
      </main>

      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 bottom-0 z-30 border-t bg-background/92 backdrop-blur-sm transition-opacity duration-200",
          showControls || preferences.controlsVisibility === "always"
            ? "opacity-100"
            : "opacity-0"
        )}
      >
        <div className="page-frame pointer-events-auto flex flex-col gap-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">{directionBehaviorLabels[preferences.directionBehavior]}</Badge>
              <span>
                Page {currentPage} / {totalPages}
              </span>
            </div>
            <div className="flex items-center gap-2 md:hidden">
              <Button
                type="button"
                variant={preferences.mode === "vertical" ? "default" : "outline"}
                size="sm"
                className="h-10 px-3"
                onClick={() => updatePreferences({ mode: "vertical" })}
              >
                <RowsIcon data-icon="inline-start" />
                Vertical
              </Button>
              <Button
                type="button"
                variant={preferences.mode === "paged" ? "default" : "outline"}
                size="sm"
                className="h-10 px-3"
                onClick={() => updatePreferences({ mode: "paged" })}
              >
                <ArrowsOutCardinalIcon data-icon="inline-start" />
                Paged
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="min-h-11 px-4"
                onClick={direction === "rtl" ? goToNext : goToPrevious}
                disabled={direction === "rtl" ? !canGoForward : !canGoBack}
              >
                {direction === "rtl" ? (
                  <CaretRightIcon data-icon="inline-start" />
                ) : (
                  <CaretLeftIcon data-icon="inline-start" />
                )}
                Prev zone
              </Button>
              <Button
                type="button"
                className="min-h-11 px-4"
                onClick={direction === "rtl" ? goToPrevious : goToNext}
                disabled={direction === "rtl" ? !canGoBack : !canGoForward}
              >
                {direction === "rtl" ? (
                  <CaretLeftIcon data-icon="inline-start" />
                ) : (
                  <CaretRightIcon data-icon="inline-start" />
                )}
                Next zone
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {previousChapter ? (
                <Button asChild variant="ghost" className="min-h-11 px-4">
                  <Link href={`/read/${manga.slug}/${previousChapter.slug}`}>
                    <BookOpenIcon data-icon="inline-start" />
                    Previous chapter
                  </Link>
                </Button>
              ) : null}
              {nextChapter ? (
                <Button asChild variant="ghost" className="min-h-11 px-4">
                  <Link href={`/read/${manga.slug}/${nextChapter.slug}`}>
                    Next chapter
                    <ArrowRightIcon data-icon="inline-end" />
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="ghost" className="min-h-11 px-4">
                  <Link href={`/manga/${manga.slug}`}>
                    <XIcon data-icon="inline-start" />
                    Chapter list
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
