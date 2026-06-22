import type { Metadata } from "next"

import { JsonLd } from "@/components/seo/json-ld"
import { FeaturedManga } from "@/components/manga/featured-manga"
import { LiveMangaShelf } from "@/components/manga/live-manga-shelf"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getArchiveSourceManga,
  getFeaturedSourceManga,
  getRecentSourceManga,
  getSpotlightSourceManga,
} from "@/lib/data/source"
import {
  absoluteUrl,
  buildMetadata,
  createFaqSchema,
  createOrganizationSchema,
  createWebsiteSchema,
} from "@/lib/seo"

const homeFaqs = [
  {
    question: "What is ReadRinku?",
    answer:
      "ReadRinku is an online manga reader frontend designed for cleaner browsing, calmer reading sessions, and quick chapter discovery across desktop and mobile layouts.",
  },
  {
    question: "Where does ReadRinku get manga data?",
    answer:
      "ReadRinku pulls live title and chapter information from the Comick Source API with Brainrot Comics used as the primary source for homepage, browse, and manga detail content.",
  },
  {
    question: "Does ReadRinku save reading progress?",
    answer:
      "Yes. ReadRinku stores demo login details, reading history, library status, and reader preferences locally in your browser so you can pick up where you left off on the same device.",
  },
  {
    question: "Do I need an account to browse manga?",
    answer:
      "No. Public pages let you browse titles and manga details without signing in. The demo login and registration flows are only used for local reader preferences and saved progress.",
  },
] as const

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
    createFaqSchema([...homeFaqs]),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "ReadRinku homepage",
      description:
        "Homepage for browsing featured manga, recent updates, and source-based manga discovery inside ReadRinku.",
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
      <div className="page-frame flex flex-col gap-10 py-8 sm:py-10">
        <header className="max-w-4xl">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Online manga reader
            </p>
            <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
              Read manga online with a cleaner, calmer reading flow
            </h1>
            <p className="max-w-3xl text-base leading-8 text-muted-foreground">
              ReadRinku helps you browse live manga titles, open readable chapters,
              and keep track of progress with a layout built for longer reading
              sessions on desktop and mobile.
            </p>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="border bg-card/80">
            <CardHeader>
              <CardTitle className="text-lg font-semibold tracking-tight">
                Browse live manga updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              Fresh title cards and chapter updates are pulled from the configured
              source so you can discover new manga without bouncing between pages.
            </CardContent>
          </Card>
          <Card className="border bg-card/80">
            <CardHeader>
              <CardTitle className="text-lg font-semibold tracking-tight">
                Open readable chapters fast
              </CardTitle>
            </CardHeader>
            <CardContent>
              Title pages surface synopsis, chapter availability, and reading details
              in one place before you jump into the reader.
            </CardContent>
          </Card>
          <Card className="border bg-card/80">
            <CardHeader>
              <CardTitle className="text-lg font-semibold tracking-tight">
                Keep your progress local
              </CardTitle>
            </CardHeader>
            <CardContent>
              The demo reader stores your library, history, and reader preferences in
              the browser for a lighter app-like experience.
            </CardContent>
          </Card>
        </section>

        <FeaturedManga manga={featured} />
        <LiveMangaShelf
          title="Latest manga updates"
          description="Fresh manga titles and chapter updates pulled from the current Arya Scans source feed."
          manga={latest}
        />
        <LiveMangaShelf
          title="Source spotlight"
          description="More live manga picks surfaced for readers who want another slice of current releases."
          manga={spotlight}
        />
        <LiveMangaShelf
          title="More manga to explore"
          description="Additional Brainrot Comics series discovered from the source homepage for deeper browsing."
          manga={archive}
        />

        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Frequently asked questions
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Quick answers for readers comparing manga reading tools and deciding how
              ReadRinku works.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {homeFaqs.map((item) => (
              <Card key={item.question} className="border bg-card/80">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold tracking-tight">
                    {item.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-7 text-muted-foreground">
                  {item.answer}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
