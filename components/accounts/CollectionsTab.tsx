"use client"

import { Badge } from "@/components/ui/badge"

interface CollectionsTabProps {
  collections: any[]
  formatCurrency: (amount: number) => string
  filters: { from_date: string; to_date: string }
  type: 'receivable' | 'payable'
}

export function CollectionsTab({ collections, formatCurrency, filters, type }: CollectionsTabProps) {
  const entityKey = type === 'receivable' ? 'client' : 'supplier'
  const companyKey = type === 'receivable' ? 'receiverCompany' : 'issuerCompany'
  const entityLabel = type === 'receivable' ? 'Cliente' : 'Proveedor'
  const actionLabel = type === 'receivable' ? 'Cobrado' : 'Pagado'

  const filteredCollections = collections.filter((item) => {
    if (!filters.from_date && !filters.to_date) return true
    const date = new Date(item.collection_date || item.payment_date)
    if (filters.from_date && date < new Date(filters.from_date)) return false
    if (filters.to_date && date > new Date(filters.to_date)) return false
    return true
  })

  const methodLabels: Record<string, string> = {
    transfer: 'Transferencia',
    check: 'Cheque',
    cash: 'Efectivo',
    debit_card: 'Débito',
    credit_card: 'Crédito',
    card: 'Tarjeta',
    other: 'Otro'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Historial de {type === 'receivable' ? 'Cobros' : 'Pagos'}</h3>
        <p className="text-sm text-muted-foreground">
          {filteredCollections.length} {type === 'receivable' ? 'cobro' : 'pago'}{filteredCollections.length !== 1 ? 's' : ''} registrado{filteredCollections.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="space-y-3">
        {filteredCollections.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No hay {type === 'receivable' ? 'cobros' : 'pagos'} registrados</p>
            <p className="text-xs mt-2">Los {type === 'receivable' ? 'cobros' : 'pagos'} aparecerán aquí una vez que registres {type === 'receivable' ? 'cobros' : 'pagos'} de facturas</p>
          </div>
        ) : (
          filteredCollections.map((item) => {
            const entity = item.invoice?.[entityKey] || item.invoice?.[companyKey]
            const entityName = entity?.business_name || 
                             entity?.name ||
                             (entity?.first_name && entity?.last_name ? `${entity.first_name} ${entity.last_name}` : null) ||
                             entityLabel
            
            const totalWithholdings = Array.isArray(item.retentions) 
              ? item.retentions.reduce((sum: number, r: any) => sum + (parseFloat(r.amount) || 0), 0)
              : (parseFloat(item.withholding_iva || 0) + parseFloat(item.withholding_ganancias || 0) + parseFloat(item.withholding_iibb || 0) + parseFloat(item.withholding_suss || 0) + parseFloat(item.withholding_other || 0))
            
            const netAmount = (parseFloat(item.amount) || 0) - totalWithholdings
            
            return (
              <div key={item.id} className="p-4 border border-gray-200 rounded-xl bg-green-50/30 hover:bg-green-50/50 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-medium text-lg">{entityName}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Factura: {item.invoice?.type || 'FC'} {String(item.invoice?.sales_point || 0).padStart(4, '0')}-{String(item.invoice?.voucher_number || item.voucher_number || 0).padStart(8, '0')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-green-600">{formatCurrency(parseFloat(item.amount) || 0)}</div>
                    <Badge className="bg-green-600 text-white mt-1">{actionLabel}</Badge>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground pt-2 border-t border-gray-200">
                  <div>
                    <span className="font-medium">Fecha:</span> {new Date(item.collection_date || item.payment_date).toLocaleDateString('es-AR')}
                  </div>
                  <div>
                    <span className="font-medium">Método:</span> {methodLabels[item.collection_method || item.payment_method] || item.collection_method || item.payment_method}
                  </div>
                  {item.reference_number && (
                    <div>
                      <span className="font-medium">Ref:</span> {item.reference_number}
                    </div>
                  )}
                </div>
                {totalWithholdings > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Retenciones aplicadas:</span>
                      <span className="font-medium text-orange-600">{formatCurrency(totalWithholdings)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold">
                      <span>Neto {type === 'receivable' ? 'cobrado' : 'pagado'}:</span>
                      <span className="text-green-600">{formatCurrency(netAmount)}</span>
                    </div>
                  </div>
                )}
                {item.notes && (
                  <div className="text-sm text-muted-foreground mt-2 pt-2 border-t border-gray-200">
                    <span className="font-medium">Notas:</span> {item.notes}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
