import { Skeleton } from "@/components/ui/skeleton"

export function EntitiesSkeleton() {
  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* PageHeader Skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded flex-shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <Skeleton className="h-7 sm:h-8 w-48 max-w-full" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Skeleton className="h-10 w-full sm:w-36" />
          <Skeleton className="h-10 w-full sm:w-40" />
        </div>

        {/* Search and Filter Skeleton */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 relative">
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20 hidden sm:block" />
            <Skeleton className="h-9 w-full sm:w-[200px]" />
          </div>
        </div>

        {/* List Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-5 sm:h-6 w-40" />
          <Skeleton className="h-3 sm:h-4 w-64 max-w-full" />
        </div>

        {/* List Items Skeleton */}
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-3 sm:p-4 border border-gray-200 rounded-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2 flex-wrap">
                    <Skeleton className="h-4 sm:h-5 w-32" />
                    <Skeleton className="h-4 sm:h-5 w-28 rounded-full" />
                  </div>
                  <div className="flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-1">
                    <Skeleton className="h-3 w-36" />
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Skeleton className="h-9 w-9 rounded flex-shrink-0" />
                  <Skeleton className="h-9 w-9 rounded flex-shrink-0" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
