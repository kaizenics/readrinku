import Image from "next/image"
import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { SourceMangaPreview } from "@/lib/types/readrinku"

export function TrendingManga({ manga }: { manga: SourceMangaPreview[] }) {
  if (!manga.length) {
    return null
  }

  return (
    <Card className="border bg-card/80">
      <CardHeader className="border-b">
        <CardTitle className="text-2xl font-semibold tracking-tight">More to read</CardTitle>
        <CardDescription>Additional live picks readers can jump into next.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {manga.map((entry) => (
          <Link
            key={entry.id}
            href={`/manga/${entry.id}`}
            className="flex items-start gap-3 rounded-md border p-2 transition-colors hover:bg-muted/40"
          >
            <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
              {entry.image ? (
                <Image
                  src={entry.image}
                  alt={entry.title}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              ) : null}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="line-clamp-2 font-heading text-sm font-medium">{entry.title}</p>
              <p className="text-muted-foreground">{entry.lastChapterLabel}</p>
              <p className="truncate text-muted-foreground">
                {entry.genres.slice(0, 2).join(" / ")}
              </p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
