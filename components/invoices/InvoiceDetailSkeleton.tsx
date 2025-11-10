import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function InvoiceDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded" />
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Info Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-5 w-24" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-56 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="grid grid-cols-7 gap-3 py-3">
                    <div className="col-span-2">
                      <Skeleton className="h-3 w-20 mb-1" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <div className="text-center">
                      <Skeleton className="h-3 w-12 mb-1 mx-auto" />
                      <Skeleton className="h-4 w-8 mx-auto" />
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-3 w-16 mb-1 ml-auto" />
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </div>
                    <div className="text-center">
                      <Skeleton className="h-3 w-12 mb-1 mx-auto" />
                      <Skeleton className="h-4 w-8 mx-auto" />
                    </div>
                    <div className="text-center">
                      <Skeleton className="h-3 w-12 mb-1 mx-auto" />
                      <Skeleton className="h-4 w-12 mx-auto" />
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-3 w-12 mb-1 ml-auto" />
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </div>
                  </div>
                  {i !== 3 && <div className="border-b border-gray-200" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Totals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between items-center py-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-36" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center py-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
