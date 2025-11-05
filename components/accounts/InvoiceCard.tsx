"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock } from "lucide-react"

interface InvoiceCardProps {
  invoice: any
  formatCurrency: (amount: number, currency?: string) => string
  onAction?: (id: string) => void
  actionLabel?: string
  variant?: 'default' | 'upcoming' | 'overdue'
  type: 'receivable' | 'payable'
  selected?: boolean
  onSelect?: (id: string, selected: boolean) => void
}

export function InvoiceCard({ 
  invoice, 
  formatCurrency, 
  onAction, 
  actionLabel,
  variant = 'default',
  type,
  selected = false,
  onSelect
}: InvoiceCardProps) {
  const entityKey = type === 'receivable' ? 'client' : 'supplier'
  const companyKey = type === 'receivable' ? 'receiverCompany' : 'issuerCompany'
  const entity = invoice[entityKey] || invoice[companyKey]
  const entityName = (type === 'receivable' ? invoice.receiver_name : null) ||
                   entity?.business_name || 
                   entity?.name ||
                   (entity?.first_name && entity?.last_name ? `${entity.first_name} ${entity.last_name}` : null) ||
                   (type === 'receivable' ? 'Cliente' : 'Proveedor')

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(invoice.due_date)
  dueDate.setHours(0, 0, 0, 0)
  const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const isOverdue = daysDiff < 0
  const daysText = isOverdue 
    ? `Vencida hace ${Math.abs(daysDiff)} día${Math.abs(daysDiff) !== 1 ? 's' : ''}`
    : `Vence en ${daysDiff} día${daysDiff !== 1 ? 's' : ''}`

  const variantStyles = {
    default: 'border-gray-200 hover:bg-gray-50/50',
    upcoming: 'border-l-4 border-l-orange-400 border-gray-200 hover:bg-orange-50/20',
    overdue: 'border-l-4 border-l-red-400 border-gray-200 hover:bg-red-50/20'
  }

  const amountColor = {
    default: 'text-gray-900',
    upcoming: 'text-orange-600',
    overdue: 'text-red-600'
  }

  const showBadge = variant === 'overdue'

  return (
    <div 
      className={`flex items-center gap-3 p-4 border rounded-xl transition-colors cursor-pointer ${variantStyles[variant]}`}
      onClick={() => onSelect && onSelect(invoice.id, !selected)}
    >
      {onSelect && (
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelect(invoice.id, checked as boolean)}
          onClick={(e) => e.stopPropagation()}
        />
      )}
      <div className="flex-1">
        <div className="font-medium mb-1">{entityName}</div>
        <div className="text-sm text-muted-foreground mb-2">
          {invoice.type} {String(invoice.sales_point || 0).padStart(4, '0')}-{String(invoice.voucher_number || 0).padStart(8, '0')}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{daysText}</span>
          <Calendar className="h-3 w-3 ml-2" />
          <span>{new Date(invoice.due_date).toLocaleDateString('es-AR')}</span>
          {showBadge && (
            <Badge variant="destructive" className="ml-2">Vencida</Badge>
          )}
        </div>
      </div>
      <div className={`font-bold text-lg ${amountColor[variant]}`}>
        {formatCurrency(invoice.pending_amount || invoice.total, invoice.currency)}
      </div>
    </div>
  )
}
