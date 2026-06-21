import Image from "next/image"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { isPlaceholderAsset } from "@/lib/readrinku"
import { cn } from "@/lib/utils"

export function CoverImage({
  src,
  alt,
  priority = false,
  className,
}: {
  src: string | null
  alt: string
  priority?: boolean
  className?: string
}) {
  if (!src || isPlaceholderAsset(src)) {
    return (
      <AspectRatio
        ratio={2 / 3}
        className={cn("overflow-hidden rounded-lg border bg-muted/40", className)}
      />
    )
  }

  return (
    <AspectRatio ratio={2 / 3} className={cn("overflow-hidden rounded-lg border bg-muted", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        sizes="(max-width: 768px) 50vw, 20vw"
      />
    </AspectRatio>
  )
}
