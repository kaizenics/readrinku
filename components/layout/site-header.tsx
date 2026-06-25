"use client"

import Image from "next/image"
import Link from "next/link"
import { DoorOpenIcon, HouseIcon, MagnifyingGlassIcon, UserCircleIcon } from "@phosphor-icons/react"
import { usePathname } from "next/navigation"
import { Suspense } from "react"
import { toast } from "sonner"

import { HeaderSearch } from "@/components/layout/header-search"
import { cn } from "@/lib/utils"
import { useReadRinku } from "@/components/providers/read-rinku-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { mangaGenres } from "@/lib/genres"

const topLinks = [
  { href: "/", label: "Home", icon: HouseIcon },
  { href: "/browse", label: "Browse", icon: MagnifyingGlassIcon },
]

export function SiteHeader() {
  const pathname = usePathname()
  const { session, logout } = useReadRinku()

  async function handleLogout() {
    await logout()
    toast.success("Signed out of the demo session.")
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="page-frame flex min-h-16 items-center justify-between gap-4 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center" aria-label="ReadRinku home">
              <Image
                src="/readrinku.png"
                alt="ReadRinku"
                width={485}
                height={187}
                priority
                className="h-9 w-auto brightness-0 invert"
              />
            </Link>
            <Badge
              variant="outline"
              className="border-amber-500/40 bg-amber-500/15 font-semibold uppercase tracking-wide text-amber-400"
            >
              Beta
            </Badge>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {topLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm text-muted-foreground transition-transform hover:text-foreground",
                  pathname === href && "bg-muted text-foreground"
                )}
              >
                {label}
              </Link>
            ))}

            <NavigationMenu viewport={false}>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      "h-auto rounded-md bg-transparent px-3 py-2 text-sm font-normal text-muted-foreground hover:bg-transparent hover:text-foreground focus:bg-transparent data-open:bg-transparent data-open:text-foreground data-popup-open:bg-transparent data-popup-open:text-foreground",
                      pathname.startsWith("/genre") && "text-foreground"
                    )}
                  >
                    Genres
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid max-h-[70vh] w-[34rem] grid-cols-3 gap-x-3 gap-y-0.5 overflow-y-auto p-2">
                      {mangaGenres.map((genre) => (
                        <li key={genre.slug}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={`/genre/${genre.slug}`}
                              className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                              {genre.label}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          <div className="hidden min-w-0 lg:block lg:w-[min(34vw,28rem)]">
            <Suspense fallback={<div className="h-10 rounded-md border bg-muted/40" />}>
              <HeaderSearch />
            </Suspense>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="h-11 px-3 lg:hidden">
            <Link href="/browse" aria-label="Search comics or webtoons">
              <MagnifyingGlassIcon />
              <span className="hidden sm:inline">Search</span>
            </Link>
          </Button>
          {session ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium">{session.displayName}</p>
                <p className="text-xs text-muted-foreground">{session.email}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-11 px-3 sm:h-8"
                onClick={handleLogout}
              >
                <DoorOpenIcon data-icon="inline-start" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost" size="sm" className="h-8 px-3">
                <Link href="/">
                  <UserCircleIcon data-icon="inline-start" />
                  Login
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
