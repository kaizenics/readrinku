"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowRightIcon, MagnifyingGlassIcon } from "@phosphor-icons/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { RemoteCoverImage } from "@/components/manga/remote-cover-image"
import { confirmAdult, useAdultConfirmed } from "@/components/manga/adult-consent"
import { mangaStatusLabels } from "@/lib/readrinku"
import { cn } from "@/lib/utils"
import type { MangaStatus } from "@/lib/types/readrinku"

type Suggestion = {
  id: string
  title: string
  image: string | null
  chapterCount: number
  status: MangaStatus
  genre: string | null
  isAdult: boolean
}

type SuggestResponse = {
  items: Suggestion[]
  total: number
}

const MIN_QUERY_LENGTH = 2
const DEBOUNCE_MS = 300

export function HeaderSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const confirmed = useAdultConfirmed()

  const currentQuery = pathname === "/browse" ? (searchParams.get("q") ?? "") : ""
  const [query, setQuery] = useState(currentQuery)
  const [results, setResults] = useState<Suggestion[]>([])
  const [total, setTotal] = useState(0)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  // Single shared age-gate dialog, reused for whichever gated row was clicked.
  const [gateOpen, setGateOpen] = useState(false)
  const [pending, setPending] = useState<{ href: string; title: string } | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)

  const trimmed = query.trim()
  const browseHref = `/browse?q=${encodeURIComponent(trimmed)}`
  // Only surface the dropdown once there are results — no "Searching…" or empty
  // state, so it simply appears when matches are ready and stays hidden otherwise.
  const showDropdown = open && results.length > 0

  // Debounced two-phase typeahead fetch. Phase 1 is the cheap source matches,
  // shown instantly; phase 2 (`enrich=1`) overlays MyAnimeList covers + genres
  // and patches the rows in place. The in-flight requests are aborted whenever
  // the query changes, so only the latest keystroke's results ever land. State
  // is only written from the timer/async callbacks (never synchronously in the
  // effect body); the too-short case is cleared in the change handler instead.
  useEffect(() => {
    if (trimmed.length < MIN_QUERY_LENGTH) {
      return
    }

    const controller = new AbortController()
    const query = encodeURIComponent(trimmed)
    const timer = setTimeout(() => {
      fetch(`/api/search-suggest?q=${query}`, { signal: controller.signal })
        .then((res) =>
          res.ok ? res.json() : Promise.reject(new Error("Search failed"))
        )
        .then((data: SuggestResponse) => {
          setResults(data.items)
          setTotal(data.total)
          setActiveIndex(-1)

          // Phase 2: enrich the same rows. The source search is now cached, so
          // this mostly waits on MyAnimeList. A failure here is non-fatal — the
          // fast matches stay on screen.
          return fetch(`/api/search-suggest?q=${query}&enrich=1`, {
            signal: controller.signal,
          })
        })
        .then((res) => (res?.ok ? res.json() : null))
        .then((data: SuggestResponse | null) => {
          if (data) {
            setResults(data.items)
            setTotal(data.total)
          }
        })
        .catch(() => {
          if (controller.signal.aborted) {
            return
          }
          setResults([])
          setTotal(0)
        })
    }, DEBOUNCE_MS)

    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [trimmed])

  // Close the dropdown on any pointer interaction outside the search box. This
  // also covers clicking another header link, so a separate route-change effect
  // is unnecessary (and explicit navigations below close it directly).
  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [])

  function onQueryChange(value: string) {
    setQuery(value)
    setOpen(true)

    // Clear stale rows once the query is too short to search; the dropdown only
    // shows while there are results, so this also hides it.
    if (value.trim().length < MIN_QUERY_LENGTH) {
      setResults([])
      setTotal(0)
    }
  }

  function go(manga: Suggestion) {
    setOpen(false)
    const href = `/manga/${manga.id}`

    // Mirror the listing cards: intercept gated titles and confirm age first.
    if (manga.isAdult && !confirmed) {
      setPending({ href, title: manga.title })
      setGateOpen(true)
      return
    }

    router.push(href)
  }

  function acceptGate() {
    confirmAdult()
    setGateOpen(false)
    if (pending) {
      router.push(pending.href)
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false)
      setActiveIndex(-1)
      return
    }

    if (!showDropdown || results.length === 0) {
      return
    }

    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((index) => Math.min(index + 1, results.length - 1))
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, -1))
      return
    }

    // Enter on a highlighted row opens that title; otherwise the form submits
    // and falls through to the full /browse results page.
    if (event.key === "Enter" && activeIndex >= 0 && activeIndex < results.length) {
      event.preventDefault()
      go(results[activeIndex])
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        action="/browse"
        role="search"
        className="w-full"
        onSubmit={() => setOpen(false)}
      >
        <InputGroup className="h-10">
          <InputGroupAddon>
            <MagnifyingGlassIcon />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            name="q"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder="Search comics or webtoons"
            aria-label="Search comics or webtoons"
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            role="combobox"
            autoComplete="off"
            className="text-sm md:text-sm"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton type="submit" variant="ghost" size="sm" aria-label="Search">
              Search
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>

      {showDropdown ? (
        <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-xl">
          <ul className="max-h-[70vh] overflow-y-auto py-1">
            {results.map((manga, index) => {
              const gated = manga.isAdult && !confirmed
              const meta = [
                manga.genre,
                mangaStatusLabels[manga.status],
                manga.chapterCount > 0 ? `${manga.chapterCount} ch` : null,
              ].filter(Boolean)

              return (
                <li key={manga.id}>
                  <button
                    type="button"
                    onClick={() => go(manga)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors",
                      index === activeIndex ? "bg-muted" : "hover:bg-muted/60"
                    )}
                  >
                    <span className="relative block h-16 w-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                      <RemoteCoverImage
                        src={manga.image}
                        alt={manga.title}
                        sizes="48px"
                        imageClassName={cn(gated && "scale-110 blur-md")}
                        fallbackLabel={manga.title}
                      />
                      {gated ? (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-[10px] font-bold text-white">
                          18+
                        </span>
                      ) : null}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="truncate text-sm font-medium text-foreground">
                        {manga.title}
                      </span>
                      {meta.length > 0 ? (
                        <span className="truncate text-xs text-muted-foreground">
                          {meta.join(" · ")}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          <Link
            href={browseHref}
            onClick={() => setOpen(false)}
            className="flex items-center justify-between gap-2 border-t px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
          >
            <span>View all results{total > 0 ? ` (${total})` : ""}</span>
            <ArrowRightIcon />
          </Link>
        </div>
      ) : null}

      {pending ? (
        <AlertDialog open={gateOpen} onOpenChange={setGateOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Adult content ahead</AlertDialogTitle>
              <AlertDialogDescription>
                “{pending.title}” is an 18+ title. Please confirm you are 18 years or
                older to continue.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No, take me back</AlertDialogCancel>
              <AlertDialogAction onClick={acceptGate}>Yes, I am 18+</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </div>
  )
}
