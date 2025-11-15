import { Badge } from "@/components/ui/badge"

/**
 * Get status badge for an invoice
 * For NC/ND associated to an invoice, shows the status of the related invoice
 * For NC/ND NOT associated, shows their own status
 * Only shows allowed statuses
 */
export function getInvoiceStatusBadge(invoice: any, isReceiver: boolean = false) {
  // For NC/ND associated to an invoice, use related invoice status
  let status = invoice.display_status || invoice.status
  
  const isNCND = ['NCA', 'NCB', 'NCC', 'NCM', 'NCE', 'NDA', 'NDB', 'NDC', 'NDM', 'NDE'].includes(invoice.type)
  const hasRelatedInvoice = invoice.related_invoice_id && invoice.relatedInvoice
  
  if (isNCND && hasRelatedInvoice) {
    // NC/ND asociada: mostrar estado de la factura relacionada
    status = invoice.relatedInvoice.display_status || invoice.relatedInvoice.status
  }
  // Si no tiene factura relacionada, usa su propio estado (ya asignado arriba)

  // Check if cancelled first
  if (status === 'cancelled' || invoice.payment_status === 'cancelled') {
    return (
      <Badge className="bg-gray-50 text-gray-600 border-gray-200 text-xs">
        Anulada
      </Badge>
    )
  }

  // Check payment status for paid/collected
  if (invoice.payment_status === 'paid' || invoice.payment_status === 'collected') {
    const label = isReceiver ? 'Pagada' : 'Cobrada'
    return (
      <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
        {label}
      </Badge>
    )
  }

  // Map allowed statuses
  const statusMap: Record<string, { label: string; className: string }> = {
    'pending_approval': {
      label: 'Pendiente Aprobación',
      className: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    'approved': {
      label: 'Aprobada',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    'rejected': {
      label: 'Rechazada',
      className: 'bg-red-50 text-red-700 border-red-200'
    },
    'issued': {
      label: 'Emitida',
      className: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
  }

  const statusConfig = statusMap[status]
  if (statusConfig) {
    return (
      <Badge className={`${statusConfig.className} text-xs`}>
        {statusConfig.label}
      </Badge>
    )
  }

  // Default fallback - don't show badge for unknown statuses
  return null
}

/**
 * Get overdue badge if invoice is overdue
 */
export function getOverdueBadge(invoice: any) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const dueDate = invoice.due_date ? new Date(invoice.due_date) : null
  if (!dueDate) return null
  
  dueDate.setHours(0, 0, 0, 0)
  
  const status = invoice.display_status || invoice.status
  const isPaid = invoice.payment_status === 'paid' || invoice.payment_status === 'collected'
  const isCancelled = status === 'cancelled' || invoice.payment_status === 'cancelled'
  
  if (!isPaid && !isCancelled && dueDate < today) {
    return (
      <Badge className="bg-red-50 text-red-700 border-red-200 text-xs">
        Vencida
      </Badge>
    )
  }
  
  return null
}
