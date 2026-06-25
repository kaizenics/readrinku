import { ImageResponse } from "next/og"

import { getMangaInfoBySlug } from "@/lib/data/manga-info"
import { siteConfig } from "@/lib/seo"

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const result = await getMangaInfoBySlug(slug)

  const title = result?.display.title ?? "Comic details"
  const genres = result?.display.genres.slice(0, 3).join(" • ") ?? "Read comics online"
  const synopsis =
    result?.manga.synopsis.slice(0, 180).trimEnd() ??
    "Browse titles, chapters, and reading details inside ReadRinku."

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(140deg, rgb(17, 24, 39) 0%, rgb(48, 76, 122) 52%, rgb(232, 214, 178) 100%)",
          color: "white",
          padding: "56px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "24px",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              opacity: 0.82,
            }}
          >
            {siteConfig.name}
          </div>
          <div style={{ fontSize: "24px", opacity: 0.82 }}>{genres}</div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "22px",
            maxWidth: "920px",
          }}
        >
          <div style={{ fontSize: "76px", lineHeight: 1.04, fontWeight: 700 }}>
            {title}
          </div>
          <div style={{ fontSize: "28px", lineHeight: 1.35, opacity: 0.88 }}>
            {synopsis}
          </div>
        </div>

        <div style={{ fontSize: "24px", opacity: 0.82 }}>
          Browse chapters and reading details on {siteConfig.name}
        </div>
      </div>
    ),
    size
  )
}
