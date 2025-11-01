"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Download, FileText, Building2, Calendar, DollarSign, User, CreditCard, Hash, Percent, Edit2, Save, X, AlertCircle, Trash2, Loader2 } from "lucide-react"
import { invoiceService } from "@/services/invoice.service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editForm, setEditForm] = useState({
    concept: '',
    service_date_from: '',
    service_date_to: '',
    items: [] as Array<{ description: string }>
  })

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(`/company/${companyId}/invoices`)
    }
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/log-in')
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
        toast.error('Error al cargar comprobante', {
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

  const startEditing = () => {
    setEditForm({
      concept: invoice.concept || 'products',
      service_date_from: invoice.service_date_from ? new Date(invoice.service_date_from).toISOString().split('T')[0] : '',
      service_date_to: invoice.service_date_to ? new Date(invoice.service_date_to).toISOString().split('T')[0] : '',
      items: invoice.items?.map((item: any) => ({ description: item.description })) || []
    })
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
  }

  const saveChanges = async () => {
    if (editForm.concept === 'services' || editForm.concept === 'products_services') {
      if (!editForm.service_date_from || !editForm.service_date_to) {
        toast.error('Las fechas de servicio son obligatorias para servicios')
        return
      }
      if (editForm.service_date_to < editForm.service_date_from) {
        toast.error('La fecha de fin del servicio debe ser igual o posterior a la fecha de inicio')
        return
      }
    }

    if (editForm.items.some(item => !item.description.trim())) {
      toast.error('Todos los items deben tener descripción')
      return
    }

    setIsSaving(true)
    try {
      await invoiceService.updateSyncedInvoice(companyId, invoiceId, editForm)
      const updatedInvoice = await invoiceService.getInvoice(companyId, invoiceId)
      setInvoice(updatedInvoice)
      setIsEditing(false)
      toast.success('Comprobante actualizado correctamente')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar comprobante')
    } finally {
      setIsSaving(false)
    }
  }

  const downloadPDF = async () => {
    try {
      const blob = await invoiceService.downloadPDF(companyId, invoiceId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `comprobante-${invoice.number}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('PDF descargado')
    } catch (error: any) {
      console.error('PDF download error:', error)
      toast.error('Error al descargar PDF', {
        description: error.response?.data?.error || error.message || 'Intente nuevamente'
      })
    }
  }

  const downloadTXT = async () => {
    try {
      const blob = await invoiceService.downloadTXT(companyId, invoiceId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `comprobante-${invoice.number}.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('TXT descargado')
    } catch (error: any) {
      console.error('TXT download error:', error)
      toast.error('Error al descargar TXT', {
        description: error.response?.data?.error || error.message || 'Intente nuevamente'
      })
    }
  }

  const downloadAttachment = async () => {
    try {
      const blob = await invoiceService.downloadAttachment(companyId, invoiceId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = invoice.attachment_original_name || `comprobante-${invoice.number}-original.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('PDF original descargado')
    } catch (error: any) {
      console.error('Attachment download error:', error)
      toast.error('Error al descargar PDF original', {
        description: error.response?.data?.error || error.message || 'Intente nuevamente'
      })
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await invoiceService.deleteInvoice(companyId, invoiceId)
      toast.success('Comprobante eliminado correctamente')
      router.push(`/company/${companyId}/invoices`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar comprobante')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-muted rounded animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
              <div className="h-10 w-24 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
          <div className="h-64 bg-muted rounded animate-pulse"></div>
          <div className="h-96 bg-muted rounded animate-pulse"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-muted rounded animate-pulse"></div>
            <div className="h-64 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
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
  
  // Obtener el estado para esta empresa específica
  const companyStatus = invoice.company_statuses?.[companyId] || invoice.status
  const isPaid = companyStatus === 'paid' || companyStatus === 'collected'
  
  // Calcular total de retenciones
  const totalWithholdings = (
    parseFloat(invoice.withholding_iibb || 0) +
    parseFloat(invoice.withholding_iva || 0) +
    parseFloat(invoice.withholding_ganancias || 0) +
    parseFloat(invoice.withholding_suss || 0) +
    parseFloat(invoice.withholding_other || 0)
  )
  
  // Preparar array de retenciones para mostrar
  const withholdingsArray = []
  if (parseFloat(invoice.withholding_iibb || 0) > 0) {
    withholdingsArray.push({
      name: invoice.withholding_iibb_notes || 'Retención IIBB',
      amount: invoice.withholding_iibb
    })
  }
  if (parseFloat(invoice.withholding_iva || 0) > 0) {
    withholdingsArray.push({
      name: invoice.withholding_iva_notes || 'Retención IVA',
      amount: invoice.withholding_iva
    })
  }
  if (parseFloat(invoice.withholding_ganancias || 0) > 0) {
    withholdingsArray.push({
      name: invoice.withholding_ganancias_notes || 'Retención Ganancias',
      amount: invoice.withholding_ganancias
    })
  }
  if (parseFloat(invoice.withholding_suss || 0) > 0) {
    withholdingsArray.push({
      name: invoice.withholding_suss_notes || 'Retención SUSS',
      amount: invoice.withholding_suss
    })
  }
  if (parseFloat(invoice.withholding_other || 0) > 0) {
    withholdingsArray.push({
      name: invoice.withholding_other_notes || 'Otra Retención',
      amount: invoice.withholding_other
    })
  }

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
                {invoice.is_manual_load ? (
                  <Badge variant="outline" className="border-orange-300 text-orange-700 bg-orange-50">Carga Manual</Badge>
                ) : invoice.synced_from_afip ? (
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200">Sinc. AFIP</Badge>
                ) : invoice.afip_cae && !invoice.is_manual_load && !invoice.synced_from_afip ? (
                  <Badge className="bg-green-50 text-green-700 border-green-200">Subidas a AFIP</Badge>
                ) : null}
              </div>
              <p className="text-muted-foreground">Comprobante Tipo {invoice.type}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {invoice.is_manual_load && !isEditing ? (
              <Button 
                onClick={() => setShowDeleteDialog(true)}
                variant="destructive" 
                className="shadow-sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            ) : null}
            {invoice.synced_from_afip && !isEditing ? (
              <Button 
                onClick={startEditing}
                variant="outline" 
                className="shadow-sm"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Editar
              </Button>
            ) : null}
            {isEditing ? (
              <>
                <Button 
                  onClick={saveChanges}
                  disabled={isSaving}
                  className="shadow-sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </Button>
                <Button 
                  onClick={cancelEditing}
                  variant="outline"
                  disabled={isSaving}
                  className="shadow-sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <Button onClick={downloadPDF} className="shadow-sm">
                  <Download className="h-4 w-4 mr-2" />
                  PDF Sistema
                </Button>
                {invoice.attachment_path && (
                  <Button onClick={downloadAttachment} variant="outline" className="shadow-sm border-blue-300 text-blue-700 hover:bg-blue-50">
                    <FileText className="h-4 w-4 mr-2" />
                    PDF Original
                  </Button>
                )}
                <Button onClick={downloadTXT} variant="outline" className="shadow-sm">
                  <FileText className="h-4 w-4 mr-2" />
                  TXT
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Alert for editing mode */}
        {isEditing && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <strong>Limitación de AFIP:</strong> AFIP no proporciona el detalle de ítems, solo totales. 
                Podés editar la descripción del ítem genérico, el concepto y las fechas de servicio para tu organización interna, 
                pero los montos, cantidades y precios no se pueden modificar ya que deben coincidir con AFIP.
              </div>
            </div>
          </div>
        )}

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
                {(isEditing && (editForm.concept === 'services' || editForm.concept === 'products_services')) || (!isEditing && invoice.service_date_from && invoice.service_date_to) ? (
                  <div>
                    <p className="text-xs text-muted-foreground">Período Servicio {isEditing && '*'}</p>
                    {isEditing ? (
                      <div className="space-y-2">
                        <Input
                          type="date"
                          value={editForm.service_date_from}
                          onChange={(e) => setEditForm({...editForm, service_date_from: e.target.value})}
                          className="h-8 text-xs bg-slate-50 border-slate-300 focus:ring-slate-500"
                        />
                        <Input
                          type="date"
                          value={editForm.service_date_to}
                          onChange={(e) => setEditForm({...editForm, service_date_to: e.target.value})}
                          className="h-8 text-xs bg-slate-50 border-slate-300 focus:ring-slate-500"
                        />
                      </div>
                    ) : (
                      <p className="font-medium text-xs">
                        {new Date(invoice.service_date_from).toLocaleDateString('es-AR')} - {new Date(invoice.service_date_to).toLocaleDateString('es-AR')}
                      </p>
                    )}
                  </div>
                ) : null}
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
                  {isEditing ? (
                    <Select 
                      value={editForm.concept}
                      onValueChange={(value) => setEditForm({...editForm, concept: value})}
                    >
                      <SelectTrigger className="h-8 text-sm bg-slate-50 border-slate-300 focus:ring-slate-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="products">Productos</SelectItem>
                        <SelectItem value="services">Servicios</SelectItem>
                        <SelectItem value="products_services">Productos y Servicios</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="font-medium text-sm">
                      {invoice.concept === 'products' && 'Productos'}
                      {invoice.concept === 'services' && 'Servicios'}
                      {invoice.concept === 'products_services' && 'Productos y Servicios'}
                    </p>
                  )}
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
            <CardDescription>Productos y servicios del comprobante</CardDescription>
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
                            {isEditing ? (
                              <Input
                                type="text"
                                value={editForm.items[index]?.description || ''}
                                onChange={(e) => {
                                  const newItems = [...editForm.items]
                                  newItems[index] = { description: e.target.value }
                                  setEditForm({...editForm, items: newItems})
                                }}
                                className="h-9 text-sm bg-slate-50 border-slate-300 focus:ring-slate-500"
                                placeholder="Descripción del ítem"
                              />
                            ) : (
                              <p className="font-medium text-sm">{item.description}</p>
                            )}
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
                  <span className="font-bold">Total Comprobante</span>
                  <span className="font-bold text-lg text-primary">
                    {formatCurrency(parseFloat(invoice.total), invoice.currency)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estado de Pago / Retenciones */}
          {isPaid ? (
            <Card className="shadow-sm border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="text-green-700">{isIssuer ? 'Pago Recibido' : 'Pago Realizado'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Total Comprobante</span>
                    <span className="font-medium">
                      {formatCurrency(parseFloat(invoice.total), invoice.currency)}
                    </span>
                  </div>
                  {totalWithholdings > 0 && (
                    <div className="flex justify-between items-center py-2 border-t">
                      <span className="text-orange-600">Retenciones</span>
                      <span className="font-medium text-orange-600">
                        -{formatCurrency(totalWithholdings, invoice.currency)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-3 border-t-2 text-lg font-bold">
                    <span className="text-green-700">{isIssuer ? 'Total Cobrado' : 'Total Pagado'}</span>
                    <span className="text-green-700">
                      {formatCurrency(
                        parseFloat(invoice.total) - totalWithholdings,
                        invoice.currency
                      )}
                    </span>
                  </div>
                  {withholdingsArray.length > 0 ? (
                    <div className="pt-3 border-t space-y-2">
                      <h4 className="font-semibold text-sm text-orange-700 mb-3 flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Detalle de Retenciones
                      </h4>
                      <div className="space-y-2">
                        {withholdingsArray.map((withholding: any, index: number) => (
                          <div key={index} className="flex justify-between items-center py-2.5 px-3 bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-8 bg-orange-500 rounded-full"></div>
                              <p className="font-medium text-sm text-gray-800">{withholding.name}</p>
                            </div>
                            <span className="font-bold text-sm text-orange-700 bg-white px-3 py-1 rounded-md shadow-sm">
                              {formatCurrency(parseFloat(withholding.amount), invoice.currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground text-center py-2">
                        {isIssuer ? 'No se aplicaron retenciones en este cobro' : 'No se aplicaron retenciones en este pago'}
                      </p>
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
                    {isIssuer ? 'Este comprobante aún no ha sido cobrado' : 'Este comprobante aún no ha sido pagado'}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar comprobante manual?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. El comprobante {invoice?.number} será eliminado permanentemente del sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Comprobante
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}