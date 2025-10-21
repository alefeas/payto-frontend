"use client"

import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ByEntityTabProps {
  invoices: any[]
  formatCurrency: (amount: number) => string
  onViewInvoices: (cuit: string) => void
  type: 'receivable' | 'payable'
}

export function ByEntityTab({ invoices, formatCurrency, onViewInvoices, type }: ByEntityTabProps) {
  const entityKey = type === 'receivable' ? 'client' : 'supplier'
  const entityIdKey = type === 'receivable' ? 'client_id' : 'supplier_id'
  const companyIdKey = type === 'receivable' ? 'receiver_company_id' : 'issuer_company_id'
  const entityLabel = type === 'receivable' ? 'Cliente' : 'Proveedor'
  const colorScheme = type === 'receivable' ? 'emerald' : 'violet'

  const byEntity = invoices.reduce((acc: any, inv) => {
    const entityId = inv[entityIdKey] || inv[companyIdKey] || 'unknown'
    const entity = inv[entityKey] || inv[type === 'receivable' ? 'receiverCompany' : 'issuerCompany']
    const entityName = entity?.business_name || 
                      (entity?.first_name && entity?.last_name ? `${entity.first_name} ${entity.last_name}` : null) ||
                      `${entityLabel} sin nombre`
    
    if (!acc[entityId]) {
      acc[entityId] = {
        entity_id: entityId,
        entity_name: entityName,
        invoice_count: 0,
        total_pending: 0,
        entity_cuit: entity?.document_number || entity?.national_id || ''
      }
    }
    
    acc[entityId].invoice_count++
    acc[entityId].total_pending += parseFloat(inv.total) || 0
    
    return acc
  }, {})
  
  const entitiesArray = Object.values(byEntity).sort((a: any, b: any) => b.total_pending - a.total_pending)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen por {entityLabel}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {entitiesArray.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay datos por {entityLabel.toLowerCase()}</p>
            </div>
          ) : (
            entitiesArray.map((entity: any) => (
              <div key={entity.entity_id} className={`p-4 border border-${colorScheme}-200 bg-${colorScheme}-50 rounded-lg`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full bg-${colorScheme}-500`}></div>
                      <div className="font-semibold text-gray-900">{entity.entity_name}</div>
                    </div>
                    {entity.entity_cuit && (
                      <div className="text-sm text-gray-500 ml-4">{entity.entity_cuit}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">Pendiente</div>
                    <div className={`font-bold text-lg text-${colorScheme}-600`}>{formatCurrency(entity.total_pending)}</div>
                  </div>
                </div>
                <div className={`flex items-center justify-between pt-3 border-t border-${colorScheme}-200`}>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">{entity.invoice_count}</span> factura{entity.invoice_count !== 1 ? 's' : ''}
                  </div>
                  <Button 
                    size="sm" 
                    className={`bg-${colorScheme}-500 hover:bg-${colorScheme}-600 text-white`}
                    onClick={() => onViewInvoices(entity.entity_cuit)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Facturas
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
