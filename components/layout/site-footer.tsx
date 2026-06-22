import Link from "next/link"
import { BookOpenIcon } from "@phosphor-icons/react/ssr"

import { siteNavigation } from "@/lib/readrinku"

const secondaryLinks = [
  { href: "/settings", label: "Reader settings" },
  { href: "/library", label: "Saved library" },
  { href: "/history", label: "Reading history" },
]

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t bg-card/40">
      <div className="page-frame flex flex-col gap-8 py-10">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.8fr)_minmax(0,0.9fr)]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-md border bg-background">
                <BookOpenIcon />
              </span>
              <div className="flex flex-col">
                <span className="font-heading text-base font-semibold tracking-tight">
                  ReadRinku
                </span>
                <span className="text-sm text-muted-foreground">
                  Clean manga reading, built for long sessions.
                </span>
              </div>
            </div>
            <p className="max-w-xl text-sm leading-7 text-muted-foreground">
              ReadRinku is a frontend manga reader prototype focused on discovery,
              chapter browsing, and a calmer reading flow across desktop and mobile.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-heading text-sm font-semibold tracking-tight">
              Explore
            </h2>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              {siteNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-heading text-sm font-semibold tracking-tight">
              Reader
            </h2>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              {secondaryLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} ReadRinku</p>

        </div>
      </div>
    </footer>
  )
}
