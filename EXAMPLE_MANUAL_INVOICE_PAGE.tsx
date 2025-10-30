// Ejemplo de cómo usar el componente ManualInvoiceForm en una página

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ManualInvoiceForm } from "@/components/invoices/ManualInvoiceForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Receipt, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ManualInvoicePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const companyId = params.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
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
                router.back()
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

// ALTERNATIVA: Modal en lugar de página completa
// Podés usar el componente dentro de un Dialog/Modal:

/*
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

function InvoicesPage() {
  const [showManualForm, setShowManualForm] = useState(false)

  return (
    <>
      <Button onClick={() => setShowManualForm(true)}>
        Cargar Factura Manual
      </Button>

      <Dialog open={showManualForm} onOpenChange={setShowManualForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Carga Manual de Factura</DialogTitle>
          </DialogHeader>
          <ManualInvoiceForm
            companyId={companyId}
            onSuccess={() => {
              setShowManualForm(false)
              loadInvoices()
            }}
            onCancel={() => setShowManualForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
*/
