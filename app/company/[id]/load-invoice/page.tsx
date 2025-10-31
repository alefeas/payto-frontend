"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Info, Receipt, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { ManualInvoiceForm } from "@/components/invoices/ManualInvoiceForm"

export default function LoadInvoicePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-muted rounded animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-8 w-64 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-96 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
          <div className="h-32 bg-muted rounded animate-pulse"></div>
          <div className="h-96 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    )
  }
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/company/${companyId}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Carga Manual de Facturas</h1>
              <p className="text-muted-foreground">
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
    </div>
  )
}
