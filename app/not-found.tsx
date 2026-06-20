import Link from "next/link"
import { ArrowLeftIcon, MagnifyingGlassIcon } from "@phosphor-icons/react/ssr"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="page-frame flex min-h-[70vh] items-center justify-center py-12">
      <div className="quiet-panel flex max-w-xl flex-col gap-5 rounded-xl p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full border bg-muted">
          <MagnifyingGlassIcon />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Page not found
          </h1>
          <p className="text-sm text-muted-foreground">
            That route does not exist in the current ReadRinku prototype.
          </p>
        </div>
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/">
              <ArrowLeftIcon data-icon="inline-start" />
              Back home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
