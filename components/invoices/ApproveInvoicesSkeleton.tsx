import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function ApproveInvoicesSkeleton() {
  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* PageHeader Skeleton */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full sm:w-96" />
          </div>
        </div>

        {/* Info Card Skeleton */}
        <div className="flex items-center gap-3 rounded-lg px-4 py-3 border border-gray-200">
          <Skeleton className="h-5 w-5 flex-shrink-0 rounded" />
          <Skeleton className="h-4 w-full" />
        </div>

        {/* Main Content Card Skeleton */}
        <Card className="border-gray-200">
          <CardHeader>
            <Skeleton className="h-6 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                  {/* Top row: Invoice info with view button */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Skeleton className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <Skeleton className="h-4 w-full sm:w-48" />
                        <Skeleton className="h-3 w-24 sm:w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-9 w-9 flex-shrink-0 rounded-md" />
                  </div>

                  {/* Bottom row: Total, Vencimiento, Badge, and Action buttons */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-4 sm:gap-6 md:gap-8 flex-1">
                      {/* Total */}
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-4 w-20" />
                      </div>

                      {/* Vencimiento */}
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-4 w-24" />
                      </div>

                      {/* Badge */}
                      <Skeleton className="h-6 w-12 rounded-full" />
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 flex-shrink-0 md:ml-auto">
                      <Skeleton className="h-9 w-24 rounded-md" />
                      <Skeleton className="h-9 w-24 rounded-md" />
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
