"use client"

import Link from "next/link"
import { GearIcon, HouseIcon, MagnifyingGlassIcon } from "@phosphor-icons/react"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const mobileLinks = [
  { href: "/", label: "Home", icon: HouseIcon },
  { href: "/browse", label: "Browse", icon: MagnifyingGlassIcon },
  { href: "/settings", label: "Settings", icon: GearIcon },
]

export function MobileNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background md:hidden">
      <div className="grid grid-cols-3 gap-1 px-2 py-2">
        {mobileLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex min-h-11 flex-col items-center justify-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground",
              pathname === href && "bg-muted text-foreground"
            )}
          >
            <Icon />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
