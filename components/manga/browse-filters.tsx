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
    updateParams({ q: deferredQuery })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferredQuery])

  const hasActiveFilters =
    Boolean(initial.q) ||
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
            Search the source and keep the query in the URL without leaving the page.
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
                <SelectItem value="chapters">Most chapters</SelectItem>
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
