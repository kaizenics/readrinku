import "server-only"

import { mangaCatalog } from "@/lib/data/manga-data"
import type { Chapter, Manga, MangaRepository } from "@/lib/types/readrinku"

class StaticMangaRepository implements MangaRepository {
  async getAll(): Promise<Manga[]> {
    return mangaCatalog
  }

  async getBySlug(slug: string): Promise<Manga | undefined> {
    return mangaCatalog.find((manga) => manga.slug === slug)
  }

  async getChapter(
    mangaSlug: string,
    chapterSlug: string
  ): Promise<Chapter | undefined> {
    const manga = await this.getBySlug(mangaSlug)
    return manga?.chapters.find((chapter) => chapter.slug === chapterSlug)
  }
}

export const mangaRepository = new StaticMangaRepository()
