import { ContinueReading } from "@/components/manga/continue-reading"
import { FeaturedManga } from "@/components/manga/featured-manga"
import { MangaShelf } from "@/components/manga/manga-shelf"
import { mangaRepository } from "@/lib/data/manga-repository"

export default async function HomePage() {
  const manga = await mangaRepository.getAll()
  const featured = manga.slice(0, 8)
  const recentlyUpdated = manga.slice(0, 4)
  const popular = manga.filter((entry) => entry.status === "ongoing").slice(0, 4)
  const completed = manga.filter((entry) => entry.status === "completed")

  return (
    <div className="page-frame flex flex-col gap-10 py-8 sm:py-10">
      <FeaturedManga manga={featured} />
      <ContinueReading manga={manga} />
      <MangaShelf
        title="Recently updated"
        description="Fresh placeholder updates with tidy metadata and consistent cover proportions."
        manga={recentlyUpdated}
      />
      <MangaShelf
        title="Popular right now"
        description="Discovery-first titles chosen to show the catalog structure and mobile spacing."
        manga={popular}
      />
      <MangaShelf
        title="Completed shelves"
        description="Finished stories for readers who prefer clean arcs and fast binge sessions."
        manga={completed}
      />
    </div>
  )
}
