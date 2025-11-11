"use client"

import { Badge } from "@/components/ui/badge"
import { Calendar, CreditCard, FileText } from "lucide-react"
import { parseDateLocal } from "@/lib/utils"

interface PaymentCollectionCardProps {
  item: any
  formatCurrency: (amount: number, currency?: string) => string
  type: 'receivable' | 'payable'
}

export function PaymentCollectionCard({ item, formatCurrency, type }: PaymentCollectionCardProps) {
  const entityKey = type === 'receivable' ? 'client' : 'supplier'
  const companyKey = type === 'receivable' ? 'receiverCompany' : 'issuerCompany'
  const entity = item.invoice?.[entityKey] || item.invoice?.[companyKey]
  const entityName = entity?.business_name || 
                   entity?.name ||
                   (entity?.first_name && entity?.last_name ? `${entity.first_name} ${entity.last_name}` : null) ||
                   (type === 'receivable' ? 'Cliente' : 'Proveedor')
  
  const actionLabel = type === 'receivable' ? 'Cobrado' : 'Pagado'
  const date = item.collection_date || item.payment_date
  
  const totalWithholdings = Array.isArray(item.retentions) 
    ? item.retentions.reduce((sum: number, r: any) => sum + (parseFloat(r.amount) || 0), 0)
    : (parseFloat(item.withholding_iva || 0) + parseFloat(item.withholding_ganancias || 0) + parseFloat(item.withholding_iibb || 0) + parseFloat(item.withholding_suss || 0) + parseFloat(item.withholding_other || 0))
  
  const methodLabels: Record<string, string> = {
    transfer: 'Transferencia',
    check: 'Cheque',
    cash: 'Efectivo',
    debit_card: 'Débito',
    credit_card: 'Crédito',
    card: 'Tarjeta',
    other: 'Otro'
  }

  const methodIcons: Record<string, any> = {
    transfer: CreditCard,
    check: FileText,
    cash: FileText,
    card: CreditCard,
    debit_card: CreditCard,
    credit_card: CreditCard,
    other: FileText
  }

  const method = item.collection_method || item.payment_method
  const MethodIcon = methodIcons[method] || FileText
  
  // Obtener NC/ND aplicadas a esta factura
  const creditNotes = item.invoice?.credit_notes_applied || []
  const debitNotes = item.invoice?.debit_notes_applied || []
  const hasNotes = creditNotes.length > 0 || debitNotes.length > 0

  return (
    <div className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50/50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <div className="font-medium mb-1">{entityName}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {item.invoice?.type || 'FC'} {String(item.invoice?.sales_point || 0).padStart(4, '0')}-{String(item.invoice?.voucher_number || item.voucher_number || 0).padStart(8, '0')}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <div className="font-bold text-lg text-green-600">{formatCurrency((parseFloat(item.amount) || 0) - totalWithholdings, item.currency || item.invoice?.currency)}</div>
            <Badge className="bg-green-600 text-white text-xs">{actionLabel}</Badge>
          </div>
          {totalWithholdings > 0 && (
            <div className="text-xs text-muted-foreground">Bruto: {formatCurrency(parseFloat(item.amount) || 0, item.currency || item.invoice?.currency)}</div>
          )}
        </div>
      </div>
      
      {hasNotes && (
        <div className="mb-2 pl-2 border-l-2 border-gray-300 space-y-1">
          {creditNotes.map((nc: any) => (
            <div key={nc.id} className="flex justify-between text-xs text-red-600">
              <span>NC {String(nc.sales_point || 0).padStart(4, '0')}-{String(nc.voucher_number || 0).padStart(8, '0')}</span>
              <span>-{formatCurrency(nc.total || 0, item.invoice?.currency)}</span>
            </div>
          ))}
          {debitNotes.map((nd: any) => (
            <div key={nd.id} className="flex justify-between text-xs text-orange-600">
              <span>ND {String(nd.sales_point || 0).padStart(4, '0')}-{String(nd.voucher_number || 0).padStart(8, '0')}</span>
              <span>+{formatCurrency(nd.total || 0, item.invoice?.currency)}</span>
            </div>
          ))}
        </div>
      )}
      
      {totalWithholdings > 0 && (
        <div className="mb-2 pl-2 border-l-2 border-orange-300 space-y-1">
          {Array.isArray(item.retentions) ? (
            item.retentions.map((ret: any, idx: number) => (
              <div key={idx} className="flex justify-between text-xs text-orange-700">
                <span>{ret.name || ret.type}</span>
                <span>-{formatCurrency(parseFloat(ret.amount) || 0, item.currency || item.invoice?.currency)}</span>
              </div>
            ))
          ) : (
            <>
              {parseFloat(item.withholding_iva || 0) > 0 && (
                <div className="flex justify-between text-xs text-orange-700">
                  <span>Retención IVA</span>
                  <span>-{formatCurrency(parseFloat(item.withholding_iva), item.currency || item.invoice?.currency)}</span>
                </div>
              )}
              {parseFloat(item.withholding_ganancias || 0) > 0 && (
                <div className="flex justify-between text-xs text-orange-700">
                  <span>Retención Ganancias</span>
                  <span>-{formatCurrency(parseFloat(item.withholding_ganancias), item.currency || item.invoice?.currency)}</span>
                </div>
              )}
              {parseFloat(item.withholding_iibb || 0) > 0 && (
                <div className="flex justify-between text-xs text-orange-700">
                  <span>Retención IIBB</span>
                  <span>-{formatCurrency(parseFloat(item.withholding_iibb), item.currency || item.invoice?.currency)}</span>
                </div>
              )}
              {parseFloat(item.withholding_suss || 0) > 0 && (
                <div className="flex justify-between text-xs text-orange-700">
                  <span>Retención SUSS</span>
                  <span>-{formatCurrency(parseFloat(item.withholding_suss), item.currency || item.invoice?.currency)}</span>
                </div>
              )}
              {parseFloat(item.withholding_other || 0) > 0 && (
                <div className="flex justify-between text-xs text-orange-700">
                  <span>Otra Retención</span>
                  <span>-{formatCurrency(parseFloat(item.withholding_other), item.currency || item.invoice?.currency)}</span>
                </div>
              )}
            </>
          )}
          <div className="flex justify-between text-xs font-semibold text-orange-800 pt-1 border-t border-orange-200">
            <span>Total Retenciones:</span>
            <span>-{formatCurrency(totalWithholdings, item.currency || item.invoice?.currency)}</span>
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <Calendar className="h-3 w-3" />
        <span>{parseDateLocal(date)?.toLocaleDateString('es-AR')}</span>
        <MethodIcon className="h-3 w-3 ml-2" />
        <span>{methodLabels[method] || method}</span>
      </div>
    </div>
  )
}
