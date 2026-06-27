"use client"

import { WarningCircleIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <div className="page-frame flex min-h-[60vh] items-center justify-center py-12">
      <div className="quiet-panel flex max-w-lg flex-col gap-4 rounded-xl p-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full border bg-muted">
          <WarningCircleIcon />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            This page could not load
          </h1>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
        <Button type="button" onClick={() => unstable_retry()}>
          Try again
        </Button>
      </div>
    </div>
  )
}
