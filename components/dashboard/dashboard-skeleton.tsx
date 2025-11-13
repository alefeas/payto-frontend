import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 pb-8">
        {/* Header con título y tabs */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
          <div className="flex-1 min-w-0">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-96 max-w-full" />
          </div>
          
          {/* Tabs skeleton */}
          <div className="flex-shrink-0 lg:mt-0">
            <div className="flex flex-wrap justify-start lg:justify-end gap-2">
              <Skeleton className="h-11 w-20" />
              <Skeleton className="h-11 w-24" />
              <Skeleton className="h-11 w-24" />
              <Skeleton className="h-11 w-24" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Cards KPI - Grid en desktop, carousel en mobile */}
          {/* Desktop: Grid */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="shadow-sm border border-gray-200">
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-8 w-40" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32 mt-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mobile: Carousel */}
          <div className="md:hidden relative w-full">
            <div className="relative w-full px-1">
              <Card className="shadow-sm border border-gray-200">
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-8 w-40" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32 mt-4" />
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Controles del carousel */}
            <div className="flex items-center justify-center mt-4">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex space-x-1.5">
                  <Skeleton className="w-1.5 h-1.5 rounded-full" />
                  <Skeleton className="w-1.5 h-1.5 rounded-full" />
                  <Skeleton className="w-1.5 h-1.5 rounded-full" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>

          {/* Grid de contenido */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start min-h-0">
            {/* Columna izquierda - 2 columnas */}
            <div className="flex flex-col gap-6 lg:col-span-2">
              {/* Gráfico */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="overflow-hidden">
                  <Skeleton className="h-[280px] w-full" />
                </CardContent>
              </Card>

              {/* Tareas Pendientes */}
              <Card className="shadow-sm border border-gray-200 min-w-0">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-9 w-24" />
                </CardHeader>
                <CardContent className="min-w-0">
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg">
                        <Skeleton className="h-5 w-5 rounded-full flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-6 w-12 flex-shrink-0" />
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

            {/* Columna derecha - 1 columna */}
            <div className="flex flex-col gap-6 lg:col-span-1 min-h-0 min-w-0">
              {/* Facturas a Pagar */}
              <Card className="shadow-sm border border-gray-200 flex flex-col flex-1 min-w-0">
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent className="min-w-0">
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="py-3 border-b border-gray-100 last:border-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-3 w-32 mb-1" />
                            <Skeleton className="h-3 w-28" />
                          </div>
                          <Skeleton className="h-5 w-20" />
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

              {/* Facturas a Cobrar */}
              <Card className="shadow-sm border border-gray-200 min-w-0">
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent className="min-w-0">
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="py-3 border-b border-gray-100 last:border-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-3 w-32 mb-1" />
                            <Skeleton className="h-3 w-28" />
                          </div>
                          <Skeleton className="h-5 w-20" />
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
