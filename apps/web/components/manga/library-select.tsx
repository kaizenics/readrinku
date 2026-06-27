"use client"

import { BookmarkSimpleIcon, CaretDownIcon } from "@phosphor-icons/react"
import { toast } from "sonner"

import { useReadRinku } from "@/components/providers/read-rinku-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { isSameSourceMangaId } from "@/lib/data/sources/route-id"
import { libraryStatusLabels } from "@/lib/readrinku"
import type { LibraryStatus } from "@/lib/types/readrinku"

const statuses: LibraryStatus[] = ["reading", "planned", "completed", "bookmarked"]

export function LibrarySelect({ mangaId }: { mangaId: string }) {
  const { library, setLibraryStatus } = useReadRinku()

  const currentValue = library.find((entry) =>
    isSameSourceMangaId(entry.mangaId, mangaId)
  )?.status
  const currentLabel = currentValue ? libraryStatusLabels[currentValue] : "Not saved"

  function handleValueChange(value: string) {
    if (value === "none") {
      setLibraryStatus(mangaId)
      toast.success("Removed from your library.")
      return
    }

    setLibraryStatus(mangaId, value as LibraryStatus)
    toast.success(`Saved to ${libraryStatusLabels[value as LibraryStatus]}.`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="min-h-11 w-full justify-between px-3 sm:w-[13rem]"
        >
          <span className="inline-flex min-w-0 items-center gap-2">
            <BookmarkSimpleIcon data-icon="inline-start" />
            <span className="truncate">Library</span>
          </span>
          <span className="inline-flex min-w-0 items-center gap-2 text-muted-foreground">
            <span className="truncate">{currentLabel}</span>
            <CaretDownIcon data-icon="inline-end" />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[13rem]">
        <DropdownMenuLabel>Save this title</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={currentValue ?? "none"}
          onValueChange={handleValueChange}
        >
          <DropdownMenuRadioItem value="none">Not saved</DropdownMenuRadioItem>
          {statuses.map((status) => (
            <DropdownMenuRadioItem key={status} value={status}>
              {libraryStatusLabels[status]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
