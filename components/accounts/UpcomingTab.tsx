"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface UpcomingTabProps {
  invoices: any[]
  formatCurrency: (amount: number) => string
  onAction: (id: string) => void
  type: 'receivable' | 'payable'
}

export function UpcomingTab({ invoices, formatCurrency, onAction, type }: UpcomingTabProps) {
  const entityKey = type === 'receivable' ? 'client' : 'supplier'
  const companyKey = type === 'receivable' ? 'receiverCompany' : 'issuerCompany'
  const entityLabel = type === 'receivable' ? 'Cliente' : 'Proveedor'

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
      <h3 className="text-lg font-semibold">Próximos Vencimientos (30 días)</h3>
      <div className="space-y-3">
        {upcomingInvoices.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No hay facturas próximas a vencer</p>
          </div>
        ) : (
          upcomingInvoices.map((invoice) => {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const dueDate = new Date(invoice.due_date)
            dueDate.setHours(0, 0, 0, 0)
            const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            const entity = invoice[entityKey] || invoice[companyKey]
            const entityName = (type === 'receivable' ? invoice.receiver_name : null) ||
                             entity?.business_name || 
                             entity?.name ||
                             (entity?.first_name && entity?.last_name ? `${entity.first_name} ${entity.last_name}` : null) ||
                             entityLabel
            
            return (
              <div key={invoice.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-blue-50/50 hover:border-blue-200 transition-all">
                <div>
                  <div className="font-medium">{entityName}</div>
                  <div className="text-sm text-muted-foreground">
                    {invoice.type} {String(invoice.sales_point || 0).padStart(4, '0')}-{String(invoice.voucher_number || 0).padStart(8, '0')}
                  </div>
                  <Badge variant="outline" className="mt-2 text-xs">Vence en {daysUntilDue} día{daysUntilDue !== 1 ? 's' : ''}</Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-lg">{formatCurrency(invoice.pending_amount || invoice.total)}</div>
                  </div>
                  <Button size="sm" onClick={() => onAction(invoice.id)}>
                    {type === 'receivable' ? 'Cobrar' : 'Pagar'}
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
