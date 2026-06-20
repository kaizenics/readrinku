import { notFound } from "next/navigation"

import { MangaReader } from "@/components/reader/manga-reader"
import { mangaRepository } from "@/lib/data/manga-repository"

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ mangaSlug: string; chapterSlug: string }>
}) {
  const { mangaSlug, chapterSlug } = await params
  const manga = await mangaRepository.getBySlug(mangaSlug)
  const chapter = await mangaRepository.getChapter(mangaSlug, chapterSlug)

  if (!manga || !chapter || !chapter.readable) {
    notFound()
  }

  return <MangaReader manga={manga} chapter={chapter} />
}
