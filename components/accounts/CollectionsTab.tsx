"use client"

import { PaymentCollectionCard } from "@/components/accounts/PaymentCollectionCard"
import { CheckCircle2 } from "lucide-react"

interface CollectionsTabProps {
  collections: any[]
  formatCurrency: (amount: number) => string
  filters: { from_date: string; to_date: string; search?: string }
  type: 'receivable' | 'payable'
}

export function CollectionsTab({ collections, formatCurrency, filters, type }: CollectionsTabProps) {
  const filteredCollections = collections.filter((item) => {
    if (filters.from_date || filters.to_date) {
      const date = new Date(item.collection_date || item.payment_date)
      if (filters.from_date && date < new Date(filters.from_date)) return false
      if (filters.to_date && date > new Date(filters.to_date)) return false
    }
    if (filters.search) {
      const entityKey = type === 'receivable' ? 'client' : 'supplier'
      const companyKey = type === 'receivable' ? 'receiverCompany' : 'issuerCompany'
      const entity = item.invoice?.[entityKey] || item.invoice?.[companyKey]
      const entityName = entity?.business_name || entity?.name || (entity?.first_name && entity?.last_name ? `${entity.first_name} ${entity.last_name}` : '') || ''
      const entityCuit = (entity?.document_number || entity?.national_id || '').toString().replace(/\D/g, '')
      const invoiceNumber = `${item.invoice?.type || 'FC'} ${String(item.invoice?.sales_point || 0).padStart(4, '0')}-${String(item.invoice?.voucher_number || 0).padStart(8, '0')}`
      const searchLower = filters.search.toLowerCase().trim()
      const searchNumbers = filters.search.replace(/\D/g, '')
      
      const matchesInvoice = invoiceNumber.toLowerCase().includes(searchLower)
      const matchesName = entityName.toLowerCase().includes(searchLower)
      const matchesCuit = entityCuit.includes(searchNumbers)
      
      if (!matchesInvoice && !matchesName && !matchesCuit) return false
    }
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-green-700">Historial de {type === 'receivable' ? 'Cobros' : 'Pagos'}</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredCollections.length} {type === 'receivable' ? 'cobro' : 'pago'}{filteredCollections.length !== 1 ? 's' : ''} registrado{filteredCollections.length !== 1 ? 's' : ''}
          </p>
          <p className="text-2xl font-bold mt-2">{formatCurrency(filteredCollections.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0))}</p>
        </div>
      </div>
      <div className="space-y-2">
        {filteredCollections.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No hay {type === 'receivable' ? 'cobros' : 'pagos'} registrados</p>
            <p className="text-xs mt-2">Los {type === 'receivable' ? 'cobros' : 'pagos'} aparecerán aquí una vez que registres {type === 'receivable' ? 'cobros' : 'pagos'} de facturas</p>
          </div>
        ) : (
          filteredCollections.map((item) => (
            <PaymentCollectionCard
              key={item.id}
              item={item}
              formatCurrency={formatCurrency}
              type={type}
            />
          ))
        )}
      </div>
    </div>
  )
}
