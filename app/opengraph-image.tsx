import { ImageResponse } from "next/og"

import { siteConfig } from "@/lib/seo"

export const alt = `${siteConfig.name} manga reader preview`
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default function OpenGraphImage() {
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
            "linear-gradient(135deg, rgb(19, 28, 38) 0%, rgb(30, 56, 88) 55%, rgb(244, 236, 214) 100%)",
          color: "white",
          padding: "56px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255, 255, 255, 0.12)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              fontSize: "34px",
            }}
          >
            RR
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div style={{ fontSize: "24px", opacity: 0.88 }}>Online manga reader</div>
            <div style={{ fontSize: "42px", fontWeight: 700 }}>{siteConfig.name}</div>
          </div>
        </div>

        <div
          style={{
            maxWidth: "860px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div style={{ fontSize: "64px", lineHeight: 1.05, fontWeight: 700 }}>
            Browse live titles, open chapters, and keep your reading flow calm.
          </div>
          <div style={{ fontSize: "28px", lineHeight: 1.35, opacity: 0.88 }}>
            Discovery, chapter browsing, and local reading progress in one cleaner
            interface.
          </div>
        </div>

        <div style={{ fontSize: "22px", opacity: 0.8 }}>
          readrinku.dev
        </div>
      </div>
    ),
    size
  )
}
