import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 sm:h-12 sm:w-[102px] rounded-md flex-shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Summary */}
          <Card>
            <CardHeader className="text-center">
              <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
              <Skeleton className="h-6 w-32 mx-auto mb-2" />
              <Skeleton className="h-4 w-40 mx-auto" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="pt-2 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
              </div>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-56 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <Skeleton className="h-5 w-40" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Address */}
              <div className="space-y-4">
                <Skeleton className="h-5 w-24" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Skeleton className="h-12 w-36 rounded-md" />
                <Skeleton className="h-12 w-24 rounded-md" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
