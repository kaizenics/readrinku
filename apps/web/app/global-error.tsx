"use client"

import { WarningOctagonIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <div className="page-frame flex min-h-screen items-center justify-center py-12">
          <div className="quiet-panel flex max-w-lg flex-col gap-4 rounded-xl p-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full border bg-muted">
              <WarningOctagonIcon />
            </div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              ReadRinku hit an unexpected error
            </h1>
            <p className="text-sm text-muted-foreground">
              Retry the route to recover the app shell.
            </p>
            <Button type="button" onClick={() => unstable_retry()}>
              Retry
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}
