"use client"

import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

interface InvoiceListProps {
  invoices: any[]
  selectedInvoices: string[]
  onSelectionChange: (ids: string[]) => void
  onAction: (id: string) => void
  onView: (id: string) => void
  formatCurrency: (amount: number) => string
  actionLabel: string
  type: 'receivable' | 'payable'
  loading?: boolean
}

export function InvoiceList({
  invoices,
  selectedInvoices,
  onSelectionChange,
  onAction,
  onView,
  formatCurrency,
  actionLabel,
  type,
  loading = false,
}: InvoiceListProps) {
  const getEntityName = (invoice: any) => {
    if (type === 'receivable') {
      return invoice.receiver_name ||
             invoice.client?.business_name || 
             (invoice.client?.first_name && invoice.client?.last_name 
               ? `${invoice.client.first_name} ${invoice.client.last_name}` 
               : null) ||
             invoice.receiverCompany?.name ||
             invoice.receiverCompany?.business_name || 
             'Cliente'
    }
    return invoice.supplier?.business_name || 
           (invoice.supplier?.first_name && invoice.supplier?.last_name 
             ? `${invoice.supplier.first_name} ${invoice.supplier.last_name}` 
             : null) ||
           invoice.issuerCompany?.name ||
           invoice.issuerCompany?.business_name || 
           'Proveedor'
  }

  const getStatusBadges = (invoice: any) => {
    const badges = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(invoice.due_date)
    dueDate.setHours(0, 0, 0, 0)
    const isOverdue = dueDate < today && invoice.payment_status !== 'paid'
    
    // Solo mostrar badge de Vencida
    if (isOverdue) {
      badges.push(<Badge key="overdue" className="bg-red-100 text-red-700 font-medium">Vencida</Badge>)
    }
    
    return badges.length > 0 ? <div className="flex gap-1 flex-wrap">{badges}</div> : null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Facturas Pendientes</h3>
          {selectedInvoices.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {selectedInvoices.length} factura{selectedInvoices.length !== 1 ? 's' : ''} seleccionada{selectedInvoices.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {invoices.length > 0 && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              if (selectedInvoices.length === invoices.length) {
                onSelectionChange([])
              } else {
                onSelectionChange(invoices.map(inv => inv.id))
              }
            }}
          >
            {selectedInvoices.length === invoices.length ? 'Deseleccionar Todas' : 'Seleccionar Todas'}
          </Button>
        )}
      </div>
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl animate-pulse">
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-5 w-5 bg-gray-200 rounded"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="flex gap-2">
                    <div className="h-9 w-9 bg-gray-200 rounded"></div>
                    <div className="h-9 w-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No hay facturas pendientes</p>
          </div>
        ) : (
          invoices.map((invoice) => (
            <div 
              key={invoice.id} 
              className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-blue-50/50 hover:border-blue-200 cursor-pointer transition-all" 
                onClick={() => {
                  if (selectedInvoices.includes(invoice.id)) {
                    onSelectionChange(selectedInvoices.filter(id => id !== invoice.id))
                  } else {
                    onSelectionChange([...selectedInvoices, invoice.id])
                  }
                }}
              >
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedInvoices.includes(invoice.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onSelectionChange([...selectedInvoices, invoice.id])
                      } else {
                        onSelectionChange(selectedInvoices.filter(id => id !== invoice.id))
                      }
                    }}
                  />
                  <div>
                    <div className="font-medium">{getEntityName(invoice)}</div>
                    <div className="text-sm text-muted-foreground">
                      {invoice.type || 'FC'} {String(invoice.sales_point || 0).padStart(4, '0')}-{String(invoice.voucher_number || 0).padStart(8, '0')}
                    </div>
                    {type === 'payable' && (
                      <div className="text-xs mt-1">
                        {invoice.has_bank_data ? (
                          <span className="text-green-600">✓ Datos bancarios</span>
                        ) : (
                          <span className="text-orange-600">⚠ Sin datos bancarios</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getStatusBadges(invoice)}
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(parseFloat(invoice.pending_amount || invoice.total || 0))}</div>
                    <div className="text-sm text-muted-foreground">
                      Vence: {new Date(invoice.due_date).toLocaleDateString('es-AR')}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={(e) => {
                    e.stopPropagation()
                    onView(invoice.id)
                  }}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
          ))
        )}
      </div>
    </div>
  )
}
