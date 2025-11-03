"use client"

import { InvoiceCard } from "@/components/accounts/InvoiceCard"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface OverdueTabProps {
  invoices: any[]
  formatCurrency: (amount: number) => string
  onAction: (id: string) => void
  type: 'receivable' | 'payable'
  selectedInvoices?: string[]
  onSelectionChange?: (ids: string[]) => void
}

export function OverdueTab({ invoices, formatCurrency, onAction, type, selectedInvoices = [], onSelectionChange }: OverdueTabProps) {
  const overdueInvoices = invoices.filter(inv => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(inv.due_date)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate < today
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-700">Facturas Vencidas</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {overdueInvoices.length} factura{overdueInvoices.length !== 1 ? 's' : ''} vencida{overdueInvoices.length !== 1 ? 's' : ''}
          </p>
        </div>
        {onSelectionChange && overdueInvoices.length > 0 && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              if (selectedInvoices.length === overdueInvoices.length) {
                onSelectionChange([])
              } else {
                onSelectionChange(overdueInvoices.map(inv => inv.id))
              }
            }}
          >
            {selectedInvoices.length === overdueInvoices.length ? 'Deseleccionar Todas' : 'Seleccionar Todas'}
          </Button>
        )}
      </div>
      <div className="space-y-2">
        {overdueInvoices.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No hay facturas vencidas</p>
            <p className="text-xs mt-2">¡Excelente! Todas tus facturas están al día</p>
          </div>
        ) : (
          overdueInvoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              formatCurrency={formatCurrency}
              variant="overdue"
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
