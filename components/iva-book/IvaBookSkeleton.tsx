"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { CardCarousel } from "@/components/ui/card-carousel"

export function IvaBookSkeleton() {
  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            {/* Back Button - h-12 w-12 on mobile, h-12 w-[102px] on sm+ */}
            <Skeleton className="h-12 w-12 sm:w-[102px] rounded-md flex-shrink-0" />
            {/* Title and Description */}
            <div className="flex-1 min-w-0">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
          </div>
          {/* Selects - h-12 */}
          <div className="flex gap-3 w-full sm:w-auto">
            <Skeleton className="h-12 flex-1 sm:w-[140px] rounded-md" />
            <Skeleton className="h-12 flex-1 sm:w-[100px] rounded-md" />
          </div>
        </div>

        {/* Summary Cards Skeleton - Carousel */}
        <div>
          <CardCarousel desktopCols={3} mobileBreakpoint="lg" className="[&>div:nth-child(2)]:hidden">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-5 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-3 w-40" />
                </CardContent>
              </Card>
            ))}
          </CardCarousel>

          {/* Carousel Navigation Skeleton - Mobile only */}
          <div className="lg:hidden flex items-center justify-center mt-4">
            <div className="flex items-center space-x-1 sm:space-x-1.5">
              {/* Previous Arrow */}
              <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-full" />

              {/* Dots Indicator */}
              <div className="flex space-x-1">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full" />
                ))}
              </div>

              {/* Next Arrow */}
              <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-full" />
            </div>
          </div>
        </div>

        {/* Tabs and Content Skeleton */}
        <div className="space-y-4">
          {/* Tabs Section - Outside Card */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Skeleton className="h-12 w-20 rounded-md" />
              <Skeleton className="h-12 w-20 rounded-md" />
            </div>
            {/* Period - Desktop */}
            <Skeleton className="h-4 w-20 hidden sm:block" />
            {/* Period - Mobile */}
            <Skeleton className="h-4 w-16 sm:hidden" />
          </div>

          {/* Card Content */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-full sm:w-[180px] rounded-md" />
              </div>
            </CardHeader>
            <CardContent>

            {/* Records List */}
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="border-gray-200 shadow-sm">
                  <CardContent className="p-3 xl:p-2">
                    {/* Desktop Layout Skeleton */}
                    <div className="hidden xl:flex items-center gap-4 text-xs">
                      {/* Factura y Fecha */}
                      <div className="flex-shrink-0 min-w-fit space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                      </div>

                      {/* Cliente */}
                      <div className="flex-1 min-w-0">
                        <Skeleton className="h-3 w-16 mb-1" />
                        <Skeleton className="h-4 w-full max-w-xs" />
                      </div>

                      {/* CUIT */}
                      <div className="flex-shrink-0 min-w-fit text-center">
                        <Skeleton className="h-3 w-12 mb-1 mx-auto" />
                        <Skeleton className="h-4 w-24" />
                      </div>

                      {/* IVA */}
                      <div className="flex-shrink-0 min-w-fit text-center">
                        <Skeleton className="h-3 w-12 mb-1 mx-auto" />
                        <Skeleton className="h-4 w-20" />
                      </div>

                      {/* IVA Columns */}
                      <div className="flex gap-3 flex-shrink-0">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                          <div key={j} className="w-16 text-center">
                            <Skeleton className="h-3 w-12 mb-1 mx-auto" />
                            <Skeleton className="h-4 w-14" />
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="flex-shrink-0 text-center min-w-fit">
                        <Skeleton className="h-3 w-12 mb-1 mx-auto" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                    </div>

                    {/* Mobile Layout Skeleton */}
                    <div className="xl:hidden space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <Skeleton className="h-4 w-full max-w-xs mb-1" />
                          <Skeleton className="h-3 w-full max-w-sm" />
                        </div>
                        <div className="text-right flex-shrink-0">
                          <Skeleton className="h-3 w-12 mb-1 ml-auto" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                      <div className="text-xs space-y-2 border-t border-gray-100 pt-2">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-40" />
                        <div className="flex gap-2 pt-1">
                          {[1, 2, 3, 4].map((j) => (
                            <Skeleton key={j} className="h-12 w-14 rounded" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Totals Card */}
              <Card className="bg-muted/50 border-gray-200 shadow-sm">
                <CardContent className="p-3">
                  <Skeleton className="h-4 w-32 mb-3" />
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((j) => (
                      <div key={j}>
                        <Skeleton className="h-3 w-16 mb-1" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
