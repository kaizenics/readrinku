"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const PREVIEW_LENGTH = 420

function getPreviewText(value: string) {
  if (value.length <= PREVIEW_LENGTH) {
    return value
  }

  return `${value.slice(0, PREVIEW_LENGTH - 3).trimEnd()}...`
}

export function SynopsisPreview({
  title,
  synopsis,
}: {
  title: string
  synopsis: string
}) {
  const needsDialog = synopsis.length > PREVIEW_LENGTH
  const preview = getPreviewText(synopsis)

  return (
    <div className="flex flex-col gap-2">
      <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{preview}</p>
      {needsDialog ? (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" className="h-auto w-fit px-0 text-sm">
              Read more
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] w-[calc(100vw-2rem)] max-w-none gap-0 overflow-hidden p-0 sm:w-[42rem] lg:w-[56rem]">
            <DialogHeader className="border-b p-5 pr-12">
              <DialogTitle className="text-lg font-semibold tracking-tight">
                About {title}
              </DialogTitle>
              <DialogDescription>
                Full series description.
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto p-5">
              <p className="whitespace-pre-wrap text-sm leading-8 text-muted-foreground">
                {synopsis}
              </p>
            </div>
            <DialogFooter showCloseButton className="border-t p-5" />
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  )
}
