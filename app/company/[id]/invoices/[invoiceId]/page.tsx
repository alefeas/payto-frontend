"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Download, FileText, Building2, Calendar, DollarSign, User, CreditCard, Hash, Percent, Loader2 } from "lucide-react"
import { invoiceService } from "@/services/invoice.service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

export default function InvoiceDetailPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string
  const invoiceId = params.invoiceId as string

  const [invoice, setInvoice] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(`/company/${companyId}/invoices`)
    }
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    const loadInvoice = async () => {
      if (!companyId || !invoiceId) return
      
      setIsLoading(true)
      try {
        const data = await invoiceService.getInvoice(companyId, invoiceId)
        setInvoice(data)
      } catch (error: any) {
        toast.error('Error al cargar factura', {
          description: error.response?.data?.message || 'Intente nuevamente'
        })
        router.push(`/company/${companyId}/invoices`)
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated && companyId && invoiceId) {
      loadInvoice()
    }
  }, [isAuthenticated, companyId, invoiceId, router])

  const downloadPDF = async () => {
    try {
      const blob = await invoiceService.downloadPDF(companyId, invoiceId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoice.number}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('PDF descargado')
    } catch (error) {
      toast.error('Error al descargar PDF')
    }
  }

  const downloadTXT = async () => {
    try {
      const blob = await invoiceService.downloadTXT(companyId, invoiceId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoice.number}.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('TXT descargado')
    } catch (error) {
      toast.error('Error al descargar TXT')
    }
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

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }
  if (!isAuthenticated || !invoice) return null

  const clientName = invoice.client?.business_name || 
                     (invoice.client?.first_name && invoice.client?.last_name 
                       ? `${invoice.client.first_name} ${invoice.client.last_name}` 
                       : 'Sin cliente')
  const clientDoc = invoice.client?.document_number || 'N/A'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button variant="outline" size="icon" onClick={handleBack} className="mt-1">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{invoice.number}</h1>
                {getStatusBadge(invoice.status)}
              </div>
              <p className="text-muted-foreground">Factura Tipo {invoice.type}</p>
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
                <p className="font-semibold">{clientName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">CUIT</p>
                <p>{clientDoc}</p>
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
                  <p className="font-medium">{new Date(invoice.issue_date).toLocaleDateString('es-AR')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vencimiento</p>
                  <p className="font-medium">{new Date(invoice.due_date).toLocaleDateString('es-AR')}</p>
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
                    {invoice.items?.map((item: any, index: number) => (
                      <tr key={item.id} className={index !== invoice.items.length - 1 ? "border-b" : ""}>
                        <td className="p-4">
                          <p className="font-medium">{item.description}</p>
                        </td>
                        <td className="p-4 text-center">{parseFloat(item.quantity)}</td>
                        <td className="p-4 text-right text-sm">
                          {parseFloat(item.unit_price).toLocaleString('es-AR', { style: 'currency', currency: invoice.currency })}
                        </td>
                        <td className="p-4 text-center">
                          <Badge variant="outline" className="text-xs">{parseFloat(item.tax_rate)}%</Badge>
                        </td>
                        <td className="p-4 text-right font-medium">
                          {parseFloat(item.subtotal).toLocaleString('es-AR', { style: 'currency', currency: invoice.currency })}
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
                    {parseFloat(invoice.subtotal).toLocaleString('es-AR', { style: 'currency', currency: invoice.currency })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-t">
                  <span className="text-muted-foreground">Impuestos (IVA)</span>
                  <span className="font-medium">
                    {parseFloat(invoice.total_taxes).toLocaleString('es-AR', { style: 'currency', currency: invoice.currency })}
                  </span>
                </div>
                {parseFloat(invoice.total_perceptions || 0) > 0 && (
                  <div className="flex justify-between items-center py-2 border-t">
                    <span className="text-orange-600">Percepciones</span>
                    <span className="font-medium text-orange-600">
                      {parseFloat(invoice.total_perceptions).toLocaleString('es-AR', { style: 'currency', currency: invoice.currency })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-3 border-t-2 text-lg font-bold">
                  <span>Total Factura</span>
                  <span className="text-primary">
                    {parseFloat(invoice.total).toLocaleString('es-AR', { style: 'currency', currency: invoice.currency })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {invoice.status === 'paid' && invoice.total_retentions && parseFloat(invoice.total_retentions) > 0 && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Pago Recibido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Total Factura</span>
                    <span className="font-medium">
                      {parseFloat(invoice.total).toLocaleString('es-AR', { style: 'currency', currency: invoice.currency })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t">
                    <span className="text-red-600">Retenciones</span>
                    <span className="font-medium text-red-600">
                      -{parseFloat(invoice.total_retentions).toLocaleString('es-AR', { style: 'currency', currency: invoice.currency })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-t-2 text-xl font-bold">
                    <span className="text-green-700">Total Cobrado</span>
                    <span className="text-green-700">
                      {(parseFloat(invoice.total) - parseFloat(invoice.total_retentions)).toLocaleString('es-AR', { style: 'currency', currency: invoice.currency })}
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