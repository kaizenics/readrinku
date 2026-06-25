import type { Metadata } from "next"

const FALLBACK_SITE_URL = "https://readrinku.dev"

function normalizeSiteUrl(value: string | undefined) {
  if (!value?.trim()) {
    return FALLBACK_SITE_URL
  }

  try {
    return new URL(value).origin
  } catch {
    return FALLBACK_SITE_URL
  }
}

export const siteConfig = {
  name: "ReadRinku",
  shortName: "ReadRinku",
  description:
    "ReadRinku is a clean online comic reader for browsing live titles, opening available chapters, and tracking reading progress with a calmer reading flow.",
  locale: "en_US",
  category: "entertainment",
  siteUrl: normalizeSiteUrl(
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL
  ),
  keywords: [
    "online comic reader",
    "read comics online",
    "comic reader app",
    "comic discovery",
    "browse comic chapters",
    "track comic reading progress",
    "ReadRinku",
  ],
} as const

export const indexRobots: NonNullable<Metadata["robots"]> = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
}

export const noIndexRobots: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
    noimageindex: true,
  },
}

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return new URL(normalizedPath, siteConfig.siteUrl).toString()
}

export function resolveImageUrl(value?: string | null) {
  if (!value) {
    return absoluteUrl("/opengraph-image")
  }

  if (/^https?:\/\//i.test(value)) {
    return value
  }

  return absoluteUrl(value)
}

export function truncateDescription(value: string, maxLength = 160) {
  const normalized = value.replace(/\s+/g, " ").trim()

  if (normalized.length <= maxLength) {
    return normalized
  }

  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`
}

interface BuildMetadataInput {
  title?: string
  description?: string
  path?: string
  keywords?: string[]
  image?: string | null
  noIndex?: boolean
  type?: "website" | "article"
}

export function buildMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  keywords = [],
  image,
  noIndex = false,
  type = "website",
}: BuildMetadataInput = {}): Metadata {
  const hasTitle = Boolean(title?.trim())
  const resolvedTitle = hasTitle ? (title as string) : siteConfig.name
  // With a page title, let the root template render "Title | ReadRinku". Without
  // one (e.g. the homepage), emit the bare site name as an absolute title so it
  // shows just "ReadRinku" instead of "ReadRinku | ReadRinku" or " | ReadRinku".
  const documentTitle: Metadata["title"] = hasTitle
    ? resolvedTitle
    : { absolute: siteConfig.name }
  const resolvedDescription = truncateDescription(description)
  const resolvedImage = resolveImageUrl(image)

  return {
    title: documentTitle,
    description: resolvedDescription,
    applicationName: siteConfig.name,
    category: siteConfig.category,
    alternates: {
      canonical: path,
    },
    keywords: [...siteConfig.keywords, ...keywords],
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      url: path,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type,
      images: [
        {
          url: resolvedImage,
          width: 1200,
          height: 630,
          alt: resolvedTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDescription,
      images: [resolvedImage],
    },
    robots: noIndex ? noIndexRobots : indexRobots,
  }
}

export function buildNoIndexMetadata(
  input: Omit<BuildMetadataInput, "noIndex"> = {}
) {
  return buildMetadata({ ...input, noIndex: true })
}

export function createBreadcrumbSchema(
  items: Array<{ name: string; path: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function createFaqSchema(
  items: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }
}

export function createOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/readrinku-icon.png"),
  }
}

export function createWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: absoluteUrl("/"),
    description: siteConfig.description,
    inLanguage: "en-US",
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/browse")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  }
}
