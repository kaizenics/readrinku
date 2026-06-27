import "server-only"

import { createComickSourceAdapter } from "@/lib/data/sources/create-comick-source-adapter"
import { getSourceDefinition } from "@/lib/data/sources/source-config"

const sourceDefinition = getSourceDefinition("demonicscans")

// DemonicScans has no full paginated catalog, so it is a search + chapter-merge
// source (no `catalog`). The Comick chapters API returns the complete list with
// real dates, and the generic detail/synopsis/genre extractor handles its pages.
// Chapter pages now load from mangareadon.org (older titles may still use the
// demoniclibs CDN), reached after the chapter URL's redirect, which fetch follows.
export const demonicScansSource = createComickSourceAdapter({
  definition: sourceDefinition,
  buildMangaUrl: (slug, baseUrl) => new URL(`/manga/${slug}`, baseUrl).toString(),
  buildSearchPreviewsFromResults: true,
  chapterImagePatterns: [
    /^https:\/\/mangareadon\.org\/.+\.(?:jpg|jpeg|png|webp)/i,
    /^https:\/\/cdn\.demoniclibs\.com\/.+\.(?:jpg|jpeg|png|webp)/i,
  ],
})
