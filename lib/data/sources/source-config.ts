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
    label: "DemonicScans",
    baseUrl: "https://demonicscans.org",
    imageRemotePatterns: [
      {
        protocol: "https",
        hostname: "readermc.org",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "cdn.demoniclibs.com",
        pathname: "/**",
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
