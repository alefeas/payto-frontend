"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function TaskCardSkeleton() {
  return (
    <Card className="border border-[var(--color-gray)]">
      <CardContent className="px-2 sm:px-3 py-1.5 sm:py-2">
        <div className="flex items-start gap-1.5 sm:gap-2">
          {/* Checkbox */}
          <Skeleton className="h-4 w-4 rounded mt-0.5 flex-shrink-0" />
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <Skeleton className="h-4 w-3/4 mb-1" />
            
            {/* Description */}
            <Skeleton className="h-3 w-full mb-2" />
            
            {/* Priority Badge and Date */}
            <div className="flex items-center gap-1 flex-wrap">
              <Skeleton className="h-5 w-12 rounded" />
              <Skeleton className="h-5 w-24 rounded" />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded" />
            <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function TasksPageSkeleton() {
  return (
    <div className="min-h-screen bg-white p-2 sm:p-3 md:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 flex-1">
            {/* Back Button */}
            <Skeleton className="h-8 w-8 rounded flex-shrink-0" />
            
            {/* Title and Description */}
            <div className="flex-1 min-w-0">
              <Skeleton className="h-7 sm:h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-48 sm:w-64" />
            </div>
          </div>
          
          {/* New Task Button - Only on desktop */}
          <Skeleton className="hidden md:block h-10 w-32 rounded flex-shrink-0" />
        </div>

        {/* Tabs Section */}
        <div className="space-y-3">
          {/* Desktop Tabs */}
          <div className="hidden md:flex items-center w-full">
            <div className="flex gap-2">
              <Skeleton className="h-12 w-24 rounded-lg" />
              <Skeleton className="h-12 w-28 rounded-lg" />
              <Skeleton className="h-12 w-28 rounded-lg" />
            </div>
            <div className="flex-1" />
            <Skeleton className="h-12 w-32 rounded flex-shrink-0" />
          </div>

          {/* Mobile Tabs */}
          <div className="md:hidden flex flex-col gap-3">
            <div className="flex gap-1 w-full">
              <Skeleton className="h-12 flex-1 rounded-lg" />
              <Skeleton className="h-12 flex-1 rounded-lg" />
              <Skeleton className="h-12 flex-1 rounded-lg" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-12 flex-1 rounded" />
              <Skeleton className="h-12 w-12 p-0 rounded flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-2 sm:space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <TaskCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
