"use client"

import { MagnifyingGlassIcon } from "@phosphor-icons/react"
import { useDeferredValue, useEffect, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function BrowseFilters({
  genres,
  initial,
}: {
  genres: string[]
  initial: {
    q: string
    genre: string
    status: string
    rating: string
    sort: string
  }
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState(initial.q)
  const deferredQuery = useDeferredValue(query)

  function updateParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(next).forEach(([key, value]) => {
      if (!value) {
        params.delete(key)
        return
      }

      params.set(key, value)
    })

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  useEffect(() => {
    updateParams({ q: deferredQuery })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferredQuery])

  return (
    <div className="quiet-panel rounded-xl p-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_repeat(4,minmax(0,0.7fr))]">
        <InputGroup>
          <InputGroupAddon>
            <MagnifyingGlassIcon />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search title, mood, or genre"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </InputGroup>

        <Select
          value={initial.genre || "all"}
          onValueChange={(value) => updateParams({ genre: value === "all" ? "" : value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Genre" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All genres</SelectItem>
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={initial.status || "all"}
          onValueChange={(value) => updateParams({ status: value === "all" ? "" : value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="hiatus">Hiatus</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={initial.rating || "all"}
          onValueChange={(value) => updateParams({ rating: value === "all" ? "" : value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All ratings</SelectItem>
              <SelectItem value="everyone">Everyone</SelectItem>
              <SelectItem value="teen">Teen</SelectItem>
              <SelectItem value="mature">Mature</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={initial.sort}
          onValueChange={(value) => updateParams({ sort: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="updated">Recently updated</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="chapters">Chapter count</SelectItem>
              <SelectItem value="continue">Continue reading</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {isPending ? "Refreshing results..." : "Filters stay in the URL for easy sharing."}
      </p>
    </div>
  )
}
