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
  initial,
}: {
  initial: {
    q: string
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
    const currentQuery = searchParams.get("q") ?? ""

    // Only reset to page 1 when the search query actually changes. Without this
    // guard the effect also fires on mount / pagination and wipes ?page, which
    // snaps the user back to page 1.
    if (deferredQuery === currentQuery) {
      return
    }

    updateParams({ q: deferredQuery, page: "" })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferredQuery, searchParams])

  const hasActiveFilters =
    Boolean(initial.q) ||
    initial.sort !== "updated"

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card/70 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <InputGroup className="h-11 flex-1">
          <InputGroupAddon>
            <MagnifyingGlassIcon />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            placeholder="Search title, mood, or genre"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </InputGroup>

        <Select
          value={initial.sort}
          onValueChange={(value) => updateParams({ sort: value, page: "" })}
        >
          <SelectTrigger className="h-11 w-full lg:w-56">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="updated">Recently updated</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="chapters">Most chapters</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">
        {isPending
          ? "Refreshing results..."
          : hasActiveFilters
            ? "Search stays in the URL so you can reload or share results."
            : "Search by title, genre, or vibe to find something fast."}
      </p>
    </div>
  )
}
