"use client"

import Link from "next/link"
import { CaretLeftIcon, CaretRightIcon, FireIcon } from "@phosphor-icons/react"
import { useEffect, useState } from "react"

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { RemoteCoverImage } from "@/components/manga/remote-cover-image"
import type { SourceMangaPreview } from "@/lib/types/readrinku"
import { cn } from "@/lib/utils"

export function FeaturedManga({ manga }: { manga: SourceMangaPreview[] }) {
  const items = manga.filter((entry) => entry.image)

  if (items.length === 0) {
    return null
  }

  return <FeaturedMangaCarousel manga={items} />
}

function FeaturedMangaCarousel({ manga }: { manga: SourceMangaPreview[] }) {
  const [api, setApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [snapCount, setSnapCount] = useState(0)

  useEffect(() => {
    if (!api) {
      return
    }

    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap())
      setSnapCount(api.scrollSnapList().length)
    }

    onSelect()
    api.on("select", onSelect)
    api.on("reInit", onSelect)

    return () => {
      api.off("select", onSelect)
      api.off("reInit", onSelect)
    }
  }, [api])

  useEffect(() => {
    if (!api || manga.length <= 1) {
      return
    }

    const timer = window.setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext()
        return
      }

      api.scrollTo(0)
    }, 3200)

    return () => window.clearInterval(timer)
  }, [api, manga.length])

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 pt-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 items-center gap-2 rounded-sm bg-primary px-3 text-sm font-medium text-primary-foreground">
            <FireIcon />
            Popular now
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="rounded-sm"
            onClick={() => api?.scrollPrev()}
            disabled={!api?.canScrollPrev()}
            aria-label="Previous featured manga"
          >
            <CaretLeftIcon />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="rounded-sm"
            onClick={() => {
              if (!api) {
                return
              }

              if (api.canScrollNext()) {
                api.scrollNext()
                return
              }

              api.scrollTo(0)
            }}
            aria-label="Next featured manga"
          >
            <CaretRightIcon />
          </Button>
        </div>
      </div>

      <Carousel setApi={setApi} opts={{ align: "start", loop: false }}>
        <CarouselContent className="-ml-2">
          {manga.map((entry) => {
            return (
              <CarouselItem
                key={entry.id}
                className="basis-1/2 pl-2 sm:basis-1/3 lg:basis-1/5 xl:basis-1/6"
              >
                <Link
                  href={`/manga/${entry.id}`}
                  className="group block overflow-hidden rounded-sm border bg-card"
                >
                  <div className="relative aspect-[7/9] w-full overflow-hidden">
                    <RemoteCoverImage
                      src={entry.image ?? ""}
                      alt={entry.title}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 18vw"
                      imageClassName="transition-transform duration-300 group-hover:scale-[1.03]"
                      fallbackLabel={entry.title}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-black/82 px-2 py-2 text-white">
                      <p className="line-clamp-2 text-sm font-medium leading-tight">
                        {entry.title}
                      </p>
                      <p className="mt-1 text-xs text-white/80">
                        {entry.lastChapterLabel}
                      </p>
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </Carousel>

      <div className="flex justify-center gap-1.5">
        {Array.from({ length: snapCount }).map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => api?.scrollTo(index)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              index === selectedIndex
                ? "w-6 bg-primary"
                : "w-2 bg-border hover:bg-muted-foreground"
            )}
            aria-label={`Go to featured manga ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
