"use client"

import { MagnifyingGlassIcon } from "@phosphor-icons/react"
import { usePathname, useSearchParams } from "next/navigation"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

export function HeaderSearch() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentQuery = pathname === "/browse" ? (searchParams.get("q") ?? "") : ""

  return (
    <form action="/browse" className="w-full">
      <InputGroup className="h-10">
        <InputGroupAddon>
          <MagnifyingGlassIcon />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          name="q"
          defaultValue={currentQuery}
          placeholder="Search manga or manhwa"
          aria-label="Search manga or manhwa"
          className="text-sm md:text-sm"
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton type="submit" variant="ghost" size="sm" aria-label="Search">
            Search
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  )
}
