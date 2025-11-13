"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Download, FileText, Building2, Calendar, DollarSign, Hash, Percent, Edit2, Save, X, AlertCircle, Trash2, Loader2, Eye, ShoppingCart, Calculator, Clock, MessageSquare, Shield, Receipt } from "lucide-react"
import { invoiceService } from "@/services/invoice.service"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InvoiceDetailSkeleton } from "@/components/invoices/InvoiceDetailSkeleton"
import { Badge } from "@/components/ui/badge"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { parseDateLocal, formatDateToLocal } from "@/lib/utils"
import { colors } from "@/styles"

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
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false)
  const [isDownloadingTXT, setIsDownloadingTXT] = useState(false)
  const [isDownloadingAttachment, setIsDownloadingAttachment] = useState(false)
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
    const dateFrom = invoice.service_date_from ? parseDateLocal(invoice.service_date_from) : null
    const dateTo = invoice.service_date_to ? parseDateLocal(invoice.service_date_to) : null
    
    setEditForm({
      concept: invoice.concept || 'products',
      service_date_from: dateFrom ? formatDateToLocal(dateFrom) : '',
      service_date_to: dateTo ? formatDateToLocal(dateTo) : '',
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
    setIsDownloadingPDF(true)
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
      toast.error('Error al descargar PDF', {
        description: error.response?.data?.error || error.message || 'Intente nuevamente'
      })
    } finally {
      setIsDownloadingPDF(false)
    }
  }

  const downloadTXT = async () => {
    setIsDownloadingTXT(true)
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
      toast.error('Error al descargar TXT', {
        description: error.response?.data?.error || error.message || 'Intente nuevamente'
      })
    } finally {
      setIsDownloadingTXT(false)
    }
  }

  const downloadAttachment = async () => {
    setIsDownloadingAttachment(true)
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
      toast.error('Error al descargar PDF original', {
        description: error.response?.data?.error || error.message || 'Intente nuevamente'
      })
    } finally {
      setIsDownloadingAttachment(false)
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
    const variants: Record<string, { label: string; className: string }> = {
      // Español - usando colores suaves originales
      emitida: { label: "Emitida", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
      pagada: { label: "Pagada", className: "bg-green-50 text-green-700 border-green-200" },
      cobrada: { label: "Cobrada", className: "bg-green-50 text-green-700 border-green-200" },
      vencida: { label: "Vencida", className: "bg-red-50 text-red-700 border-red-200" },
      pendiente: { label: "Pendiente", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      aprobada: { label: "Aprobada", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      rechazada: { label: "Rechazada", className: "bg-red-50 text-red-700 border-red-200" },
      anulada: { label: "Anulada", className: "bg-gray-50 text-gray-600 border-gray-200" },
      // Inglés mapeado a labels en español
      issued: { label: "Emitida", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
      paid: { label: "Pagada", className: "bg-green-50 text-green-700 border-green-200" },
      collected: { label: "Cobrada", className: "bg-green-50 text-green-700 border-green-200" },
      pending: { label: "Pendiente", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      approved: { label: "Aprobada", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      rejected: { label: "Rechazada", className: "bg-red-50 text-red-700 border-red-200" },
      cancelled: { label: "Anulada", className: "bg-gray-50 text-gray-600 border-gray-200" },
      canceled: { label: "Anulada", className: "bg-gray-50 text-gray-600 border-gray-200" },
      overdue: { label: "Vencida", className: "bg-red-50 text-red-700 border-red-200" },
      expired: { label: "Vencida", className: "bg-red-50 text-red-700 border-red-200" },
      // Estados adicionales que pueden aparecer como nombres de campo
      pending_approval: { label: "Pend. Aprobación", className: "bg-blue-50 text-blue-700 border-blue-200" },
      partially_cancelled: { label: "Parc. Anulada", className: "bg-orange-50 text-orange-700 border-orange-200" },
      partial: { label: "Pago Parcial", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    }
    const key = status?.toLowerCase().replace(/\s+/g, '_')
    const conf = variants[key] || { label: status, className: "bg-gray-50 text-gray-600 border-gray-200" }
    return <Badge className={conf.className}>{conf.label}</Badge>
  }

  if (authLoading || isLoading) {
    return <InvoiceDetailSkeleton />
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
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="mt-1">
              <BackButton onClick={handleBack} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 break-words">{invoice.number}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                {getStatusBadge(invoice.display_status || invoice.status)}
                <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                  Tipo {invoice.type}
                </Badge>
                {invoice.is_manual_load ? (
                  <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                    Carga Manual
                  </Badge>
                ) : invoice.synced_from_afip ? (
                  <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                    Sinc. AFIP
                  </Badge>
                ) : invoice.afip_cae && !invoice.is_manual_load && !invoice.synced_from_afip ? (
                  <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                    Subidas a AFIP
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                    Manual
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:flex-nowrap">
            {invoice.is_manual_load && !isEditing ? (
              <Button 
                onClick={() => setShowDeleteDialog(true)}
                variant="destructive" 
                className="shadow-sm"
                size="sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Eliminar</span>
              </Button>
            ) : null}
            {invoice.synced_from_afip && !isEditing ? (
              <Button 
                onClick={startEditing}
                variant="outline" 
                className="shadow-sm"
                size="sm"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Editar</span>
              </Button>
            ) : null}
            {isEditing ? (
              <>
                <Button 
                  onClick={saveChanges}
                  disabled={isSaving}
                  className="shadow-sm"
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </Button>
                <Button 
                  onClick={cancelEditing}
                  variant="outline"
                  disabled={isSaving}
                  className="shadow-sm"
                  size="sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <Button onClick={downloadPDF} disabled={isDownloadingPDF} className="shadow-sm" size="sm">
                  {isDownloadingPDF ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span className="hidden sm:inline">Generando...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">PDF Sistema</span>
                      <span className="sm:hidden">PDF</span>
                    </>
                  )}
                </Button>
                {invoice.attachment_path && (
                  <Button onClick={downloadAttachment} disabled={isDownloadingAttachment} variant="outline" className="shadow-sm" size="sm">
                    {isDownloadingAttachment ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        <span className="hidden sm:inline">Descargando...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">PDF Original</span>
                        <span className="sm:hidden">Orig</span>
                      </>
                    )}
                  </Button>
                )}
                <Button onClick={downloadTXT} disabled={isDownloadingTXT} variant="outline" className="shadow-sm" size="sm">
                  {isDownloadingTXT ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span className="hidden sm:inline">Generando...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      TXT
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>



        {/* Alert for editing mode */}
        {isEditing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: colors.accent }} />
              <div className="text-sm text-blue-800">
                <strong>Limitación de AFIP:</strong> AFIP no proporciona el detalle de ítems, solo totales. 
                Podés editar la descripción del ítem genérico, el concepto y las fechas de servicio para tu organización interna, 
                pero los montos, cantidades y precios no se pueden modificar ya que deben coincidir con AFIP.
              </div>
            </div>
          </div>
        )}

        {/* Información General */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="border-b border-gray-100/60">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <FileText className="h-5 w-5" style={{ color: colors.accent }} />
              Información del Comprobante
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4" style={{ color: colors.accent }} />
                  <h3 className="font-semibold text-sm text-gray-800">Cliente</h3>
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
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4" style={{ color: colors.accent }} />
                  <h3 className="font-semibold text-sm text-gray-800">Fechas</h3>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Emisión</p>
                  <p className="font-medium text-sm">{parseDateLocal(invoice.issue_date)?.toLocaleDateString('es-AR') || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vencimiento</p>
                  <p className="font-medium text-sm">{parseDateLocal(invoice.due_date)?.toLocaleDateString('es-AR') || 'N/A'}</p>
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
                        {parseDateLocal(invoice.service_date_from)?.toLocaleDateString('es-AR') || 'N/A'} - {parseDateLocal(invoice.service_date_to)?.toLocaleDateString('es-AR') || 'N/A'}
                      </p>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Hash className="h-4 w-4" style={{ color: colors.accent }} />
                  <h3 className="font-semibold text-sm text-gray-800">Datos AFIP</h3>
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
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield className="h-4 w-4" style={{ color: colors.accent }} />
                  <h3 className="font-semibold text-sm text-gray-800">CAE</h3>
                </div>
                {invoice.afip_cae ? (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground">Número</p>
                      <p className="font-mono text-sm font-semibold text-foreground">{invoice.afip_cae}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Vencimiento</p>
                      <p className="font-medium text-sm">{parseDateLocal(invoice.afip_cae_due_date)?.toLocaleDateString('es-AR') || 'N/A'}</p>
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
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="border-b border-gray-100/60">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <ShoppingCart className="h-5 w-5" style={{ color: colors.accent }} />
              Detalle de Ítems
            </CardTitle>
            <CardDescription>Productos y servicios del comprobante</CardDescription>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
            {/* Desktop Table */}
            <div className="hidden md:block">
              <div className="grid grid-cols-7 gap-3 py-2 mb-3 border-b border-gray-200/60">
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-muted-foreground">Descripción</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-muted-foreground">Cant.</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-muted-foreground">P. Unit.</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-muted-foreground">Bonif.</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-muted-foreground">IVA</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-muted-foreground">Total</p>
                </div>
              </div>
              <div className="space-y-3">
                {invoice.items?.map((item: any, index: number) => {
                  const qty = parseFloat(item.quantity)
                  const unitPrice = parseFloat(item.unit_price)
                  const discount = parseFloat(item.discount_percentage || 0)
                  const taxRate = parseFloat(item.tax_rate)
                  const subtotal = parseFloat(item.subtotal)
                  const taxAmount = parseFloat(item.tax_amount || 0)
                  const total = subtotal + taxAmount
                  
                  return (
                    <div key={item.id}>
                      <div className="grid grid-cols-7 gap-3 py-3">
                        <div className="col-span-2">
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
                        </div>
                        <div className="text-center">
                          <p className="text-sm">{qty}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs">{formatCurrency(unitPrice, invoice.currency)}</p>
                        </div>
                        <div className="text-center">
                          {discount > 0 ? <Badge variant="secondary" className="text-xs">{discount}%</Badge> : <span className="text-xs text-muted-foreground">-</span>}
                        </div>
                        <div className="text-center">
                          {item.tax_category === 'exempt' ? (
                            <div className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium border border-gray-300 rounded-full bg-gray-50">
                              Exento
                            </div>
                          ) : item.tax_category === 'not_taxed' ? (
                            <div className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium border border-gray-300 rounded-full bg-gray-50">
                              No Grav.
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium border border-gray-300 rounded-full bg-gray-50">
                              {taxRate}%
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">{formatCurrency(total, invoice.currency)}</p>
                        </div>
                      </div>
{index !== invoice.items.length - 1 && <div className="border-b border-gray-200/40" />}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {invoice.items?.map((item: any, index: number) => {
                const qty = parseFloat(item.quantity)
                const unitPrice = parseFloat(item.unit_price)
                const discount = parseFloat(item.discount_percentage || 0)
                const taxRate = parseFloat(item.tax_rate)
                const subtotal = parseFloat(item.subtotal)
                const taxAmount = parseFloat(item.tax_amount || 0)
                const total = subtotal + taxAmount
                
                return (
                  <div key={item.id} className="bg-gray-50/50 border border-gray-200/60 rounded-lg p-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Descripción</p>
                        {isEditing ? (
                          <Input
                            type="text"
                            value={editForm.items[index]?.description || ''}
                            onChange={(e) => {
                              const newItems = [...editForm.items]
                              newItems[index] = { description: e.target.value }
                              setEditForm({...editForm, items: newItems})
                            }}
                            className="h-9 text-sm bg-white border-gray-300 focus:ring-slate-500"
                            placeholder="Descripción del ítem"
                          />
                        ) : (
                          <p className="font-medium text-sm">{item.description}</p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Cantidad</p>
                          <p className="text-sm">{qty}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">P. Unit.</p>
                          <p className="text-sm">{formatCurrency(unitPrice, invoice.currency)}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Bonificación</p>
                          {discount > 0 ? (
                            <Badge variant="secondary" className="text-xs">{discount}%</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">IVA</p>
                          {item.tax_category === 'exempt' ? (
                            <Badge variant="outline" className="text-xs">Exento</Badge>
                          ) : item.tax_category === 'not_taxed' ? (
                            <Badge variant="outline" className="text-xs">No Grav.</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">{taxRate}%</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-200/60 pt-3">
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-semibold text-muted-foreground">Total</p>
                          <p className="font-bold text-lg">{formatCurrency(total, invoice.currency)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Totales y Estado de Pago */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b border-gray-100/60">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Calculator className="h-5 w-5" style={{ color: colors.accent }} />
                Resumen de Totales
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 lg:p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="font-medium text-sm text-gray-900">
                    {formatCurrency(parseFloat(invoice.subtotal), invoice.currency)}
                  </span>
                </div>
                <div className="border-b border-gray-200/40" />
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Impuestos (IVA)</span>
                  <span className="font-medium text-sm text-orange-600">
                    +{formatCurrency(parseFloat(invoice.total_taxes), invoice.currency)}
                  </span>
                </div>
                {parseFloat(invoice.total_perceptions || 0) > 0 && (
                  <>
                    <div className="border-b border-gray-200/40" />
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Percepciones</span>
                      <span className="font-medium text-sm text-orange-600">
                        +{formatCurrency(parseFloat(invoice.total_perceptions), invoice.currency)}
                      </span>
                    </div>
                  </>
                )}
                <div className="border-b border-gray-200/40" />
                <div className="flex justify-between items-center py-2">
                  <span className="font-bold text-gray-900">Total Comprobante</span>
                  <span className="font-bold text-lg text-gray-900">
                    {formatCurrency(parseFloat(invoice.total), invoice.currency)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estado de Pago / Retenciones */}
          {isPaid ? (
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="border-b border-gray-100/60">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <DollarSign className="h-5 w-5" style={{ color: colors.accent }} />
                  {isIssuer ? 'Pago Recibido' : 'Pago Realizado'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 lg:p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Total Comprobante</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(parseFloat(invoice.total), invoice.currency)}
                    </span>
                  </div>
                  {totalWithholdings > 0 && (
                    <>
<div className="border-b border-gray-100" />
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Retenciones</span>
                        <span className="font-medium text-red-600">
                          -{formatCurrency(totalWithholdings, invoice.currency)}
                        </span>
                      </div>
                    </>
                  )}
<div className="border-b border-gray-100" />
                  <div className="flex justify-between items-center py-3 text-lg font-bold">
                    <span className="text-gray-900">{isIssuer ? 'Total Cobrado' : 'Total Pagado'}</span>
                    <span className="text-green-600">
                      {formatCurrency(
                        parseFloat(invoice.total) - totalWithholdings,
                        invoice.currency
                      )}
                    </span>
                  </div>
                  {withholdingsArray.length > 0 ? (
                    <div>
<div className="border-b border-gray-100" />
                      <div className="pt-3 space-y-2">
                        <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                          <Percent className="h-4 w-4" style={{ color: colors.accent }} />
                          Detalle de Retenciones
                        </h4>
                        <div className="space-y-2">
                          {withholdingsArray.map((withholding: any, index: number) => (
                            <div key={index} className="flex justify-between items-center py-2.5 px-3 bg-muted/30 border border-muted rounded-lg shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: colors.accent }}></div>
                                <p className="font-medium text-sm text-gray-800">{withholding.name}</p>
                              </div>
                              <span className="font-bold text-sm text-foreground bg-white px-3 py-1 rounded-md shadow-sm">
                                {formatCurrency(parseFloat(withholding.amount), invoice.currency)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
<div className="border-b border-gray-100" />
                      <div className="pt-3">
                        <p className="text-sm text-muted-foreground text-center py-2">
                          {isIssuer ? 'No se aplicaron retenciones en este cobro' : 'No se aplicaron retenciones en este pago'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Clock className="h-5 w-5" style={{ color: colors.accent }} />
                  {isIssuer ? 'Pendiente de Cobro' : 'Pendiente de Pago'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {invoice.balance_breakdown && (invoice.balance_breakdown.credit_notes?.length > 0 || invoice.balance_breakdown.debit_notes?.length > 0) ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Monto Original</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(invoice.balance_breakdown.original_amount, invoice.currency)}
                      </span>
                    </div>
                    {invoice.balance_breakdown.total_credit_notes > 0 && (
                      <>
<div className="border-b border-gray-100" />
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-gray-600">Notas de Crédito</span>
                          <span className="font-medium text-blue-600">
                            -{formatCurrency(invoice.balance_breakdown.total_credit_notes, invoice.currency)}
                          </span>
                        </div>
                      </>
                    )}
                    {invoice.balance_breakdown.total_debit_notes > 0 && (
                      <>
<div className="border-b border-gray-100" />
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-gray-600">Notas de Débito</span>
                          <span className="font-medium text-red-600">
                            +{formatCurrency(invoice.balance_breakdown.total_debit_notes, invoice.currency)}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="border-b border-gray-200" />
                    <div className="flex justify-between items-center py-3">
                      <span className="font-bold text-gray-900">Saldo Pendiente</span>
                      <span className="font-bold text-2xl text-gray-900">
                        {formatCurrency(invoice.balance_breakdown.balance_pending, invoice.currency)}
                      </span>
                    </div>
<div className="border-t border-gray-100 pt-3">
                      <p className="text-sm text-muted-foreground text-center">
                        {isIssuer ? 'Las retenciones se registrarán al momento del cobro' : 'Las retenciones se registrarán al momento del pago'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-2">
                      {isIssuer ? 'Este comprobante aún no ha sido cobrado' : 'Este comprobante aún no ha sido pagado'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(parseFloat(invoice.pending_amount || invoice.total), invoice.currency)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-4">
                      {isIssuer ? 'Las retenciones se registrarán al momento del cobro' : 'Las retenciones se registrarán al momento del pago'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* NC/ND Aplicadas - Solo para facturas normales */}
        {invoice.balance_breakdown && !['NCA', 'NCB', 'NCC', 'NCM', 'NCE', 'NDA', 'NDB', 'NDC', 'NDM', 'NDE'].includes(invoice.type) && 
         (invoice.balance_breakdown.credit_notes?.length > 0 || invoice.balance_breakdown.debit_notes?.length > 0) && (
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b border-gray-100/60">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Receipt className="h-5 w-5" style={{ color: colors.accent }} />
                Ajustes Aplicados
              </CardTitle>
              <CardDescription>Notas de crédito y débito que modifican el saldo de esta factura</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Cálculo Visual */}
<div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Monto Original</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(invoice.balance_breakdown.original_amount, invoice.currency)}
                      </span>
                    </div>
                    {invoice.balance_breakdown.total_credit_notes > 0 && (
                      <>
<div className="border-b border-gray-100" />
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-gray-600">Notas de Crédito</span>
                          <span className="font-semibold text-red-600">
                            -{formatCurrency(invoice.balance_breakdown.total_credit_notes, invoice.currency)}
                          </span>
                        </div>
                      </>
                    )}
                    {invoice.balance_breakdown.total_debit_notes > 0 && (
                      <>
<div className="border-b border-gray-100" />
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-gray-600">Notas de Débito</span>
                          <span className="font-semibold text-orange-600">
                            +{formatCurrency(invoice.balance_breakdown.total_debit_notes, invoice.currency)}
                          </span>
                        </div>
                      </>
                    )}
<div className="border-b border-gray-100" />
                    <div className="flex justify-between items-center py-2">
                      <span className="font-bold text-gray-900">Saldo Pendiente</span>
                      <span className="font-bold text-lg text-gray-900">
                        {formatCurrency(invoice.balance_breakdown.balance_pending, invoice.currency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lista de NC y ND */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {invoice.balance_breakdown.credit_notes?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Notas de Crédito ({invoice.balance_breakdown.credit_notes.length})</h4>
                      <div className="space-y-2">
                        {invoice.balance_breakdown.credit_notes.map((nc: any) => (
                          <div 
                            key={nc.id} 
className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => router.push(`/company/${companyId}/invoices/${nc.id}`)}
                          >
                            <div>
                              <p className="font-medium text-sm">{nc.number}</p>
                              <p className="text-xs text-muted-foreground">
                                {parseDateLocal(nc.issue_date)?.toLocaleDateString('es-AR') || 'N/A'}
                              </p>
                            </div>
                            <span className="font-semibold text-sm text-red-600">
                              -{formatCurrency(nc.amount, invoice.currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {invoice.balance_breakdown.debit_notes?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Notas de Débito ({invoice.balance_breakdown.debit_notes.length})</h4>
                      <div className="space-y-2">
                        {invoice.balance_breakdown.debit_notes.map((nd: any) => (
                          <div 
                            key={nd.id} 
className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => router.push(`/company/${companyId}/invoices/${nd.id}`)}
                          >
                            <div>
                              <p className="font-medium text-sm">{nd.number}</p>
                              <p className="text-xs text-muted-foreground">
                                {parseDateLocal(nd.issue_date)?.toLocaleDateString('es-AR') || 'N/A'}
                              </p>
                            </div>
                            <span className="font-semibold text-sm text-orange-600">
                              +{formatCurrency(nd.amount, invoice.currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Factura Relacionada - Solo para NC/ND */}
        {invoice.related_invoice_id && ['NCA', 'NCB', 'NCC', 'NCM', 'NCE', 'NDA', 'NDB', 'NDC', 'NDM', 'NDE'].includes(invoice.type) && (
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b border-gray-100/60">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Receipt className="h-5 w-5" style={{ color: colors.accent }} />
                Factura Relacionada
              </CardTitle>
              <CardDescription>
                {['NCA', 'NCB', 'NCC', 'NCM', 'NCE'].includes(invoice.type) 
                  ? 'Esta nota de crédito modifica el saldo de una factura'
                  : 'Esta nota de débito modifica el saldo de una factura'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => router.push(`/company/${companyId}/invoices/${invoice.related_invoice_id}`)}
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {invoice.relatedInvoice?.number ? `Factura ${invoice.relatedInvoice.number}` : 'Factura relacionada'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {['NCA', 'NCB', 'NCC', 'NCM', 'NCE'].includes(invoice.type) ? 'Reduce' : 'Aumenta'} el saldo en {formatCurrency(parseFloat(invoice.total), invoice.currency)}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/company/${companyId}/invoices/${invoice.related_invoice_id}`)
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalle
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Percepciones Detail */}
        {invoice.perceptions && invoice.perceptions.length > 0 && (
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Percent className="h-5 w-5" style={{ color: colors.accent }} />
                Detalle de Percepciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoice.perceptions.map((perception: any, index: number) => (
                  <div key={index}>
                    <div className="flex justify-between items-center py-2">
                      <div>
                        <p className="font-medium text-sm">{perception.name}</p>
                        <p className="text-xs text-muted-foreground">{perception.rate}% sobre {perception.base_type === 'net' ? 'Neto' : perception.base_type === 'total' ? 'Total' : 'IVA'}</p>
                      </div>
                      <span className="font-medium text-foreground">
                        {formatCurrency(parseFloat(perception.amount), invoice.currency)}
                      </span>
                    </div>
{index !== invoice.perceptions.length - 1 && <div className="border-b border-gray-100" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notas */}
        {invoice.notes && (
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <MessageSquare className="h-5 w-5" style={{ color: colors.accent }} />
                Observaciones
              </CardTitle>
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