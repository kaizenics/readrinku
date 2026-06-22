"use client"

import Link from "next/link"
import { BookOpenIcon, DoorOpenIcon, HouseIcon, MagnifyingGlassIcon, StackIcon, UserCircleIcon } from "@phosphor-icons/react"
import { usePathname } from "next/navigation"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { useReadRinku } from "@/components/providers/read-rinku-provider"
import { Button } from "@/components/ui/button"

const topLinks = [
  { href: "/", label: "Home", icon: HouseIcon },
  { href: "/browse", label: "Browse", icon: MagnifyingGlassIcon },
  { href: "/library", label: "Library", icon: StackIcon },
  { href: "/history", label: "History", icon: BookOpenIcon },
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
      <div className="page-frame flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-md border bg-muted">
              <BookOpenIcon />
            </span>
            <span className="flex flex-col">
              <span className="font-heading text-sm font-semibold tracking-tight">
                ReadRinku
              </span>
              <span className="text-xs text-muted-foreground">
                Quiet manga reading
              </span>
            </span>
          </Link>

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
          </nav>
        </div>

        <div className="flex items-center gap-2">
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
                <Link href="/login">
                  <UserCircleIcon data-icon="inline-start" />
                  Login
                </Link>
              </Button>
              <Button asChild size="sm" className="h-8 px-3">
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
