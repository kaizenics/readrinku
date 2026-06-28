import {
  getArchiveSourceManga,
  getFeaturedSourceManga,
  getRecentSourceManga,
  getSpotlightSourceManga,
} from "@/lib/data/source"
import type { SourceMangaPreview } from "@/lib/types/readrinku"

// Homepage shelves for the mobile app (mirrors the web home page composition).
// Re-uses the same server-only data layer; mobile fetches this over HTTP.
export const revalidate = 600

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control":
    "public, max-age=60, s-maxage=600, stale-while-revalidate=3600",
}

// Slim payload — only the fields a card/detail teaser renders.
function toCard(manga: SourceMangaPreview) {
  return {
    id: manga.id,
    title: manga.title,
    image: manga.image,
    chapterCount: manga.chapterCount,
    lastChapterLabel: manga.lastChapterLabel,
    genres: manga.genres,
    contentRating: manga.contentRating,
    status: manga.status,
    synopsis: manga.synopsis,
  }
}

export async function GET() {
  const [featured, latest, spotlight, archive] = await Promise.all([
    getFeaturedSourceManga(10),
    getRecentSourceManga(6),
    getSpotlightSourceManga(6),
    getArchiveSourceManga(6),
  ])

  return Response.json(
    {
      featured: featured.map(toCard),
      latest: latest.map(toCard),
      spotlight: spotlight.map(toCard),
      archive: archive.map(toCard),
    },
    { headers: CORS_HEADERS }
  )
}

export function OPTIONS() {
  return new Response(null, {
    headers: { ...CORS_HEADERS, "Access-Control-Allow-Headers": "*" },
  })
}
