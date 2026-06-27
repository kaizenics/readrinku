import { getMangaInfoBySlug } from "@/lib/data/manga-info"

export const revalidate = 3600

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const result = await getMangaInfoBySlug(slug)

  if (!result) {
    return Response.json({ message: "Manga not found." }, { status: 404 })
  }

  const { manga, sourceInfo, source, display } = result

  return Response.json({
    source,
    provider: sourceInfo.sourceId,
    manga: {
      id: manga.id,
      slug: manga.slug,
      sourceUrl: manga.sourceUrl ?? null,
      title: display.title,
      altTitles: display.altTitles,
      tagline: manga.tagline,
      synopsis: manga.synopsis,
      coverImage: display.coverImage,
      authors: manga.authors,
      genres: display.genres,
      status: manga.status,
      contentRating: manga.contentRating,
      readingDirection: manga.readingDirection,
      updatedAt: manga.updatedAt,
      chapterCount: display.chapterCount,
    },
    chapters: sourceInfo.chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      chapter: chapter.chapter,
      releaseDate: chapter.releaseDate,
      pageCount: chapter.pageCount,
      readable: chapter.readable,
      sourceUrl: chapter.url,
      href: chapter.readable ? `/read/${manga.slug}/${chapter.id}` : null,
    })),
  })
}
