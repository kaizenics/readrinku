"use client"

import { FunnelSimpleIcon, MagnifyingGlassIcon } from "@phosphor-icons/react"
import { useDeferredValue, useEffect, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

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

  const hasActiveFilters =
    Boolean(initial.q) ||
    Boolean(initial.genre) ||
    Boolean(initial.status) ||
    Boolean(initial.rating) ||
    initial.sort !== "updated"

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="min-h-11 w-fit px-4">
          <FunnelSimpleIcon data-icon="inline-start" />
          Menu
          {hasActiveFilters ? (
            <span className="ml-1 inline-flex size-2 rounded-full bg-primary" aria-hidden />
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Browse filters</SheetTitle>
          <SheetDescription>
            Search and refine the manga list without leaving the page.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-3 px-6 pb-6">
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
            onValueChange={(value) =>
              updateParams({ genre: value === "all" ? "" : value })
            }
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
            onValueChange={(value) =>
              updateParams({ status: value === "all" ? "" : value })
            }
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
            onValueChange={(value) =>
              updateParams({ rating: value === "all" ? "" : value })
            }
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

          <p className="pt-1 text-xs text-muted-foreground">
            {isPending
              ? "Refreshing results..."
              : "Filters stay in the URL for easy sharing."}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
