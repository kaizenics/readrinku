import { FeaturedManga } from "@/components/manga/featured-manga"
import { LiveMangaShelf } from "@/components/manga/live-manga-shelf"
import {
  getArchiveSourceManga,
  getFeaturedSourceManga,
  getRecentSourceManga,
  getSpotlightSourceManga,
} from "@/lib/data/source"

export default async function HomePage() {
  const [featured, latest, spotlight, archive] = await Promise.all([
    getFeaturedSourceManga(10),
    getRecentSourceManga(6),
    getSpotlightSourceManga(6),
    getArchiveSourceManga(6),
  ])

  return (
    <div className="page-frame flex flex-col gap-10 py-8 sm:py-10">
      <FeaturedManga manga={featured} />
      <LiveMangaShelf
        title="Latest from Brainrot Comics"
        description="Fresh titles and chapter updates pulled from the selected Arya Scans source."
        manga={latest}
      />
      <LiveMangaShelf
        title="Source spotlight"
        description="A second slice of live Arya Scans titles for discovery."
        manga={spotlight}
      />
      <LiveMangaShelf
        title="More from the source"
        description="Additional Brainrot Comics series discovered from the source homepage."
        manga={archive}
      />
    </div>
  )
}
