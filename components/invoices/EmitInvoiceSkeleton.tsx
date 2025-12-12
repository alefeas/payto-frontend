import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function EmitInvoiceSkeleton() {
  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <Skeleton className="h-12 w-24 rounded" />
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-8 w-48 sm:w-64" />
              <Skeleton className="h-4 w-40 sm:w-56" />
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Información General Card */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tipo, Punto de Venta, Concepto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-12 w-full rounded-md" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <div className="flex gap-1">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-4 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-12 w-full rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-12 w-full rounded-md" />
                </div>
              </div>

              {/* Moneda, Cotización, Fechas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
                <div className="space-y-2 sm:col-span-2 md:col-span-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-12 w-full rounded-md" />
                </div>
                <div className="space-y-2 sm:col-span-2 md:col-span-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-12 w-full rounded-md" />
                </div>
                <div className="space-y-2 sm:col-span-2 md:col-span-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-12 w-full rounded-md" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <div className="space-y-2 sm:col-span-2 md:col-span-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-12 w-full rounded-md" />
                </div>
              </div>

              {/* Client Section */}
              <div className="space-y-4">
                <Skeleton className="h-4 w-20" />
                
                {/* Client Options */}
                <div className="space-y-3">
                  {/* Empresa en mi red PayTo */}
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-4 rounded" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  
                  {/* Cliente externo guardado */}
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-4 rounded" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-44" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  
                  {/* Nuevo cliente externo */}
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-4 rounded" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-52" />
                    </div>
                  </div>
                </div>

                {/* Client Selector Dropdown */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-12 w-full rounded-md" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-48 mt-2" />
                </div>
                <Skeleton className="h-9 w-32 rounded-md" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Single Item */}
              <div className="space-y-3 p-4 border border-gray-200 rounded-lg relative">
                <Skeleton className="absolute top-2 right-2 h-8 w-8 rounded" />
                
                <div className="grid grid-cols-1 gap-4 pr-8 sm:pr-10">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-12 w-full rounded-md" />
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-12 w-full rounded-md" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-12 w-full rounded-md" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-12 w-full rounded-md" />
                    </div>
                    <div className="space-y-2 col-span-2 sm:col-span-1">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-12 w-full rounded-md" />
                    </div>
                    <div className="space-y-2 col-span-2 sm:col-span-3 md:col-span-1">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-12 w-full rounded-md" />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-4 text-sm border-t border-gray-200 pt-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Perceptions Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-56 mt-2" />
                </div>
                <Skeleton className="h-9 w-40 rounded-md" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Single Perception */}
              <div className="space-y-3 p-4 border border-gray-200 rounded-lg relative">
                <Skeleton className="absolute top-2 right-2 h-8 w-8 rounded" />
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8 sm:pr-10">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-12 w-full rounded-md" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-12 w-full rounded-md" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-12 w-full rounded-md" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-12 w-full rounded-md" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-12 w-full rounded-md" />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-4 text-sm border-t border-gray-200 pt-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Totals Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-6 w-40" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-28" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes Card */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-32 mt-2" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-24 w-full rounded-md" />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Skeleton className="h-12 w-full sm:flex-1 rounded-md" />
            <Skeleton className="h-12 w-full sm:w-auto sm:w-24 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}
