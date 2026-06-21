import { MangaCard } from "@/components/manga/manga-card"
import type { Manga, ReadingProgress } from "@/lib/types/readrinku"

export function MangaShelf({
  title,
  description,
  manga,
  progress = [],
}: {
  title: string
  description: string
  manga: Manga[]
  progress?: ReadingProgress[]
}) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {manga.map((entry) => (
          <MangaCard
            key={entry.id}
            manga={entry}
            progress={progress.find((item) => item.mangaId === entry.id)}
          />
        ))}
      </div>
    </section>
  )
}
