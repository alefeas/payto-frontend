  "use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, Download, FileText, MoreHorizontal, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { parseDateLocal } from "@/lib/utils"
import { colors } from "@/styles"
import { getInvoiceStatusBadge, getOverdueBadge } from "@/lib/invoice-status"

const formatCurrency = (amount: number, currency: string) => {
  const formatted = amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const formats: Record<string, string> = {
    'ARS': `ARS ${formatted}`,
    'USD': `USD ${formatted}`,
    'EUR': `EUR €${formatted}`
  }
  return formats[currency] || `ARS ${formatted}`
}

interface InvoiceCardProps {
  invoice: any
  companyId: string
  isSelected: boolean
  onSelect: (invoiceId: string) => void
  onDownloadPDF: (invoiceId: string) => void
  onDownloadTXT: (invoiceId: string) => void
}

export function InvoiceCard({ 
  invoice, 
  companyId, 
  isSelected, 
  onSelect, 
  onDownloadPDF, 
  onDownloadTXT 
}: InvoiceCardProps) {
  const router = useRouter()
  const [downloadingPDF, setDownloadingPDF] = useState(false)
  const [downloadingTXT, setDownloadingTXT] = useState(false)

  const clientName = invoice.receiver_name || invoice.client?.business_name || 
                    invoice.receiverCompany?.name ||
                    (invoice.client?.first_name && invoice.client?.last_name 
                      ? `${invoice.client.first_name} ${invoice.client.last_name}` 
                      : 'Sin cliente')

  // Función para abreviar texto en pantallas muy pequeñas
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  // Función para obtener badges abreviados en móvil (muestra múltiples badges importantes)
  const getAbbreviatedBadges = (invoice: any) => {
    const badges = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(invoice.due_date)
    dueDate.setHours(0, 0, 0, 0)
    
    const isIssuer = String(invoice.issuer_company_id) === String(companyId)
    const isReceiver = String(invoice.receiver_company_id) === String(companyId)
    
    // Usar display_status que viene calculado del backend
    const status = invoice.display_status || invoice.status
    const isRejected = status === 'rejected'
    
    const isPaidOrCollected = status === 'collected' || status === 'paid'
    
    const isOverdue = dueDate < today && !isPaidOrCollected && status !== 'cancelled' && !isRejected
    
    // Badge de vencimiento (prioridad alta)
    if (isOverdue) {
      badges.push(
        <Badge key="overdue" className="bg-red-50 text-red-700 border-red-200 text-xs">
          Vencida
        </Badge>
      )
    }
    
    // Badge de estado principal
    if (status === 'cancelled' || invoice.payment_status === 'cancelled') {
      badges.push(
        <Badge key="status" className="bg-gray-50 text-gray-600 border-gray-200 text-xs">
          Anulada
        </Badge>
      )
    } else if (isPaidOrCollected) {
      const label = isReceiver ? 'Pagada' : 'Cobrada'
      badges.push(
        <Badge key="status" className="bg-green-50 text-green-700 border-green-200 text-xs">
          {label}
        </Badge>
      )
    } else if (invoice.payment_status === 'partial') {
      badges.push(
        <Badge key="status" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
          Parcial
        </Badge>
      )
    } else if (status === 'partially_cancelled') {
      badges.push(
        <Badge key="status" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
          Parc. Anulada
        </Badge>
      )
    } else if (status === 'pending_approval') {
      badges.push(
        <Badge key="status" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
          Pendiente
        </Badge>
      )
    } else if (status === 'rejected') {
      badges.push(
        <Badge key="status" className="bg-red-50 text-red-700 border-red-200 text-xs">
          Rechazada
        </Badge>
      )
    } else if (status === 'approved') {
      badges.push(
        <Badge key="status" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
          Aprobada
        </Badge>
      )
    } else if (status === 'issued') {
      badges.push(
        <Badge key="status" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">
          Emitida
        </Badge>
      )
    }
    
    return badges
  }

  const getInvoiceStatusBadges = (invoice: any) => {
    const badges = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(invoice.due_date)
    dueDate.setHours(0, 0, 0, 0)
    
    const isIssuer = String(invoice.issuer_company_id) === String(companyId)
    const isReceiver = String(invoice.receiver_company_id) === String(companyId)
    
    // Usar display_status que viene calculado del backend
    const status = invoice.display_status || invoice.status
    const isRejected = status === 'rejected'
    
    const isPaidOrCollected = status === 'collected' || status === 'paid'
    
    const isOverdue = dueDate < today && !isPaidOrCollected && status !== 'cancelled' && !isRejected
    
    // Badge de vencimiento
    if (isOverdue) {
      badges.push(
        <Badge 
          key="overdue" 
          className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
        >
          Vencida
        </Badge>
      )
    }
    
    // Badge de estado principal - usando colores suaves originales
    if (status === 'cancelled' || invoice.payment_status === 'cancelled') {
      badges.push(
        <Badge 
          key="status" 
          className="bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
        >
          Anulada
        </Badge>
      )
    } else if (isPaidOrCollected) {
      const label = isReceiver ? 'Pagada' : 'Cobrada'
      badges.push(
        <Badge 
          key="status" 
          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
        >
          {label}
        </Badge>
      )
    } else if (invoice.payment_status === 'partial') {
      const label = isReceiver ? 'Pago Parcial' : 'Cobro Parcial'
      badges.push(
        <Badge 
          key="status" 
          className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
        >
          {label}
        </Badge>
      )
    } else if (status === 'partially_cancelled') {
      badges.push(
        <Badge 
          key="status" 
          className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
        >
          Parc. Anulada
        </Badge>
      )
    } else if (status === 'pending_approval') {
      badges.push(
        <Badge 
          key="status" 
          className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
        >
          Pend. Aprobación
        </Badge>
      )
    } else if (status === 'rejected') {
      badges.push(
        <Badge 
          key="status" 
          className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
        >
          Rechazada
        </Badge>
      )
    } else if (status === 'approved') {
      badges.push(
        <Badge 
          key="status" 
          className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
        >
          Aprobada
        </Badge>
      )
    } else if (status === 'issued') {
      badges.push(
        <Badge 
          key="status" 
          className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
        >
          Emitida
        </Badge>
      )
    }
    
    return badges
  }

  const getTypeBadge = (type: string) => {
    return (
      <Badge className="bg-gray-100 text-gray-700 border-gray-200">
        Tipo {type}
      </Badge>
    )
  }

  const getTypeBadgeResponsive = (type: string) => {
    return (
      <Badge className="bg-gray-100 text-gray-700 border-gray-200">
        <span className="hidden sm:inline">Tipo {type}</span>
        <span className="sm:hidden">{type}</span>
      </Badge>
    )
  }

  // Función para formatear fecha responsive (año abreviado en móvil)
  const formatDateResponsive = (date: Date | null) => {
    if (!date) return 'N/A'
    
    const fullDate = date.toLocaleDateString('es-AR')
    const shortDate = date.toLocaleDateString('es-AR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: '2-digit' 
    })
    
    return (
      <>
        <span className="hidden sm:inline">{fullDate}</span>
        <span className="sm:hidden">{shortDate}</span>
      </>
    )
  }

  // Función para formatear monto responsive (abreviado si es muy grande)
  const formatCurrencyResponsive = (amount: number, currency: string) => {
    // Asegurar que amount sea un número válido
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numAmount)) return <div className="font-semibold text-base text-gray-900">N/A</div>
    
    const fullAmount = formatCurrency(numAmount, currency)
    
    // Si el monto es muy grande (más de 6 dígitos), abreviarlo en móvil
    if (numAmount >= 1000000) {
      const millions = (numAmount / 1000000).toFixed(1)
      const shortAmount = `${currency === 'USD' ? 'USD' : currency === 'EUR' ? 'EUR' : 'ARS'} ${millions}M`
      
      return (
        <>
          <div className="hidden sm:block font-semibold text-base text-gray-900">{fullAmount}</div>
          <div className="sm:hidden font-semibold text-base text-gray-900" title={fullAmount}>{shortAmount}</div>
        </>
      )
    } else if (numAmount >= 1000) {
      const thousands = (numAmount / 1000).toFixed(0)
      const shortAmount = `${currency === 'USD' ? 'USD' : currency === 'EUR' ? 'EUR' : 'ARS'} ${thousands}K`
      
      return (
        <>
          <div className="hidden sm:block font-semibold text-base text-gray-900">{fullAmount}</div>
          <div className="sm:hidden font-semibold text-base text-gray-900" title={fullAmount}>{shortAmount}</div>
        </>
      )
    }
    
    // Si no es muy grande, mostrar completo en ambas resoluciones
    return <div className="font-semibold text-base text-gray-900">{fullAmount}</div>
  }

  const getSourceBadge = (invoice: any) => {
    if (invoice.is_manual_load) {
      return (
        <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs">
          Carga Manual
        </Badge>
      )
    } else if (invoice.synced_from_afip) {
      return (
        <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs">
          Sinc. AFIP
        </Badge>
      )
    } else if (invoice.afip_cae && !invoice.is_manual_load && !invoice.synced_from_afip) {
      return (
        <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs">
          Subidas a AFIP
        </Badge>
      )
    }
    return null
  }

  return (
    <Card 
      className="border-gray-200 hover:border-gray-300 cursor-pointer transition-colors relative"
      onClick={() => onSelect(invoice.id)}
    >
      <CardContent className="px-4 py-2.5 pl-11 sm:pl-12 relative">
        {/* Checkbox posicionado absolutamente */}
        <div className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(invoice.id)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          
          {/* Información principal */}
          <div className="flex-1 min-w-0">
            {/* Layout para pantallas grandes (lg+) */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-4 items-center">
              {/* Número y Tipo */}
              <div className="flex items-center gap-2">
                <div className="font-semibold text-sm text-gray-900">
                  {invoice.number}
                </div>
                {getTypeBadge(invoice.type)}
              </div>
              
              {/* Cliente */}
              <div className="min-w-0">
                <div className="text-xs text-gray-500 mb-0.5">Cliente</div>
                <div className="font-medium text-sm text-gray-800 truncate" title={clientName}>
                  {clientName}
                </div>
              </div>
              
              {/* Fecha y Total */}
              <div className="text-sm">
                <div className="text-gray-600 mb-0.5">{formatDateResponsive(parseDateLocal(invoice.issue_date))}</div>
                {formatCurrencyResponsive(parseFloat(invoice.total), invoice.currency)}
              </div>
              
              {/* Estados */}
              <div className="flex gap-1 flex-wrap items-center justify-end">
                {getInvoiceStatusBadges(invoice)}
                {getSourceBadge(invoice)}
              </div>
            </div>

            {/* Layout para pantallas medianas y pequeñas (md y menores) */}
            <div className="lg:hidden">
              {/* Primera fila: Número y Tipo */}
              <div className="flex items-center gap-2 mb-2">
                <div className="font-semibold text-sm text-gray-900" title={invoice.number}>
                  <span className="hidden sm:inline">{invoice.number}</span>
                  <span className="sm:hidden">
                    {invoice.number.length > 12 ? truncateText(invoice.number, 12) : invoice.number}
                  </span>
                </div>
                {getTypeBadgeResponsive(invoice.type)}
              </div>
              
              {/* Segunda fila: Cliente */}
              <div className="min-w-0 mb-2">
                <div className="text-xs text-gray-500 mb-0.5">Cliente</div>
                <div className="font-medium text-sm text-gray-800 truncate" title={clientName}>
                  <span className="hidden sm:inline">{clientName}</span>
                  <span className="sm:hidden">
                    {clientName.length > 15 ? truncateText(clientName, 15) : clientName}
                  </span>
                </div>
              </div>
              
              {/* Tercera fila: Estados */}
              <div className="flex gap-1 flex-wrap items-center mb-2">
                {getAbbreviatedBadges(invoice)}
                {getSourceBadge(invoice) && (
                  <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs">
                    {invoice.is_manual_load ? 'Manual' : invoice.synced_from_afip ? 'AFIP' : 'Subida'}
                  </Badge>
                )}
              </div>
              
              {/* Cuarta fila: Fecha y Total (abajo) */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100">
                <div className="text-xs text-gray-600">
                  {formatDateResponsive(parseDateLocal(invoice.issue_date))}
                </div>
                {formatCurrencyResponsive(parseFloat(invoice.total), invoice.currency)}
              </div>
            </div>
          </div>

          {/* Botones de acción para pantallas muy grandes */}
          <div className="hidden lg:flex gap-1 flex-shrink-0">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/company/${companyId}/invoices/${invoice.id}`)
              }}
              title="Ver detalle"
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={async (e) => {
                e.stopPropagation()
                setDownloadingPDF(true)
                try {
                  await onDownloadPDF(invoice.id)
                } finally {
                  setDownloadingPDF(false)
                }
              }}
              title="Descargar PDF"
              className="h-8 w-8 p-0"
              disabled={downloadingPDF}
            >
              {downloadingPDF ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={async (e) => {
                e.stopPropagation()
                setDownloadingTXT(true)
                try {
                  await onDownloadTXT(invoice.id)
                } finally {
                  setDownloadingTXT(false)
                }
              }}
              title="Descargar TXT AFIP"
              className="h-8 w-8 p-0"
              disabled={downloadingTXT}
            >
              {downloadingTXT ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Menú desplegable para pantallas pequeñas y medianas - posicionado absolutamente */}
        <div className="lg:hidden absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => e.stopPropagation()}
                className="h-8 w-8 p-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/company/${companyId}/invoices/${invoice.id}`)
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver detalle
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async (e) => {
                  e.stopPropagation()
                  setDownloadingPDF(true)
                  try {
                    await onDownloadPDF(invoice.id)
                  } finally {
                    setDownloadingPDF(false)
                  }
                }}
                disabled={downloadingPDF}
              >
                {downloadingPDF ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Descargar PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async (e) => {
                  e.stopPropagation()
                  setDownloadingTXT(true)
                  try {
                    await onDownloadTXT(invoice.id)
                  } finally {
                    setDownloadingTXT(false)
                  }
                }}
                disabled={downloadingTXT}
              >
                {downloadingTXT ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                Descargar TXT
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}