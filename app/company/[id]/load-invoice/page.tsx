"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Info, Receipt, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { ManualInvoiceForm } from "@/components/invoices/ManualInvoiceForm"

export default function LoadInvoicePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string
  const [isFormReady, setIsFormReady] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/log-in')
    }
  }, [isAuthenticated, authLoading, router])

  if (authLoading || !isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        {/* Skeleton Loading - visible mientras carga */}
        <div style={{ display: isFormReady ? 'none' : 'block' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-7 sm:h-8 w-48 sm:w-64" />
                <Skeleton className="h-4 w-64 sm:w-96" />
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
          <Card className="mt-6">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>

        {/* Contenido real - visible cuando está listo */}
        <div style={{ display: isFormReady ? 'block' : 'none' }}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <BackButton href={`/company/${companyId}`} />
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold">Carga Manual de Facturas</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Registrá facturas recibidas o emitidas históricas
                </p>
              </div>
            </div>
          </div>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>¿Cuándo usar carga manual?</AlertTitle>
            <AlertDescription className="space-y-2">
              <div className="flex items-start gap-2 mt-2">
                <Receipt className="h-4 w-4 mt-0.5 text-blue-600" />
                <div>
                  <strong>Facturas Recibidas:</strong> Siempre se cargan manualmente. 
                  Usá esta opción para registrar facturas de proveedores y llevar control de gastos.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 mt-0.5 text-green-600" />
                <div>
                  <strong>Facturas Emitidas Históricas:</strong> Solo para registrar ventas antiguas 
                  o hechas fuera del sistema. Para facturas nuevas, usá la emisión automática con AFIP.
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle>Datos de la Factura</CardTitle>
              <CardDescription>
                Completá todos los campos requeridos. Los totales se calcularán automáticamente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ManualInvoiceForm
                companyId={companyId}
                onReady={() => setIsFormReady(true)}
                onSuccess={() => {
                  router.push(`/company/${companyId}/invoices`)
                }}
                onCancel={() => {
                  router.push(`/company/${companyId}`)
                }}
              />
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card>
            <CardHeader>
              <CardTitle>Ayuda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <strong>¿Dónde encuentro el CAE?</strong>
                <p className="text-muted-foreground">
                  El CAE (Código de Autorización Electrónico) está en la factura original, 
                  generalmente al pie del comprobante. Es un número de 14 dígitos.
                </p>
              </div>
              <div>
                <strong>¿Qué pasa si no tengo el CAE?</strong>
                <p className="text-muted-foreground">
                  Podés dejar el campo vacío. El CAE es opcional para facturas históricas, 
                  pero es recomendable ingresarlo si lo tenés para mantener trazabilidad.
                </p>
              </div>
              <div>
                <strong>¿Puedo emitir a empresas conectadas?</strong>
                <p className="text-muted-foreground">
                  Sí. Podés registrar facturas históricas emitidas a empresas que ahora están 
                  conectadas en PayTo. Esto es útil para importar historial previo.
                </p>
              </div>
              <div>
                <strong>¿Puedo modificar la factura después?</strong>
                <p className="text-muted-foreground">
                  No. Las facturas manuales no se pueden modificar después de creadas. 
                  Asegurate de revisar todos los datos antes de guardar.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulario oculto para inicialización */}
        {!isFormReady && (
          <div style={{ display: 'none' }}>
            <ManualInvoiceForm
              companyId={companyId}
              onReady={() => setIsFormReady(true)}
              onSuccess={() => {
                router.push(`/company/${companyId}/invoices`)
              }}
              onCancel={() => {
                router.push(`/company/${companyId}`)
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
