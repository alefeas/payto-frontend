"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Download, FileText, Building2, Calendar, DollarSign, User, CreditCard, Hash, Percent } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

const mockInvoice = {
  id: "1",
  number: "FC-001-00000123",
  type: "A",
  issuerCompany: "Mi Empresa",
  receiverCompany: "TechCorp SA",
  receiverCuit: "30-12345678-9",
  issueDate: "2024-01-15",
  dueDate: "2024-02-15",
  currency: "ARS",
  status: "pagada",
  items: [
    {
      id: "1",
      description: "Desarrollo de aplicación web",
      quantity: 1,
      unitPrice: 100000,
      taxRate: 21,
      subtotal: 100000,
      taxAmount: 21000
    }
  ],
  subtotal: 100000,
  totalTaxes: 21000,
  totalPerceptions: 3500,
  totalRetentions: 2420,
  total: 121000,
  notes: "Desarrollo completo de sistema de gestión"
}

export default function InvoiceDetailPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string
  const invoiceId = params.invoiceId as string

  const [invoice] = useState(mockInvoice)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  const downloadPDF = () => {
    toast.success(`Descargando PDF de ${invoice.number}`, {
      description: 'El archivo PDF se está descargando'
    })
  }

  const downloadTXT = () => {
    toast.success(`Descargando TXT de ${invoice.number}`, {
      description: 'Archivo TXT para AFIP/ARCA'
    })
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      emitida: "bg-blue-500 text-white hover:bg-blue-600",
      pagada: "bg-green-500 text-white hover:bg-green-600", 
      vencida: "bg-red-500 text-white hover:bg-red-600",
      pendiente: "bg-yellow-500 text-white hover:bg-yellow-600"
    }
    const labels = {
      emitida: "Emitida",
      pagada: "Pagada",
      vencida: "Vencida",
      pendiente: "Pendiente"
    }
    return <Badge className={variants[status as keyof typeof variants]}>{labels[status as keyof typeof labels]}</Badge>
  }

  if (authLoading) return null
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push(`/company/${companyId}/invoices`)} className="mt-1">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{invoice.number}</h1>
                {getStatusBadge(invoice.status)}
              </div>
              <p className="text-muted-foreground">Factura Tipo {invoice.type} • {invoice.issuerCompany}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={downloadPDF} className="shadow-sm">
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button onClick={downloadTXT} variant="outline" className="shadow-sm">
              <FileText className="h-4 w-4 mr-2" />
              TXT
            </Button>
          </div>
        </div>

        {/* Información General */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cliente */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Razón Social</p>
                <p className="font-semibold">{invoice.receiverCompany}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">CUIT</p>
                <p>{invoice.receiverCuit}</p>
              </div>
            </CardContent>
          </Card>

          {/* Fechas y Moneda */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Fechas y Moneda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Emisión</p>
                  <p className="font-medium">{new Date(invoice.issueDate).toLocaleDateString('es-AR')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vencimiento</p>
                  <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString('es-AR')}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Moneda</p>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <p className="font-medium">{invoice.currency}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ítems */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Detalle de Ítems
            </CardTitle>
            <CardDescription>Productos y servicios facturados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold text-sm">Descripción</th>
                      <th className="text-center p-4 font-semibold text-sm w-24">Cant.</th>
                      <th className="text-right p-4 font-semibold text-sm w-32">Precio Unit.</th>
                      <th className="text-center p-4 font-semibold text-sm w-20">IVA</th>
                      <th className="text-right p-4 font-semibold text-sm w-32">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, index) => (
                      <tr key={item.id} className={index !== invoice.items.length - 1 ? "border-b" : ""}>
                        <td className="p-4">
                          <p className="font-medium">{item.description}</p>
                        </td>
                        <td className="p-4 text-center">{item.quantity}</td>
                        <td className="p-4 text-right text-sm">
                          {item.unitPrice.toLocaleString('es-AR', { style: 'currency', currency: invoice.currency })}
                        </td>
                        <td className="p-4 text-center">
                          <Badge variant="outline" className="text-xs">{item.taxRate}%</Badge>
                        </td>
                        <td className="p-4 text-right font-medium">
                          {item.subtotal.toLocaleString('es-AR', { style: 'currency', currency: invoice.currency })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Totales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Resumen de Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    {invoice.subtotal.toLocaleString('es-AR', { style: 'currency', currency: invoice.currency })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-t">
                  <span className="text-muted-foreground">Impuestos (IVA)</span>
                  <span className="font-medium">
                    {invoice.totalTaxes.toLocaleString('es-AR', { style: 'currency', currency: invoice.currency })}
                  </span>
                </div>
                {invoice.totalPerceptions > 0 && (
                  <div className="flex justify-between items-center py-2 border-t">
                    <span className="text-orange-600">Percepciones</span>
                    <span className="font-medium text-orange-600">
                      {invoice.totalPerceptions.toLocaleString('es-AR', { style: 'currency', currency: invoice.currency })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-3 border-t-2 text-lg font-bold">
                  <span>Total Factura</span>
                  <span className="text-primary">
                    {invoice.total.toLocaleString('es-AR', { style: 'currency', currency: invoice.currency })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {invoice.status === 'pagada' && invoice.totalRetentions && invoice.totalRetentions > 0 && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Pago Recibido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Total Factura</span>
                    <span className="font-medium">
                      {invoice.total.toLocaleString('es-AR', { style: 'currency', currency: invoice.currency })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t">
                    <span className="text-red-600">Retenciones</span>
                    <span className="font-medium text-red-600">
                      -{invoice.totalRetentions.toLocaleString('es-AR', { style: 'currency', currency: invoice.currency })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-t-2 text-xl font-bold">
                    <span className="text-green-700">Total Cobrado</span>
                    <span className="text-green-700">
                      {(invoice.total - invoice.totalRetentions).toLocaleString('es-AR', { style: 'currency', currency: invoice.currency })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Notas */}
        {invoice.notes && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Observaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{invoice.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}