export interface SourceImageRemotePattern {
  protocol?: "http" | "https"
  hostname: string
  port?: string
  pathname?: string
  search?: string
}

export interface SourceDefinition {
  id: string
  name: string
  label: string
  baseUrl: string
  imageRemotePatterns: SourceImageRemotePattern[]
}

export const sourceDefinitions: readonly SourceDefinition[] = [
  {
    id: "kaliscan",
    name: "KaliScan",
    label: "Live catalog",
    baseUrl: "https://kaliscan.com",
    imageRemotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.1stmangago.com",
        pathname: "/**",
      },
      // Chapter pages are served from rotating, signed proxy hosts
      // (e.g. s1/s4.1stmggv7.xyz). Omitting `search` allows the signed
      // `?acc=...&expires=...` query string the optimizer needs.
      {
        protocol: "https",
        hostname: "**.1stmggv7.xyz",
        pathname: "/**",
      },
    ],
  },
  {
    id: "arya-scans",
    name: "Arya Scans",
    label: "Live catalog",
    baseUrl: "https://brainrotcomics.com",
    imageRemotePatterns: [
      {
        protocol: "https",
        hostname: "brainrotcomics.com",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        pathname: "/attachments/**",
      },
    ],
  },
  {
    id: "demonicscans",
    name: "DemonicScans",
    label: "Live source",
    baseUrl: "https://demonicscans.org",
    imageRemotePatterns: [
      // Covers
      {
        protocol: "https",
        hostname: "readermc.org",
        pathname: "/**",
      },
      // Chapter pages (current CDN)
      {
        protocol: "https",
        hostname: "mangareadon.org",
        pathname: "/**",
      },
      // Legacy chapter CDN, kept as a fallback
      {
        protocol: "https",
        hostname: "cdn.demoniclibs.com",
        pathname: "/**",
      },
    ],
  },
]

export const DEFAULT_SOURCE_ID = sourceDefinitions[0].id

// Short, non-branded codes used in /manga route ids so a source's real name is
// never exposed in URLs (the default source stays prefix-less). Stable per
// source; `resolveSourceRouteCode` also accepts the raw source id, so links and
// saved ids minted before this scheme still resolve.
const sourceRouteCodes: Record<string, string> = {
  "arya-scans": "s1",
  demonicscans: "s2",
}

const sourceIdsByRouteCode: Record<string, string> = Object.fromEntries(
  Object.entries(sourceRouteCodes).map(([sourceId, code]) => [code, sourceId])
)

export function getSourceRouteCode(sourceId: string) {
  return sourceRouteCodes[sourceId] ?? sourceId
}

export function resolveSourceRouteCode(code: string) {
  return sourceIdsByRouteCode[code] ?? code
}

export function getSourceDefinition(sourceId: string) {
  return (
    sourceDefinitions.find((definition) => definition.id === sourceId) ??
    sourceDefinitions[0]
  )
}

// Hosts for external metadata images (MyAnimeList covers via Jikan) that are not
// tied to a single source.
const metadataImageRemotePatterns: readonly SourceImageRemotePattern[] = [
  {
    protocol: "https",
    hostname: "cdn.myanimelist.net",
    pathname: "/**",
  },
]

export function getSourceImageRemotePatterns() {
  return [
    ...sourceDefinitions.flatMap((definition) => definition.imageRemotePatterns),
    ...metadataImageRemotePatterns,
  ]
}

function hostnameMatches(pattern: string, hostname: string) {
  if (pattern.startsWith("**.")) {
    // `**.example.com` matches example.com and any subdomain depth.
    return hostname === pattern.slice(3) || hostname.endsWith(pattern.slice(2))
  }

  if (pattern.startsWith("*.")) {
    return (
      hostname.endsWith(pattern.slice(1)) &&
      hostname.split(".").length === pattern.split(".").length
    )
  }

  return hostname === pattern
}

// True only when the URL's host is allowed by next/image `remotePatterns`.
// Used to drop covers from unexpected hosts (e.g. a source's generic OG
// fallback image) before they reach next/image, which throws on render for an
// unconfigured host and would crash the whole page.
export function isConfiguredImageUrl(value: string | null | undefined) {
  if (!value) {
    return false
  }

  try {
    const { hostname, protocol } = new URL(value)

    if (protocol !== "https:" && protocol !== "http:") {
      return false
    }

    return getSourceImageRemotePatterns().some((pattern) =>
      hostnameMatches(pattern.hostname, hostname)
    )
  } catch {
    return false
  }
}
