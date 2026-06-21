import { FeaturedManga } from "@/components/manga/featured-manga"
import { LiveMangaShelf } from "@/components/manga/live-manga-shelf"
import {
  getCompletedMangadexManga,
  getFeaturedMangadexManga,
  getPopularMangadexManga,
  getRecentMangadexManga,
} from "@/lib/data/mangadex"

export default async function HomePage() {
  const [featured, recentlyUpdated, popular, completed] = await Promise.all([
    getFeaturedMangadexManga(8),
    getRecentMangadexManga(6),
    getPopularMangadexManga(6),
    getCompletedMangadexManga(6),
  ])

  return (
    <div className="page-frame flex flex-col gap-10 py-8 sm:py-10">
      <FeaturedManga manga={featured} />
      <LiveMangaShelf
        title="Recently updated"
        description="Live releases from the official MangaDex API."
        manga={recentlyUpdated}
      />
      <LiveMangaShelf
        title="Popular right now"
        description="Popular titles ranked from MangaDex discovery data."
        manga={popular}
      />
      <LiveMangaShelf
        title="Completed manga"
        description="Finished titles you can jump into right away."
        manga={completed}
      />
    </div>
  )
}
