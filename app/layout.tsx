import type { Metadata } from "next"

import { AppProvider } from "@/components/providers/app-provider"

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
  title: {
    default: "ReadRinku",
    template: "%s | ReadRinku",
  },
  description:
    "A minimalist manga reading frontend prototype built with shadcn/ui and Phosphor icons.",
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
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
