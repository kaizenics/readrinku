import { DEFAULT_SOURCE_ID } from "@/lib/data/sources/source-config"

const SOURCE_ROUTE_SEPARATOR = "~"

export function encodeSourceMangaSlug(sourceId: string, sourceSlug: string) {
  // The default source uses clean, prefix-less URLs (e.g. /manga/101124-title).
  // Other sources keep a short prefix because their sites return a page for any
  // slug, so a bare slug can't be reliably attributed back to them. `decode`
  // already maps a prefix-less slug to the default source, so this round-trips.
  if (sourceId === DEFAULT_SOURCE_ID) {
    return sourceSlug
  }

  return `${sourceId}${SOURCE_ROUTE_SEPARATOR}${sourceSlug}`
}

export function decodeSourceMangaSlug(value: string) {
  const separatorIndex = value.indexOf(SOURCE_ROUTE_SEPARATOR)

  if (separatorIndex === -1) {
    return {
      sourceId: DEFAULT_SOURCE_ID,
      sourceSlug: value,
    }
  }

  const sourceId = value.slice(0, separatorIndex) || DEFAULT_SOURCE_ID
  const sourceSlug = value.slice(separatorIndex + 1) || value

  return { sourceId, sourceSlug }
}

export function isSameSourceMangaId(left: string, right: string) {
  if (left === right) {
    return true
  }

  const leftValue = decodeSourceMangaSlug(left)
  const rightValue = decodeSourceMangaSlug(right)

  return (
    leftValue.sourceId === rightValue.sourceId &&
    leftValue.sourceSlug === rightValue.sourceSlug
  )
}
