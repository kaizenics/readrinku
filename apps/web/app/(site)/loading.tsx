import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="page-frame flex flex-col gap-6 py-8">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-64 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-96 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}
