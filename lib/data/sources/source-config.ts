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
]

export const DEFAULT_SOURCE_ID = sourceDefinitions[0].id

export function getSourceDefinition(sourceId: string) {
  return (
    sourceDefinitions.find((definition) => definition.id === sourceId) ??
    sourceDefinitions[0]
  )
}

export function getSourceImageRemotePatterns() {
  return sourceDefinitions.flatMap((definition) => definition.imageRemotePatterns)
}
