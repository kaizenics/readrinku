"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

import { cn } from "@/lib/utils"

export function RemoteCoverImage({
  src,
  alt,
  sizes,
  className,
  imageClassName,
  fallbackLabel,
}: {
  src: string | null
  alt: string
  sizes: string
  className?: string
  imageClassName?: string
  fallbackLabel?: string
}) {
  const [currentSrc, setCurrentSrc] = useState(src)

  useEffect(() => {
    setCurrentSrc(src)
  }, [src])

  if (!currentSrc) {
    return (
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-muted/60 p-4 text-center text-xs font-medium text-muted-foreground",
          className
        )}
      >
        <span className="line-clamp-3">{fallbackLabel ?? alt}</span>
      </div>
    )
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill
      unoptimized
      sizes={sizes}
      className={cn("object-cover", imageClassName, className)}
      onError={() => setCurrentSrc(null)}
    />
  )
}
