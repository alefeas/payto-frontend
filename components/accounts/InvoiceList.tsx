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
    
    if (isOverdue) {
      badges.push(<Badge key="overdue" className="bg-red-500 text-white font-semibold">Vencida</Badge>)
    }
    
    if (type === 'payable') {
      if (invoice.payment_status === 'paid') {
        badges.push(<Badge key="payment" className="bg-green-100 text-green-800">Pagada</Badge>)
      } else if (invoice.payment_status === 'partial') {
        badges.push(<Badge key="payment" className="bg-yellow-100 text-yellow-800">Pago Parcial</Badge>)
      } else {
        badges.push(<Badge key="payment" className="bg-gray-100 text-gray-800">Pendiente Pago</Badge>)
      }
    } else {
      badges.push(<Badge key="status" className="bg-gray-100 text-gray-800">Pendiente Cobro</Badge>)
    }
    
    return <div className="flex gap-1 flex-wrap">{badges}</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Facturas Pendientes</CardTitle>
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
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Cargando facturas...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay facturas pendientes</p>
            </div>
          ) : (
            invoices.map((invoice) => (
              <div 
                key={invoice.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer" 
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
                    {type === 'payable' && invoice.supplier && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {invoice.has_bank_data ? (
                          <span className="text-green-600">✓ Datos bancarios</span>
                        ) : (
                          <span className="text-orange-600">⚠ Sin datos bancarios</span>
                        )}
                        {invoice.supplier.bank_cbu && ` • CBU: ${invoice.supplier.bank_cbu.slice(0, 6)}...`}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(parseFloat(invoice.pending_amount || invoice.total || 0))}</div>
                    <div className="text-sm text-muted-foreground">
                      Vence: {new Date(invoice.due_date).toLocaleDateString('es-AR')}
                    </div>
                  </div>
                  {getStatusBadges(invoice)}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={(e) => {
                      e.stopPropagation()
                      onView(invoice.id)
                    }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={(e) => {
                      e.stopPropagation()
                      onAction(invoice.id)
                    }}>
                      {actionLabel}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
