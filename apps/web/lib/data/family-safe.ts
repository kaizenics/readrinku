import "server-only"

import { cookies } from "next/headers"

// "Family Safe" hides adult/mature titles from the browse, search, and genre
// listings (the homepage is already curated to be adult-free). It is stored in a
// cookie so server components can filter before rendering, and defaults to ON
// (safe) until the visitor turns it off.
export const FAMILY_SAFE_COOKIE = "family-safe"

export async function getFamilySafe(): Promise<boolean> {
  const store = await cookies()
  return store.get(FAMILY_SAFE_COOKIE)?.value !== "off"
}
