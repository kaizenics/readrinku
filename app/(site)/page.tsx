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
  title: "",
  description:
    "Browse live titles from multiple sources, open available chapters, and track local reading progress with a cleaner online reader built for calmer reading sessions.",
  path: "/",
  keywords: [
    "comic homepage",
    "comic discovery platform",
    "online comic browsing",
    "read comic chapters",
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
        "Homepage for browsing featured comics, recent updates, and current comic discovery inside ReadRinku.",
      url: absoluteUrl("/"),
      about: ["comic reader", "comic discovery", "browse comics online"],
      mainEntity: {
        "@type": "ItemList",
        name: "Featured comics",
        itemListElement: featuredItems,
      },
    },
  ]

  return (
    <>
      {/* Preload the hero background (a CSS image, otherwise discovered late) so
          it lands as the LCP element faster. */}
      <link rel="preload" as="image" href="/manhwa.webp" fetchPriority="high" />
      <JsonLd data={homepageSchema} />
      <section className="bg-[#05070b]">
        <header
          className="relative h-[60vh] overflow-hidden"
          style={{
            backgroundImage: "url('/manhwa.webp')",
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
                <h1 className="max-w-3xl font-heading text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Read Your Favorites Online for Free without Ads
                </h1>
                <p className="max-w-3xl text-base leading-8 text-white/74 sm:text-lg">
                  Browse live titles from multiple sources, open available chapters, and track local reading progress.
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="page-frame flex flex-col gap-10 py-8 sm:py-10">
          <FeaturedManga manga={featured} />
          <LiveMangaShelf
            title="Latest comic updates"
            description="Fresh titles and chapter updates for readers tracking what is new."
            manga={latest}
          />
          <LiveMangaShelf
            title="Source spotlight"
            description="More live picks surfaced for readers who want another slice of current releases."
            manga={spotlight}
          />
          <LiveMangaShelf
            title="More comics to explore"
            description="More live series surfaced for deeper browsing and quick chapter discovery."
            manga={archive}
          />
        </div>
      </section>
    </>
  )
}
