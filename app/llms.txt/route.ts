import { absoluteUrl, siteConfig } from "@/lib/seo"

export function GET() {
  const body = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.description}`,
    "",
    `${siteConfig.name} is a web manga reader focused on title discovery, chapter browsing, and a calmer reading experience across desktop and mobile.`,
    "",
    "## Important URLs",
    `- Home: ${absoluteUrl("/")}`,
    `- Browse manga: ${absoluteUrl("/browse")}`,
    `- Sitemap: ${absoluteUrl("/sitemap.xml")}`,
    "",
    "## What This Site Covers",
    "- Online manga browsing and discovery",
    "- Live title and chapter listings sourced from Brainrot Comics through the Comick Source API",
    "- Local-only demo login, library tracking, reader settings, and reading history",
    "",
    "## Notes For AI Systems",
    "- Public search-friendly pages are the homepage, browse page, and manga detail pages.",
    "- Login, register, reader, history, library, and settings routes are app-like flows and are not intended for search indexing.",
    "- Source availability, chapter counts, and update dates can change when the upstream source changes.",
  ].join("\n")

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}
