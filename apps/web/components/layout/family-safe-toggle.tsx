"use client"

import { useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"

import { Switch } from "@/components/ui/switch"

// Family Safe is persisted in a cookie (so server components can filter adult
// titles before render). This client toggle reads/writes that cookie and, on
// change, refreshes the route so the server re-renders with the new filter.
const FAMILY_SAFE_COOKIE = "family-safe"
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function readEnabled() {
  try {
    return !document.cookie
      .split("; ")
      .includes(`${FAMILY_SAFE_COOKIE}=off`)
  } catch {
    return true
  }
}

function writeEnabled(enabled: boolean) {
  document.cookie = `${FAMILY_SAFE_COOKIE}=${enabled ? "on" : "off"}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`
  listeners.forEach((listener) => listener())
}

export function FamilySafeToggle() {
  const router = useRouter()
  // Default to ON during SSR/first paint; the real cookie value is read on the
  // client (useSyncExternalStore handles the hydration handoff cleanly).
  const enabled = useSyncExternalStore(subscribe, readEnabled, () => true)

  function onToggle(next: boolean) {
    writeEnabled(next)
    router.refresh()
  }

  return (
    <label
      className="flex cursor-pointer items-center gap-2 select-none"
      title={
        enabled
          ? "Family Safe is on — adult titles are hidden"
          : "Family Safe is off — adult titles are shown"
      }
    >
      <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
        Family Safe
      </span>
      <Switch
        checked={enabled}
        onCheckedChange={onToggle}
        aria-label="Family Safe — hide adult titles"
      />
    </label>
  )
}
