import Image from "next/image"
import Link from "next/link"

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
            <Link href="/" aria-label="ReadRinku home" className="flex w-fit items-center">
              <Image
                src="/readrinku.png"
                alt="ReadRinku"
                width={485}
                height={187}
                className="h-9 w-auto brightness-0 invert"
              />
            </Link>
            <p className="max-w-xl text-sm leading-7 text-muted-foreground">
             &copy; {year} ReadRinku
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
          <p>ReadRinku does not store any files on our server, we only linked to the media which is hosted on 3rd party services.</p>

        </div>
      </div>
    </footer>
  )
}
