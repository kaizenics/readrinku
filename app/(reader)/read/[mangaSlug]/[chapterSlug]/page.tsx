import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { MangaReader } from "@/components/reader/manga-reader"
import { getReaderMangaByIds } from "@/lib/data/manga-info"
import { buildNoIndexMetadata } from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ mangaSlug: string; chapterSlug: string }>
}): Promise<Metadata> {
  const { mangaSlug, chapterSlug } = await params
  const result = await getReaderMangaByIds(mangaSlug, chapterSlug)

  if (!result) {
    return buildNoIndexMetadata({
      title: "Reader",
      description: "This chapter could not be loaded in the ReadRinku reader.",
      path: `/read/${mangaSlug}/${chapterSlug}`,
    })
  }

  return buildNoIndexMetadata({
    title: `Read ${result.manga.title} Chapter ${result.chapter.number}`,
    description: `Read chapter ${result.chapter.number} of ${result.manga.title} in the ReadRinku reader.`,
    path: `/read/${mangaSlug}/${chapterSlug}`,
  })
}

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
