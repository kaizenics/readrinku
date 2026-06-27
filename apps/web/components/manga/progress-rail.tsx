import { cn } from "@/lib/utils"

export function ProgressRail({
  percent,
  className,
}: {
  percent: number
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative h-full w-1 overflow-hidden rounded-full bg-muted",
        className
      )}
      aria-hidden
    >
      <div
        className="absolute inset-x-0 bottom-0 rounded-full bg-primary transition-[height] duration-200"
        style={{ height: `${Math.max(0, Math.min(100, percent))}%` }}
      />
    </div>
  )
}
