'use client'

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function CompanySkeleton() {
  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header with Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Back Button */}
            <Skeleton className="h-10 w-10 rounded" />
            
            {/* Title and Subtitle */}
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-8 w-48 sm:w-64" />
              <Skeleton className="h-4 w-64 sm:w-96" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto items-center justify-end">
            {/* Notification Bell */}
            <Skeleton className="h-12 w-12 rounded" />
            
            {/* Members Button - Icon only on mobile, icon + text on xl */}
            <Skeleton className="h-12 flex-1 md:flex-none md:w-12 lg:w-12 xl:w-32 rounded" />
            
            {/* AFIP Button - Icon only on mobile, icon + text on xl */}
            <Skeleton className="h-12 flex-1 md:flex-none md:w-12 lg:w-12 xl:w-24 rounded" />
            
            {/* Settings Button - Icon only on mobile, icon + text on xl */}
            <Skeleton className="h-12 flex-1 md:flex-none md:w-12 lg:w-12 xl:w-32 rounded" />
          </div>
        </div>

        {/* Stats Cards - Single card for carousel (mobile/tablet) */}
        <div className="lg:hidden">
          <Card className="h-40">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
          {/* Carousel controls skeleton */}
          <div className="flex items-center justify-center mt-3 sm:mt-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-full" />
              <div className="flex space-x-1">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full" />
                ))}
              </div>
              <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-full" />
            </div>
          </div>
        </div>

        {/* Stats Cards - Grid for desktop (lg+) */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="h-40">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Menu Section */}
        <div className="space-y-4">
          {/* Section Header */}
          <div className="space-y-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Menu Grid - 1 col mobile, 2 col tablet, 3 col desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4 sm:p-5 rounded-lg border border-gray-200 bg-white cursor-pointer shadow-xs">
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-5 w-32 mb-1.5" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-8 w-8 rounded flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Additional Features Section */}
        <div className="space-y-4">
          {/* Section Header */}
          <div className="space-y-1">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-full sm:w-96" />
          </div>

          {/* Additional Items Grid - 1 col mobile, 2 col tablet, 3 col desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4 sm:p-5 rounded-lg border border-gray-200 bg-white cursor-pointer shadow-xs">
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-5 w-32 mb-1.5" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-8 w-8 rounded flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
