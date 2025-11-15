"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function AnalyticsSkeleton() {
  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 w-full xl:w-auto">
            <Skeleton className="h-12 w-12 rounded flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-7 sm:h-8 w-48 sm:w-64 max-w-full mb-1" />
              <Skeleton className="h-3 sm:h-4 w-64 sm:w-96 max-w-full" />
            </div>
          </div>
          <div className="w-full xl:w-auto">
            <div className="grid grid-cols-2 xl:flex gap-2">
              <Skeleton className="h-12 w-full xl:w-[120px]" />
              <Skeleton className="h-12 w-full xl:w-[180px]" />
              <Skeleton className="h-12 col-span-2 xl:col-span-1 xl:w-[140px]" />
            </div>
          </div>
        </div>

        {/* Stats Cards Skeleton - Single card for carousel (mobile/tablet) */}
        <div className="lg:hidden">
          <Card className="border-gray-200" style={{ minHeight: '180px' }}>
            <CardContent className="p-4 sm:p-6 h-full flex flex-col">
              <div className="flex items-start justify-between gap-4 flex-1">
                <div className="w-full flex flex-col">
                  <Skeleton className="h-3 sm:h-4 w-24 sm:w-28 mb-2" />
                  <Skeleton className="h-6 sm:h-7 w-28 sm:w-32 mb-2 sm:mb-3" />
                  <div className="space-y-0.5 sm:space-y-1 mb-1 sm:mb-2">
                    <Skeleton className="h-2 sm:h-3 w-20 sm:w-24" />
                    <Skeleton className="h-2 sm:h-3 w-20 sm:w-24" />
                  </div>
                  <Skeleton className="h-2 sm:h-3 w-16 sm:w-20 mt-auto" />
                </div>
                <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded flex-shrink-0 mt-1" />
              </div>
            </CardContent>
          </Card>
          {/* Carousel controls skeleton */}
          <div className="flex items-center justify-center mt-4">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex space-x-1.5">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="w-1.5 h-1.5 rounded-full" />
                ))}
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>

        {/* Stats Cards Skeleton - Grid for desktop (lg+) */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-gray-200 shadow-sm" style={{ minHeight: '180px' }}>
              <CardContent className="p-4 sm:p-6 h-full flex flex-col">
                <div className="flex items-start justify-between gap-4 flex-1">
                  <div className="w-full flex flex-col">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-7 w-32 mb-3" />
                    <div className="space-y-1 mb-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-3 w-20 mt-auto" />
                  </div>
                  <Skeleton className="h-6 w-6 rounded flex-shrink-0 mt-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 sm:h-6 lg:h-5 w-32 sm:w-40" />
              <Skeleton className="h-3 sm:h-4 w-40 sm:w-48 mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full rounded" />
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 sm:h-6 lg:h-5 w-32 sm:w-40" />
              <Skeleton className="h-3 sm:h-4 w-40 sm:w-48 mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full rounded" />
            </CardContent>
          </Card>
        </div>

        {/* Alert Card Skeleton */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded" />
              <Skeleton className="h-5 sm:h-6 lg:h-5 w-40 sm:w-48" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-3 sm:p-4 border border-gray-200 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex-1">
                      <Skeleton className="h-4 sm:h-5 w-28 sm:w-32 mb-1" />
                      <Skeleton className="h-3 w-20 sm:w-24" />
                    </div>
                    <div className="text-left sm:text-right">
                      <Skeleton className="h-7 sm:h-8 w-12 sm:w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}