import "server-only"

import { createComickSourceAdapter } from "@/lib/data/sources/create-comick-source-adapter"
import { getSourceDefinition } from "@/lib/data/sources/source-config"

const sourceDefinition = getSourceDefinition("demonicscans")

export const demonicScansSource = createComickSourceAdapter({
  definition: sourceDefinition,
  buildMangaUrl: (slug, baseUrl) => new URL(`/manga/${slug}`, baseUrl).toString(),
  chapterImagePatterns: [
    /^https:\/\/cdn\.demoniclibs\.com\/.+\.(?:jpg|jpeg|png|webp)$/i,
  ],
})
