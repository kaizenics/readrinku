import type { Metadata } from "next"

import { HistoryList } from "@/components/manga/history-list"
import { mangaRepository } from "@/lib/data/manga-repository"
import { buildNoIndexMetadata } from "@/lib/seo"

export const metadata: Metadata = buildNoIndexMetadata({
  title: "History",
  description:
    "Review your local ReadRinku reading history and jump back into recently opened chapters.",
  path: "/history",
})

export default async function HistoryPage() {
  const manga = await mangaRepository.getAll()

  return (
    <div className="page-frame flex flex-col gap-8 py-8 sm:py-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">History</h1>
        <p className="text-sm text-muted-foreground">
          Reading activity is ordered chronologically with quick resume actions.
        </p>
      </div>
      <HistoryList manga={manga} />
    </div>
  )
}
