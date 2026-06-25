import type { Metadata } from "next"

import { AppProvider } from "@/components/providers/app-provider"
import { ThemedFavicon } from "@/components/layout/themed-favicon"
import { indexRobots, siteConfig } from "@/lib/seo"

import "./globals.css"

const themeInitScript = `(() => {
  try {
    const storageKey = "theme"
    const storedTheme = window.localStorage.getItem(storageKey)
    const theme =
      storedTheme === "light" || storedTheme === "dark" || storedTheme === "system"
        ? storedTheme
        : "system"
    const resolvedTheme =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme
    const root = document.documentElement

    root.classList.remove("light", "dark")
    root.classList.add(resolvedTheme)
    root.style.colorScheme = resolvedTheme
  } catch {}
})()`

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.name, url: siteConfig.siteUrl }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: siteConfig.category,
  // SSR/no-JS/crawler baseline. ThemedFavicon swaps to the white version in dark
  // mode on the client (the icon art is black).
  icons: {
    icon: "/readrinku-icon.png?v=1",
    shortcut: "/readrinku-icon.png?v=1",
    apple: "/readrinku-icon.png?v=1",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: "/",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/opengraph-image"],
  },
  robots: indexRobots,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full bg-background font-sans text-foreground">
        <ThemedFavicon />
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
