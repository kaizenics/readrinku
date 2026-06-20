import type { Metadata } from "next"

import { AppProvider } from "@/components/providers/app-provider"

import "./globals.css"

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
      <body className="min-h-full bg-background font-sans text-foreground">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
