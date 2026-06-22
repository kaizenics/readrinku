import type { Metadata } from "next"

import { JsonLd } from "@/components/seo/json-ld"
import { FeaturedManga } from "@/components/manga/featured-manga"
import { LiveMangaShelf } from "@/components/manga/live-manga-shelf"
import {
  getArchiveSourceManga,
  getFeaturedSourceManga,
  getRecentSourceManga,
  getSpotlightSourceManga,
} from "@/lib/data/source"
import {
  absoluteUrl,
  buildMetadata,
  createOrganizationSchema,
  createWebsiteSchema,
} from "@/lib/seo"

export const metadata: Metadata = buildMetadata({
  title: "Online Manga Reader and Manga Discovery",
  description:
    "Browse live manga titles, open available chapters, and track local reading progress with a cleaner online manga reader built for calmer reading sessions.",
  path: "/",
  keywords: [
    "manga homepage",
    "manga discovery platform",
    "online manga browsing",
    "read manga chapters",
  ],
})

export default async function HomePage() {
  const [featured, latest, spotlight, archive] = await Promise.all([
    getFeaturedSourceManga(10),
    getRecentSourceManga(6),
    getSpotlightSourceManga(6),
    getArchiveSourceManga(6),
  ])

  const featuredItems = featured.slice(0, 8).map((entry, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: entry.title,
    url: absoluteUrl(`/manga/${entry.id}`),
  }))

  const homepageSchema = [
    createOrganizationSchema(),
    createWebsiteSchema(),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "ReadRinku homepage",
      description:
        "Homepage for browsing featured manga, recent updates, and current manga discovery inside ReadRinku.",
      url: absoluteUrl("/"),
      about: ["manga reader", "manga discovery", "browse manga online"],
      mainEntity: {
        "@type": "ItemList",
        name: "Featured manga",
        itemListElement: featuredItems,
      },
    },
  ]

  return (
    <>
      <JsonLd data={homepageSchema} />
      <section className="bg-[#05070b]">
        <header
          className="relative h-[60vh] overflow-hidden"
          style={{
            backgroundImage: "url('/manhwa.png')",
            backgroundPosition: "center 20%",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        >
          <div className="absolute inset-0 bg-black/38" />
          <div className="absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-[#05070b] via-[#05070b]/78 to-transparent" />
          <div className="relative z-10 flex h-full items-end">
            <div className="page-frame w-full pb-12 sm:pb-16 lg:pb-20">
              <div className="max-w-4xl space-y-4">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-100/82">
                  Online manga reader
                </p>
                <h1 className="max-w-3xl font-heading text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Read manga online with a cleaner, calmer reading flow
                </h1>
                <p className="max-w-3xl text-base leading-8 text-white/74 sm:text-lg">
                  ReadRinku helps you browse live manga titles, open readable chapters,
                  and keep track of progress with a layout built for longer reading
                  sessions on desktop and mobile.
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="page-frame flex flex-col gap-10 py-8 sm:py-10">
          <FeaturedManga manga={featured} />
          <LiveMangaShelf
            title="Latest manga updates"
            description="Fresh manga titles and chapter updates for readers tracking what is new."
            manga={latest}
          />
          <LiveMangaShelf
            title="Source spotlight"
            description="More live manga picks surfaced for readers who want another slice of current releases."
            manga={spotlight}
          />
          <LiveMangaShelf
            title="More manga to explore"
            description="More live series surfaced for deeper browsing and quick chapter discovery."
            manga={archive}
          />
        </div>
      </section>
    </>
  )
}
