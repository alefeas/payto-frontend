import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function AccountsReceivableSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-9 w-56" />
              <Skeleton className="h-5 w-80" />
            </div>
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <div className="h-2 opacity-0 mb-2">
                  <Skeleton className="h-2 w-20" />
                </div>
                <Skeleton className="h-8 w-32 mb-2" />
                <div className="flex gap-3">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-3 w-24 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 flex-1" />
        </div>

        {/* Tabs */}
        <div className="space-y-6">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-40 rounded-md" />
            <Skeleton className="h-10 w-48 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
            <Skeleton className="h-10 w-40 rounded-md" />
            <Skeleton className="h-10 w-28 rounded-md" />
            <Skeleton className="h-10 w-20 rounded-md" />
          </div>

          {/* Content with Invoice List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-8 w-36 rounded-md" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4 flex-1">
                    <Skeleton className="h-4 w-4 rounded-sm" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-64" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right space-y-2">
                      <Skeleton className="h-5 w-28" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-9 w-16 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AccountsPayableSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-9 w-52" />
              <Skeleton className="h-5 w-96" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <div className="h-2 opacity-0 mb-2">
                  <Skeleton className="h-2 w-20" />
                </div>
                <Skeleton className="h-8 w-32 mb-2" />
                <div className="flex gap-3">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-3 w-24 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 flex-1" />
        </div>

        {/* Tabs */}
        <div className="space-y-6">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-40 rounded-md" />
            <Skeleton className="h-10 w-40 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
            <Skeleton className="h-10 w-36 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
            <Skeleton className="h-10 w-20 rounded-md" />
          </div>

          {/* Content with Invoice List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-8 w-36 rounded-md" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4 flex-1">
                    <Skeleton className="h-4 w-4 rounded-sm" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-64" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right space-y-2">
                      <Skeleton className="h-5 w-28" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-9 w-16 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
