"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  CalendarBlankIcon,
  GlobeHemisphereWestIcon,
  LockSimpleIcon,
} from "@phosphor-icons/react"

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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDateLabel } from "@/lib/readrinku"
import type { MangadexChapterInfo } from "@/lib/types/readrinku"

const LANGUAGE_LABELS: Record<string, string> = {
  "ja-ro": "Japanese (Romanized)",
  "ko-ro": "Korean (Romanized)",
  "zh-ro": "Chinese (Romanized)",
  "zh-hk": "Chinese (Hong Kong)",
  "pt-br": "Portuguese (Brazil)",
  "es-la": "Spanish (Latin America)",
}

function getLanguageLabel(code: string) {
  const normalizedCode = code.trim().toLowerCase()

  if (!normalizedCode) {
    return "Unknown"
  }

  if (LANGUAGE_LABELS[normalizedCode]) {
    return LANGUAGE_LABELS[normalizedCode]
  }

  try {
    const displayNames = new Intl.DisplayNames(["en"], { type: "language" })
    return displayNames.of(normalizedCode) ?? normalizedCode.toUpperCase()
  } catch {
    return normalizedCode.toUpperCase()
  }
}

export function MangadexChapterList({
  chapters,
}: {
  chapters: MangadexChapterInfo[]
}) {
  const languageOptions = useMemo(
    () =>
      [...new Set(chapters.map((chapter) => chapter.translatedLanguage.trim().toLowerCase()))]
        .filter(Boolean)
        .sort((left, right) =>
          getLanguageLabel(left).localeCompare(getLanguageLabel(right))
        ),
    [chapters]
  )

  const defaultLanguage = languageOptions.includes("en") ? "en" : "all"
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage)

  useEffect(() => {
    setSelectedLanguage((currentLanguage) => {
      if (!languageOptions.length) {
        return "all"
      }

      if (currentLanguage === "all") {
        return defaultLanguage
      }

      if (!languageOptions.includes(currentLanguage)) {
        return defaultLanguage
      }

      return currentLanguage
    })
  }, [defaultLanguage, languageOptions])

  const visibleChapters = useMemo(() => {
    if (selectedLanguage === "all") {
      return chapters
    }

    return chapters.filter(
      (chapter) => chapter.translatedLanguage.trim().toLowerCase() === selectedLanguage
    )
  }, [chapters, selectedLanguage])

  const languageLabel =
    selectedLanguage === "all" ? "all available languages" : getLanguageLabel(selectedLanguage)

  return (
    <Card className="border bg-card/80">
      <CardHeader className="border-b">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Chapter list
            </CardTitle>
            <CardDescription>
              Showing {visibleChapters.length} chapter
              {visibleChapters.length === 1 ? "" : "s"} from MangaDex in {languageLabel}.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="h-8 rounded-md px-3">
              <GlobeHemisphereWestIcon />
              Live source
            </Badge>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="h-8 min-w-40 rounded-md px-3 text-sm">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectGroup>
                  <SelectLabel>Language</SelectLabel>
                  <SelectItem value="all">All languages</SelectItem>
                  {languageOptions.map((language) => (
                    <SelectItem key={language} value={language}>
                      {getLanguageLabel(language)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <ScrollArea className="h-[34rem] md:h-[38rem] xl:h-[42rem]">
          {visibleChapters.length ? (
            <div className="flex flex-col">
              {visibleChapters.map((chapter) => {
                const chapterLabel = chapter.chapter ? `Chapter ${chapter.chapter}` : "Chapter"
                const translatedLanguageLabel = getLanguageLabel(chapter.translatedLanguage)
                const content = (
                  <div className="flex min-w-0 items-center justify-between gap-4 border-b px-4 py-4 transition-colors hover:bg-muted/30 sm:px-5">
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-foreground">
                          {chapterLabel}
                        </span>
                        <Badge variant="secondary">{translatedLanguageLabel}</Badge>
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
          ) : (
            <div className="px-4 py-6 sm:px-5">
              <Empty className="min-h-52 rounded-none border-0 border-t px-0 py-10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <GlobeHemisphereWestIcon />
                  </EmptyMedia>
                  <EmptyTitle>No chapters in this language yet</EmptyTitle>
                  <EmptyDescription>
                    Try another language to see more available MangaDex uploads for this title.
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
