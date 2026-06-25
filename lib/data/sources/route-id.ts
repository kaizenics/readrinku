import {
  DEFAULT_SOURCE_ID,
  getSourceRouteCode,
  resolveSourceRouteCode,
} from "@/lib/data/sources/source-config"

const SOURCE_ROUTE_SEPARATOR = "~"

// Marks a base64url-wrapped source slug. Some upstreams hand back percent-
// escaped slugs (e.g. `One-Piece-%25252D-Digital-Colored-Comics`, a hyphen
// encoded several times over). Dropped straight into a `/manga/<id>` URL, the
// router decodes the route param once, silently stripping an encoding layer, so
// the slug we rebuild the source URL from no longer matches and the detail /
// chapter fetch returns nothing. Wrapping such slugs in base64url (whose
// alphabet is URL-safe) makes the id survive the round-trip byte-for-byte.
const ENCODED_SLUG_MARKER = "b64."

// A slug is route-safe when it passes through a URL path segment unchanged — no
// percent-escapes or reserved characters the router would re-encode or decode.
function isRouteSafeSlug(slug: string) {
  return /^[A-Za-z0-9._-]+$/.test(slug) && !slug.startsWith(ENCODED_SLUG_MARKER)
}

function toBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value)
  let binary = ""
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function fromBase64Url(value: string) {
  const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/"))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new TextDecoder().decode(bytes)
}

function encodeSlugSegment(slug: string) {
  return isRouteSafeSlug(slug)
    ? slug
    : `${ENCODED_SLUG_MARKER}${toBase64Url(slug)}`
}

function decodeSlugSegment(segment: string) {
  if (!segment.startsWith(ENCODED_SLUG_MARKER)) {
    return segment
  }

  try {
    return fromBase64Url(segment.slice(ENCODED_SLUG_MARKER.length))
  } catch {
    return segment
  }
}

export function encodeSourceMangaSlug(sourceId: string, sourceSlug: string) {
  const segment = encodeSlugSegment(sourceSlug)

  // The default source uses clean, prefix-less URLs (e.g. /manga/101124-title).
  // Other sources keep a short prefix because their sites return a page for any
  // slug, so a bare slug can't be reliably attributed back to them. `decode`
  // already maps a prefix-less slug to the default source, so this round-trips.
  if (sourceId === DEFAULT_SOURCE_ID) {
    return segment
  }

  // Use a short non-branded code (not the source's real name) in the URL.
  return `${getSourceRouteCode(sourceId)}${SOURCE_ROUTE_SEPARATOR}${segment}`
}

export function decodeSourceMangaSlug(value: string) {
  const separatorIndex = value.indexOf(SOURCE_ROUTE_SEPARATOR)

  if (separatorIndex === -1) {
    return {
      sourceId: DEFAULT_SOURCE_ID,
      sourceSlug: decodeSlugSegment(value),
    }
  }

  const prefix = value.slice(0, separatorIndex)
  // Accept the short route code (new) or the raw source id (older ids).
  const sourceId = prefix ? resolveSourceRouteCode(prefix) : DEFAULT_SOURCE_ID
  const sourceSlug = decodeSlugSegment(value.slice(separatorIndex + 1)) || value

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
