import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function NetworkSkeleton() {
  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded" />
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-8 w-48 sm:w-64" />
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <Skeleton className="h-4 w-64 sm:w-80" />
                <Skeleton className="hidden sm:block h-4 w-1" />
                <Skeleton className="h-4 w-32 sm:w-40" />
              </div>
            </div>
          </div>
          <Skeleton className="h-10 w-full sm:w-64 lg:w-auto lg:min-w-[160px]" />
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-11 flex-1 sm:flex-initial sm:w-48" />
            <Skeleton className="h-11 flex-1 sm:flex-initial sm:w-48" />
            <Skeleton className="h-11 flex-1 sm:flex-initial sm:w-48" />
          </div>

          {/* Card Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-full lg:w-64" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Connection Cards Skeleton - Desktop (lg+) */}
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-3">
                  {/* Desktop Layout */}
                  <div className="hidden lg:flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-48" />
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-3 w-8" />
                          <Skeleton className="h-5 w-20" />
                          <Skeleton className="h-5 w-5" />
                          <Skeleton className="h-3 w-1" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="flex gap-6">
                        <div className="text-center space-y-1">
                          <Skeleton className="h-5 w-6 mx-auto" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <div className="text-center space-y-1">
                          <Skeleton className="h-5 w-6 mx-auto" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </div>

                  {/* Tablet Layout (sm-lg) */}
                  <div className="hidden sm:flex lg:hidden items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-40" />
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Skeleton className="h-3 w-8" />
                          <Skeleton className="h-5 w-20" />
                          <Skeleton className="h-5 w-5" />
                          <Skeleton className="h-3 w-1" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex gap-4">
                        <div className="text-center space-y-1">
                          <Skeleton className="h-4 w-5 mx-auto" />
                          <Skeleton className="h-3 w-10" />
                        </div>
                        <div className="text-center space-y-1">
                          <Skeleton className="h-4 w-5 mx-auto" />
                          <Skeleton className="h-3 w-10" />
                        </div>
                      </div>
                      <Skeleton className="h-7 w-7 rounded" />
                    </div>
                  </div>

                  {/* Mobile Layout */}
                  <div className="sm:hidden">
                    <div className="flex items-center justify-between mb-2 gap-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-7 w-7 rounded flex-shrink-0" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-3 w-8" />
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-5" />
                      </div>
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
