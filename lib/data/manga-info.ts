import "server-only"

import { cache } from "react"

import {
  getMangadexChapterPages,
  getMangadexMangaInfo,
} from "@/lib/data/mangadex"
import type { Chapter, Manga, MangadexMangaInfo } from "@/lib/types/readrinku"

export interface MangaInfoResult {
  manga: Manga
  mangadexInfo: MangadexMangaInfo
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
  chapter: MangadexMangaInfo["chapters"][number],
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
  }
}

function toLocalManga(info: MangadexMangaInfo): Manga {
  const chapters = info.chapters.map(mapChapterToLocal)

  return {
    id: info.id,
    slug: info.id,
    mangadexId: info.id,
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
  const mangadexInfo = await getMangadexMangaInfo(slug)

  if (!mangadexInfo) {
    return null
  }

  const manga = toLocalManga(mangadexInfo)

  return {
    manga,
    mangadexInfo,
    source: "remote" as const,
    display: {
      title: mangadexInfo.title,
      altTitles: mangadexInfo.altTitles ?? [],
      genres: mangadexInfo.genres ?? ["Uncategorized"],
      coverImage: mangadexInfo.image,
      chapterCount: mangadexInfo.chapterCount || mangadexInfo.chapters.length,
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

    const pages = await getMangadexChapterPages(chapterSlug)

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
