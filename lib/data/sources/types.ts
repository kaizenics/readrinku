import type {
  MangaPage,
  SourceMangaInfo,
  SourceMangaPreview,
} from "@/lib/types/readrinku"
import type { SourceDefinition } from "@/lib/data/sources/source-config"

export interface SourceBrowseFilters {
  q?: string
  sort?: string
  limit?: number
  page?: number
}

export interface SourceBrowseResult {
  items: SourceMangaPreview[]
  total: number
}

export interface SourceCatalogCapability {
  pageSize: number
}

export interface SourceAdapter {
  definition: SourceDefinition
  getHomepageManga(limit?: number): Promise<SourceMangaPreview[]>
  browse(filters?: SourceBrowseFilters): Promise<SourceBrowseResult>
  getMangaInfoBySlug(slug: string): Promise<SourceMangaInfo | null>
  getChapterPages(chapterUrl: string): Promise<MangaPage[]>
  catalog?: SourceCatalogCapability
}
