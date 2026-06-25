import type { MetadataRoute } from "next"

import { getSourceHomepageManga } from "@/lib/data/source"
import { mangaCatalog } from "@/lib/data/manga-data"
import { absoluteUrl, resolveImageUrl } from "@/lib/seo"

function getFallbackEntries() {
  return mangaCatalog.map((manga) => ({
    id: manga.slug,
    updatedAt: manga.updatedAt,
    image: manga.coverImage,
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sourceEntries = await getSourceHomepageManga(36).catch(() => [])
  const mangaEntries = new Map<string, { updatedAt: string; image: string | null }>()

  for (const entry of sourceEntries) {
    mangaEntries.set(entry.id, {
      updatedAt: entry.updatedAt,
      image: entry.image,
    })
  }

  for (const entry of getFallbackEntries()) {
    if (mangaEntries.has(entry.id)) {
      continue
    }

    mangaEntries.set(entry.id, {
      updatedAt: entry.updatedAt,
      image: entry.image,
    })
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/browse"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/terms"),
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ]

  const mangaRoutes: MetadataRoute.Sitemap = [...mangaEntries.entries()].map(
    ([slug, entry]) => ({
      url: absoluteUrl(`/manga/${slug}`),
      lastModified: entry.updatedAt,
      changeFrequency: "daily",
      priority: 0.8,
      images: entry.image ? [resolveImageUrl(entry.image)] : undefined,
    })
  )

  return [...staticRoutes, ...mangaRoutes]
}
