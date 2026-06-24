import { LiveMangaCard } from "@/components/manga/live-manga-card"
import type { SourceMangaPreview } from "@/lib/types/readrinku"

export function LiveMangaShelf({
  title,
  description,
  manga,
}: {
  title?: string
  description?: string
  manga: SourceMangaPreview[]
}) {
  return (
    <section className="flex flex-col gap-5">
      {title || description ? (
        <div className="flex flex-col gap-1">
          {title ? (
            <h2 className="font-heading text-2xl font-semibold tracking-tight">{title}</h2>
          ) : null}
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3 xl:gap-4">
        {manga.map((entry) => (
          <LiveMangaCard key={entry.id} manga={entry} />
        ))}
      </div>
    </section>
  )
}
