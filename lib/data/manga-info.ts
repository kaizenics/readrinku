import "server-only"

import { cache } from "react"

import {
  getSourceChapterPages,
  getSourceMangaInfo,
} from "@/lib/data/source"
import type { Chapter, Manga, SourceMangaInfo } from "@/lib/types/readrinku"

export interface MangaInfoResult {
  manga: Manga
  sourceInfo: SourceMangaInfo
  source: "remote"
  display: {
    title: string
    altTitles: string[]
    genres: string[]
    coverImage: string | null
    chapterCount: number
  }
}

function toTagline(value: string) {
  if (value.length <= 170) {
    return value
  }

  return `${value.slice(0, 167).trimEnd()}...`
}

function mapChapterToLocal(
  chapter: SourceMangaInfo["chapters"][number],
  index: number
): Chapter {
  const parsedNumber = Number.parseFloat(chapter.chapter ?? "")

  return {
    slug: chapter.id,
    number: Number.isFinite(parsedNumber) ? parsedNumber : index + 1,
    title: chapter.title,
    releaseDate: chapter.releaseDate ?? new Date(0).toISOString(),
    pageCount: chapter.pageCount,
    readable: chapter.readable,
    sourceUrl: chapter.url,
  }
}

function toLocalManga(info: SourceMangaInfo): Manga {
  const chapters = info.chapters.map(mapChapterToLocal)

  return {
    id: info.id,
    slug: info.id,
    sourceId: info.sourceId,
    sourceUrl: info.url,
    title: info.title,
    tagline: toTagline(info.synopsis),
    synopsis: info.synopsis,
    coverImage: info.image ?? "",
    authors: info.authors.length ? info.authors : ["Unknown author"],
    genres: info.genres?.length ? info.genres : ["Uncategorized"],
    status: info.status,
    contentRating: info.contentRating,
    readingDirection: info.readingDirection,
    updatedAt: info.updatedAt,
    chapterCount: info.chapterCount || chapters.length,
    accent: "neutral",
    chapters,
  }
}

export const getMangaInfoBySlug = cache(async (slug: string) => {
  const sourceInfo = await getSourceMangaInfo(slug)

  if (!sourceInfo) {
    return null
  }

  const manga = toLocalManga(sourceInfo)

  return {
    manga,
    sourceInfo,
    source: "remote" as const,
    display: {
      title: sourceInfo.title,
      altTitles: sourceInfo.altTitles ?? [],
      genres: sourceInfo.genres ?? ["Uncategorized"],
      coverImage: sourceInfo.image,
      chapterCount: sourceInfo.chapterCount || sourceInfo.chapters.length,
    },
  } satisfies MangaInfoResult
})

export const getReaderMangaByIds = cache(
  async (mangaSlug: string, chapterSlug: string) => {
    const result = await getMangaInfoBySlug(mangaSlug)

    if (!result) {
      return null
    }

    const chapterIndex = result.manga.chapters.findIndex(
      (entry) => entry.slug === chapterSlug
    )

    if (chapterIndex === -1) {
      return null
    }

    const chapterSourceUrl = result.manga.chapters[chapterIndex]?.sourceUrl

    if (!chapterSourceUrl) {
      return null
    }

    const pages = await getSourceChapterPages(
      chapterSourceUrl,
      result.sourceInfo.sourceId
    )

    if (!pages.length) {
      return null
    }

    const chapter = {
      ...result.manga.chapters[chapterIndex],
      readable: true,
      pageCount: pages.length,
      pages,
    }

    const manga: Manga = {
      ...result.manga,
      chapters: result.manga.chapters.map((entry) =>
        entry.slug === chapterSlug ? chapter : entry
      ),
    }

    return {
      manga,
      chapter,
    }
  }
)
