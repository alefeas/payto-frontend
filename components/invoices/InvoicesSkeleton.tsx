"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function InvoiceCardSkeleton() {
  return (
    <Card className="border-gray-200 relative">
      <CardContent className="px-4 py-2.5 relative">
        <div className="flex items-center gap-3">
          {/* Checkbox */}
          <div className="flex-shrink-0">
            <Skeleton className="h-4 w-4 rounded" />
          </div>
          
          {/* Información principal */}
          <div className="flex-1 min-w-0">
            {/* Layout para pantallas grandes (lg+) */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-4 items-center">
              {/* Número y Tipo */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              
              {/* Cliente */}
              <div className="min-w-0">
                <Skeleton className="h-3 w-12 mb-1" />
                <Skeleton className="h-4 w-32" />
              </div>
              
              {/* Fecha y Total */}
              <div>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-5 w-28" />
              </div>
              
              {/* Estados */}
              <div className="flex gap-1 flex-wrap items-center justify-end">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>

            {/* Layout para pantallas medianas y pequeñas (md y menores) */}
            <div className="lg:hidden">
              {/* Primera fila: Número y Tipo responsive */}
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-5 w-28" />
                <div className="flex">
                  {/* Badge responsive: "Tipo X" en desktop, "X" en móvil */}
                  <Skeleton className="h-6 w-20 sm:w-16 rounded-full" />
                </div>
              </div>
              
              {/* Segunda fila: Cliente responsive */}
              <div className="min-w-0 mb-2">
                <Skeleton className="h-3 w-12 mb-1" />
                <div className="flex">
                  {/* Cliente responsive: completo en desktop, abreviado en móvil */}
                  <Skeleton className="h-4 w-32 sm:w-28" />
                </div>
              </div>
              
              {/* Tercera fila: Estados abreviados */}
              <div className="flex gap-1 flex-wrap items-center mb-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
              
              {/* Cuarta fila: Fecha y Total responsive (abajo) */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100">
                {/* Fecha responsive: año completo en desktop, abreviado en móvil */}
                <Skeleton className="h-3 w-20 sm:w-16" />
                {/* Monto responsive: puede ser abreviado en móvil */}
                <Skeleton className="h-5 w-28 sm:w-20" />
              </div>
            </div>
          </div>

          {/* Botones de acción para pantallas muy grandes */}
          <div className="hidden lg:flex gap-1 flex-shrink-0">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>

          {/* Menú desplegable para pantallas pequeñas y medianas */}
          <div className="lg:hidden flex-shrink-0">
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function InvoicesPageSkeleton() {
  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Skeleton - responsive */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* BackButton responsive: solo flecha en móvil */}
            <Skeleton className="h-10 w-10 sm:w-20 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-6 sm:h-8 w-48 sm:w-64" />
              <Skeleton className="h-3 sm:h-4 w-64 sm:w-96" />
            </div>
          </div>
          
          {/* Action Buttons Skeleton - responsive */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Skeleton className="h-10 w-full sm:w-24" /> {/* Sinc. AFIP */}
            <Skeleton className="h-10 w-full sm:w-20" /> {/* TXT */}
            <Skeleton className="h-10 w-full sm:w-20" /> {/* PDF */}
          </div>
        </div>
        
        {/* Filters Skeleton - responsive */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-full sm:w-24" />
            <Skeleton className="h-10 w-full sm:w-32" />
          </div>
        </div>
        
        {/* Header con seleccionar todos Skeleton - responsive */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Skeleton className="h-4 w-4 rounded-full flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-24 sm:w-32 mb-1" />
                <Skeleton className="h-3 w-12 sm:hidden" />
              </div>
            </div>
            <Skeleton className="h-4 w-32 sm:w-40 hidden sm:block flex-shrink-0" />
          </div>
        </div>

        {/* Invoice List Skeleton */}
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <InvoiceCardSkeleton key={i} />
          ))}
        </div>

        {/* Pagination Skeleton - responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 pt-4 border-t border-gray-200 gap-3 sm:gap-0">
          <Skeleton className="h-4 w-20 sm:w-24 mx-auto sm:mx-0" />
          <div className="flex gap-2 justify-center sm:justify-end">
            <Skeleton className="h-8 w-16 sm:w-20" />
            <Skeleton className="h-8 w-16 sm:w-20" />
          </div>
        </div>
      </div>
    </div>
  )
}