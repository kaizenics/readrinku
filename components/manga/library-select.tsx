"use client"

import { BookmarkSimpleIcon } from "@phosphor-icons/react"
import { toast } from "sonner"

import { useReadRinku } from "@/components/providers/read-rinku-provider"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { libraryStatusLabels } from "@/lib/readrinku"
import type { LibraryStatus } from "@/lib/types/readrinku"

const statuses: LibraryStatus[] = ["reading", "planned", "completed", "bookmarked"]

export function LibrarySelect({ mangaId }: { mangaId: string }) {
  const { library, setLibraryStatus } = useReadRinku()

  const currentValue = library.find((entry) => entry.mangaId === mangaId)?.status

  return (
    <Select
      value={currentValue ?? "none"}
      onValueChange={(value) => {
        if (value === "none") {
          setLibraryStatus(mangaId)
          toast.success("Removed from your library.")
          return
        }

        setLibraryStatus(mangaId, value as LibraryStatus)
        toast.success(`Saved to ${libraryStatusLabels[value as LibraryStatus]}.`)
      }}
    >
      <SelectTrigger size="default" className="w-full sm:w-48">
        <BookmarkSimpleIcon data-icon="inline-start" />
        <SelectValue placeholder="Save to library" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="none">Not saved</SelectItem>
          {statuses.map((status) => (
            <SelectItem key={status} value={status}>
              {libraryStatusLabels[status]}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
