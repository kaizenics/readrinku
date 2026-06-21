import { notFound } from "next/navigation"

import { MangaReader } from "@/components/reader/manga-reader"
import { getReaderMangaByIds } from "@/lib/data/manga-info"

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ mangaSlug: string; chapterSlug: string }>
}) {
  const { mangaSlug, chapterSlug } = await params
  const result = await getReaderMangaByIds(mangaSlug, chapterSlug)

  if (!result) {
    notFound()
  }

  return <MangaReader manga={result.manga} chapter={result.chapter} />
}
