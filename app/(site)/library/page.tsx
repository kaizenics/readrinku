import { LibraryBoard } from "@/components/manga/library-board"
import { mangaRepository } from "@/lib/data/manga-repository"

export default async function LibraryPage() {
  const manga = await mangaRepository.getAll()

  return (
    <div className="page-frame flex flex-col gap-8 py-8 sm:py-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Library</h1>
        <p className="text-sm text-muted-foreground">
          Titles are grouped by reading intent and saved locally in your browser.
        </p>
      </div>
      <LibraryBoard manga={manga} />
    </div>
  )
}
