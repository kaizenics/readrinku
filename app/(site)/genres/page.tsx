import type { Metadata } from "next"
import Link from "next/link"

import { mangaGenres } from "@/lib/genres"
import { buildMetadata } from "@/lib/seo"

export const metadata: Metadata = buildMetadata({
  title: "Genres",
  description:
    "Browse comics and webtoons by genre on ReadRinku — pick a category to read available chapters.",
  path: "/genres",
  keywords: ["comic genres", "webtoon genres", "browse comics by genre"],
})

// Mobile-friendly full listing of every genre. Desktop exposes the same set
// through the header's hover dropdown, so this page is linked from the mobile
// bottom navigation where that dropdown isn't available.
export default function GenresPage() {
  return (
    <div className="page-frame flex flex-col gap-8 py-8 sm:py-10">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Browse
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Genres</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Pick a genre to explore comics and webtoons from the live catalog.
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {mangaGenres.map((genre) => (
          <li key={genre.slug}>
            <Link
              href={`/genre/${genre.slug}`}
              className="flex min-h-12 items-center justify-between gap-2 rounded-lg border bg-card/60 px-4 py-3 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
            >
              <span>{genre.label}</span>
              {genre.adult ? (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  18+
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
