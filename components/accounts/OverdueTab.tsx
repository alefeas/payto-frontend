"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface OverdueTabProps {
  invoices: any[]
  formatCurrency: (amount: number) => string
  onAction: (id: string) => void
  type: 'receivable' | 'payable'
}

export function OverdueTab({ invoices, formatCurrency, onAction, type }: OverdueTabProps) {
  const entityKey = type === 'receivable' ? 'client' : 'supplier'
  const companyKey = type === 'receivable' ? 'receiverCompany' : 'issuerCompany'
  const entityLabel = type === 'receivable' ? 'Cliente' : 'Proveedor'

  const overdueInvoices = invoices.filter(inv => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(inv.due_date)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate < today
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-red-600">Facturas Vencidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {overdueInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay facturas vencidas</p>
            </div>
          ) : (
            overdueInvoices.map((invoice) => {
              const entity = invoice[entityKey] || invoice[companyKey]
              const entityName = entity?.business_name || 
                               (entity?.first_name && entity?.last_name ? `${entity.first_name} ${entity.last_name}` : null) ||
                               entityLabel
              
              return (
                <div key={invoice.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <div className="font-medium">{entityName}</div>
                    <div className="text-sm text-muted-foreground">
                      {invoice.type} {String(invoice.sales_point || 0).padStart(4, '0')}-{String(invoice.voucher_number || 0).padStart(8, '0')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-red-600">{formatCurrency(invoice.pending_amount || invoice.total)}</div>
                    <Button size="sm" variant="destructive" onClick={() => onAction(invoice.id)}>
                      {type === 'receivable' ? 'Cobrar Urgente' : 'Pagar Urgente'}
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
