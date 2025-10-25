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

const formatCurrency = (amount: number, currency: string) => {
  const formatted = amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const formats: Record<string, string> = {
    'ARS': `ARS $${formatted}`,
    'USD': `USD $${formatted}`,
    'EUR': `EUR €${formatted}`
  }
  return formats[currency] || `ARS $${formatted}`
}

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

  const clientName = invoice.receiver_name || invoice.client?.business_name || 
                     (invoice.client?.first_name && invoice.client?.last_name 
                       ? `${invoice.client.first_name} ${invoice.client.last_name}` 
                       : 'Sin cliente')
  const clientDoc = invoice.receiver_document || invoice.client?.document_number || 'N/A'
  const docLabel = invoice.client?.tax_condition === 'final_consumer' ? 'DNI' : 'CUIT'
  
  // Determinar si la empresa actual es emisor o receptor
  const isIssuer = invoice.issuer_company_id === companyId

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
                {getStatusBadge(invoice.display_status || invoice.status)}
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
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Información del Comprobante</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <Building2 className="h-4 w-4" />
                  <h3 className="font-semibold text-sm">Cliente</h3>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Razón Social</p>
                  <p className="font-medium text-sm">{clientName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{docLabel}</p>
                  <p className="font-medium text-sm">{clientDoc}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <Calendar className="h-4 w-4" />
                  <h3 className="font-semibold text-sm">Fechas</h3>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Emisión</p>
                  <p className="font-medium text-sm">{new Date(invoice.issue_date).toLocaleDateString('es-AR')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vencimiento</p>
                  <p className="font-medium text-sm">{new Date(invoice.due_date).toLocaleDateString('es-AR')}</p>
                </div>
                {invoice.service_date_from && invoice.service_date_to && (
                  <div>
                    <p className="text-xs text-muted-foreground">Período Servicio</p>
                    <p className="font-medium text-xs">
                      {new Date(invoice.service_date_from).toLocaleDateString('es-AR')} - {new Date(invoice.service_date_to).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <Hash className="h-4 w-4" />
                  <h3 className="font-semibold text-sm">Datos AFIP</h3>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Punto de Venta</p>
                  <p className="font-medium text-sm">{invoice.sales_point?.toString().padStart(4, '0')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Concepto</p>
                  <p className="font-medium text-sm">
                    {invoice.concept === 'products' && 'Productos'}
                    {invoice.concept === 'services' && 'Servicios'}
                    {invoice.concept === 'products_services' && 'Productos y Servicios'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Moneda</p>
                  <p className="font-medium text-sm">{invoice.currency}{invoice.exchange_rate && invoice.exchange_rate !== '1.00' ? ` (${invoice.exchange_rate})` : ''}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <FileText className="h-4 w-4" />
                  <h3 className="font-semibold text-sm">CAE</h3>
                </div>
                {invoice.afip_cae ? (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground">Número</p>
                      <p className="font-mono text-sm font-semibold text-green-700">{invoice.afip_cae}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Vencimiento</p>
                      <p className="font-medium text-sm">{new Date(invoice.afip_cae_due_date).toLocaleDateString('es-AR')}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin CAE</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ítems */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Detalle de Ítems</CardTitle>
            <CardDescription>Productos y servicios facturados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold text-xs">Descripción</th>
                      <th className="text-center p-3 font-semibold text-xs w-16">Cant.</th>
                      <th className="text-right p-3 font-semibold text-xs w-24">P. Unit.</th>
                      <th className="text-center p-3 font-semibold text-xs w-16">Bonif.</th>
                      <th className="text-center p-3 font-semibold text-xs w-16">IVA</th>
                      <th className="text-right p-3 font-semibold text-xs w-24">IVA $</th>
                      <th className="text-right p-3 font-semibold text-xs w-28">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items?.map((item: any, index: number) => {
                      const qty = parseFloat(item.quantity)
                      const unitPrice = parseFloat(item.unit_price)
                      const discount = parseFloat(item.discount_percentage || 0)
                      const taxRate = parseFloat(item.tax_rate)
                      const subtotal = parseFloat(item.subtotal)
                      const taxAmount = parseFloat(item.tax_amount || 0)
                      const total = subtotal + taxAmount
                      
                      return (
                        <tr key={item.id} className={index !== invoice.items.length - 1 ? "border-b" : ""}>
                          <td className="p-3">
                            <p className="font-medium text-sm">{item.description}</p>
                          </td>
                          <td className="p-3 text-center text-sm">{qty}</td>
                          <td className="p-3 text-right text-xs">
                            {formatCurrency(unitPrice, invoice.currency)}
                          </td>
                          <td className="p-3 text-center">
                            {discount > 0 ? <Badge variant="secondary" className="text-xs">{discount}%</Badge> : <span className="text-xs text-muted-foreground">-</span>}
                          </td>
                          <td className="p-3 text-center">
                            <Badge variant="outline" className="text-xs">{taxRate}%</Badge>
                          </td>
                          <td className="p-3 text-right text-xs text-muted-foreground">
                            {formatCurrency(taxAmount, invoice.currency)}
                          </td>
                          <td className="p-3 text-right font-semibold text-sm">
                            {formatCurrency(total, invoice.currency)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Totales y Estado de Pago */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Resumen de Totales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-sm">
                    {formatCurrency(parseFloat(invoice.subtotal), invoice.currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-t">
                  <span className="text-sm text-muted-foreground">Impuestos (IVA)</span>
                  <span className="font-medium text-sm">
                    {formatCurrency(parseFloat(invoice.total_taxes), invoice.currency)}
                  </span>
                </div>
                {parseFloat(invoice.total_perceptions || 0) > 0 && (
                  <div className="flex justify-between items-center py-1.5 border-t">
                    <span className="text-sm text-orange-600">Percepciones</span>
                    <span className="font-medium text-sm text-orange-600">
                      {formatCurrency(parseFloat(invoice.total_perceptions), invoice.currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-t-2">
                  <span className="font-bold">Total Factura</span>
                  <span className="font-bold text-lg text-primary">
                    {formatCurrency(parseFloat(invoice.total), invoice.currency)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estado de Pago / Retenciones */}
          {invoice.status === 'paid' ? (
            <Card className="shadow-sm border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="text-green-700">{isIssuer ? 'Pago Recibido' : 'Pago Realizado'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Total Factura</span>
                    <span className="font-medium">
                      {formatCurrency(parseFloat(invoice.total), invoice.currency)}
                    </span>
                  </div>
                  {invoice.total_retentions && parseFloat(invoice.total_retentions) > 0 && (
                    <div className="flex justify-between items-center py-2 border-t">
                      <span className="text-red-600">Retenciones</span>
                      <span className="font-medium text-red-600">
                        -{formatCurrency(parseFloat(invoice.total_retentions), invoice.currency)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-3 border-t-2 text-lg font-bold">
                    <span className="text-green-700">{isIssuer ? 'Total Cobrado' : 'Total Pagado'}</span>
                    <span className="text-green-700">
                      {formatCurrency(
                        parseFloat(invoice.total) - parseFloat(invoice.total_retentions || 0),
                        invoice.currency
                      )}
                    </span>
                  </div>
                  {invoice.retentions && invoice.retentions.length > 0 && (
                    <div className="pt-3 border-t space-y-2">
                      <h4 className="font-semibold text-xs text-red-700 mb-2">Detalle de Retenciones</h4>
                      {invoice.retentions.map((retention: any, index: number) => (
                        <div key={index} className="flex justify-between items-center py-1">
                          <div>
                            <p className="font-medium text-xs">{retention.name}</p>
                            <p className="text-xs text-muted-foreground">{retention.rate}%</p>
                          </div>
                          <span className="font-medium text-sm text-red-600">
                            {formatCurrency(parseFloat(retention.amount), invoice.currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm border-amber-200 bg-amber-50/50">
              <CardHeader>
                <CardTitle className="text-amber-700">{isIssuer ? 'Pendiente de Cobro' : 'Pendiente de Pago'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-2">
                    {isIssuer ? 'Esta factura aún no ha sido cobrada' : 'Esta factura aún no ha sido pagada'}
                  </p>
                  <p className="text-2xl font-bold text-amber-700">
                    {formatCurrency(parseFloat(invoice.total), invoice.currency)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-4">
                    {isIssuer ? 'Las retenciones se registrarán al momento del cobro' : 'Las retenciones se registrarán al momento del pago'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Percepciones Detail */}
        {invoice.perceptions && invoice.perceptions.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-orange-600" />
                Detalle de Percepciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {invoice.perceptions.map((perception: any, index: number) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{perception.name}</p>
                      <p className="text-xs text-muted-foreground">{perception.rate}% sobre {perception.base_type === 'net' ? 'Neto' : perception.base_type === 'total' ? 'Total' : 'IVA'}</p>
                    </div>
                    <span className="font-medium text-orange-600">
                      {formatCurrency(parseFloat(perception.amount), invoice.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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