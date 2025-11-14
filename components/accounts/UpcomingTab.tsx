"use client"

import { InvoiceCard } from "@/components/accounts/InvoiceCard"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

interface UpcomingTabProps {
  invoices: any[]
  formatCurrency: (amount: number) => string
  onAction: (id: string) => void
  type: 'receivable' | 'payable'
  selectedInvoices?: string[]
  onSelectionChange?: (ids: string[]) => void
  canPerformAction?: boolean
}

export function UpcomingTab({ invoices, formatCurrency, onAction, type, selectedInvoices = [], onSelectionChange, canPerformAction = true }: UpcomingTabProps) {
  const upcomingInvoices = invoices.filter(inv => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(inv.due_date)
    dueDate.setHours(0, 0, 0, 0)
    const thirtyDaysFromNow = new Date(today)
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return dueDate >= today && dueDate <= thirtyDaysFromNow
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-orange-500">Próximos Vencimientos (30 días)</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {upcomingInvoices.length} factura{upcomingInvoices.length !== 1 ? 's' : ''} próxima{upcomingInvoices.length !== 1 ? 's' : ''} a vencer
          </p>
        </div>
        {onSelectionChange && upcomingInvoices.length > 0 && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              if (selectedInvoices.length === upcomingInvoices.length) {
                onSelectionChange([])
              } else {
                onSelectionChange(upcomingInvoices.map(inv => inv.id))
              }
            }}
          >
            {selectedInvoices.length === upcomingInvoices.length ? 'Deseleccionar Todas' : 'Seleccionar Todas'}
          </Button>
        )}
      </div>
      <div className="space-y-2">
        {upcomingInvoices.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No hay facturas próximas a vencer</p>
            <p className="text-xs mt-2">Las facturas que venzan en los próximos 30 días aparecerán aquí</p>
          </div>
        ) : (
          upcomingInvoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              formatCurrency={formatCurrency}
              variant="upcoming"
              type={type}
              selected={selectedInvoices.includes(invoice.id)}
              onSelect={(id, checked) => {
                if (onSelectionChange) {
                  if (checked) {
                    onSelectionChange([...selectedInvoices, id])
                  } else {
                    onSelectionChange(selectedInvoices.filter(i => i !== id))
                  }
                }
              }}
            />
          ))
        )}
      </div>
    </div>
  )
}
