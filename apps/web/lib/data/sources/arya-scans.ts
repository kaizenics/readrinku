import "server-only"

import { createComickSourceAdapter } from "@/lib/data/sources/create-comick-source-adapter"
import { getSourceDefinition } from "@/lib/data/sources/source-config"

const sourceDefinition = getSourceDefinition("arya-scans")

export const aryaScansSource = createComickSourceAdapter({
  definition: sourceDefinition,
  titleSuffixPattern: /\s+[^A-Za-z0-9]+BrainRotComics$/i,
  // Lightweight search keeps cross-source title matching (chapter merge) fast.
  buildSearchPreviewsFromResults: true,
  chapterImagePatterns: [
    /^https:\/\/brainrotcomics\.com\/wp-content\/uploads\/WP-manga\/data\/.+\.(?:jpg|jpeg|png|webp)$/i,
  ],
})
