import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-white p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          
          {/* Filter Buttons */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-sm border border-gray-200">
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-8 w-40" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start">
            {/* Left Column - 2 Cards */}
            <div className="flex flex-col gap-6 lg:col-span-2">
              {/* Chart Card */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-64 w-full" />
                  </div>
                </CardContent>
              </Card>

              {/* Tasks Card */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-9 w-24" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="space-y-2 p-3 border border-gray-100 rounded-lg">
                        <Skeleton className="h-4 w-64" />
                        <Skeleton className="h-3 w-48" />
                        <div className="flex justify-between">
                          <Skeleton className="h-3 w-32" />
                          <Skeleton className="h-5 w-12" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-9 w-9" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - 2 Cards */}
            <div className="flex flex-col gap-6 lg:col-span-1">
              {/* Facturas a Pagar Card */}
              <Card className="shadow-sm border border-gray-200 flex flex-col flex-1">
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 flex-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="py-3 border-b border-gray-100">
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-32" />
                          <Skeleton className="h-3 w-36" />
                          <Skeleton className="h-4 w-28 mt-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-9 w-9" />
                  </div>
                </CardContent>
              </Card>

              {/* Facturas a Cobrar Card */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="py-3 border-b border-gray-100">
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-32" />
                          <Skeleton className="h-3 w-36" />
                          <Skeleton className="h-4 w-28 mt-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-9 w-9" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
