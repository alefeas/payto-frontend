"use client"

import { useState } from "react"
import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

interface ByEntityTabProps {
  invoices: any[]
  formatCurrency: (amount: number) => string
  onViewInvoices: (cuit: string) => void
  onViewInvoice: (id: string) => void
  onActionInvoice: (id: string) => void
  onGenerateTxt?: (ids: string[]) => void | Promise<void>
  type: 'receivable' | 'payable'
}

export function ByEntityTab({ invoices, formatCurrency, onViewInvoices, onViewInvoice, onActionInvoice, onGenerateTxt, type }: ByEntityTabProps) {
  const [selectedEntity, setSelectedEntity] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [generatingTxt, setGeneratingTxt] = useState(false)
  const entityKey = type === 'receivable' ? 'client' : 'supplier'
  const entityIdKey = type === 'receivable' ? 'client_id' : 'supplier_id'
  const companyIdKey = type === 'receivable' ? 'receiver_company_id' : 'issuer_company_id'
  const companyKey = type === 'receivable' ? 'receiverCompany' : 'issuerCompany'
  const entityLabel = type === 'receivable' ? 'Cliente' : 'Proveedor'

  const byEntity = invoices.reduce((acc: any, inv) => {
    let entityId = inv[entityIdKey] || inv[companyIdKey]
    let entity = inv[entityKey] || inv[companyKey]
    
    if (!entityId && !entity) {
      entityId = 'sin-identificar'
    }
    
    const entityName = (type === 'receivable' ? inv.receiver_name : null) ||
                      entity?.business_name || 
                      entity?.name ||
                      (entity?.first_name && entity?.last_name ? `${entity.first_name} ${entity.last_name}` : null) ||
                      (entityId === 'sin-identificar' ? `${entityLabel} sin identificar` : `${entityLabel} sin nombre`)
    const rawCuit = (entity?.document_number || entity?.national_id || '').toString().replace(/\D/g, '')
    const entityCuit = rawCuit.length === 11 ? `${rawCuit.slice(0,2)}-${rawCuit.slice(2,10)}-${rawCuit.slice(10)}` : rawCuit
    
    if (!acc[entityId]) {
      acc[entityId] = {
        entity_id: entityId,
        entity_name: entityName,
        invoice_count: 0,
        total_pending: 0,
        entity_cuit: entityCuit,
        entity_search_key: entityCuit || entityName
      }
    }
    
    acc[entityId].invoice_count++
    acc[entityId].total_pending += parseFloat(inv.pending_amount || inv.total) || 0
    
    return acc
  }, {})
  
  const entitiesArray = Object.values(byEntity).sort((a: any, b: any) => b.total_pending - a.total_pending)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Resumen por {entityLabel}</h3>
      <div className="space-y-3">
        {entitiesArray.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No hay datos por {entityLabel.toLowerCase()}</p>
          </div>
        ) : (
          entitiesArray.map((entity: any) => {
            const entityInvoices = invoices.filter(inv => {
              const entityId = inv[entityIdKey] || inv[companyIdKey] || 'sin-identificar'
              return entityId === entity.entity_id
            })
            
            return (
            <div 
              key={entity.entity_id} 
              className="p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50/50 hover:border-blue-200 hover:shadow-md transition-all"
              onClick={() => {
                setSelectedEntity({ ...entity, invoices: entityInvoices })
                setShowModal(true)
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    <div className="font-semibold">{entity.entity_name}</div>
                  </div>
                  {entity.entity_cuit && (
                    <div className="text-sm text-muted-foreground ml-4">{entity.entity_cuit}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground mb-1">Pendiente</div>
                  <div className="font-bold text-lg text-blue-600">{formatCurrency(entity.total_pending)}</div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{entity.invoice_count}</span> factura{entity.invoice_count !== 1 ? 's' : ''}
                </div>
                <Badge variant="outline" className="text-xs">
                  Click para ver
                </Badge>
              </div>
            </div>
            )
          })
        )}
      </div>
      
      {/* Modal de Facturas */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <div className="text-xl font-bold">{selectedEntity?.entity_name}</div>
              <div className="flex items-center gap-2 mt-1">
                {selectedEntity?.entity_cuit && (
                  <div className="text-sm text-muted-foreground font-normal">{selectedEntity.entity_cuit}</div>
                )}
                {type === 'payable' && selectedEntity?.invoices?.[0]?.has_bank_data && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    ✓ Datos bancarios
                  </Badge>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <div className="text-sm text-muted-foreground">Total Pendiente</div>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(selectedEntity?.total_pending || 0)}</div>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => {
                if (selectedInvoices.length === selectedEntity?.invoices?.length) {
                  setSelectedInvoices([])
                } else {
                  setSelectedInvoices(selectedEntity?.invoices?.map((inv: any) => inv.id) || [])
                }
              }}>
                {selectedInvoices.length === selectedEntity?.invoices?.length ? 'Deseleccionar Todas' : 'Seleccionar Todas'}
              </Button>
              <div className="flex gap-2">
              {type === 'payable' && onGenerateTxt && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={generatingTxt || selectedInvoices.length === 0}
                  onClick={async () => {
                    setGeneratingTxt(true)
                    try {
                      await onGenerateTxt(selectedInvoices)
                      setSelectedInvoices([])
                    } finally {
                      setGeneratingTxt(false)
                    }
                  }}
                >
                  {generatingTxt ? 'Generando...' : `Generar TXT ${selectedInvoices.length > 0 ? `(${selectedInvoices.length})` : ''}`}
                </Button>
              )}
              <Button 
                size="sm" 
                disabled={selectedInvoices.length === 0}
                onClick={() => {
                  selectedInvoices.forEach(id => onActionInvoice(id))
                  setSelectedInvoices([])
                }}
              >
                {type === 'receivable' ? 'Registrar Cobro' : 'Registrar Pago'} {selectedInvoices.length > 0 && `(${selectedInvoices.length})`}
              </Button>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {selectedEntity?.invoices?.map((invoice: any) => {
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const dueDate = new Date(invoice.due_date)
              dueDate.setHours(0, 0, 0, 0)
              const isOverdue = dueDate < today
              
              const isSelected = selectedInvoices.includes(invoice.id)
              
              return (
                <div 
                  key={invoice.id} 
                  className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-blue-50/50 hover:border-blue-200'
                  }`}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedInvoices(selectedInvoices.filter(id => id !== invoice.id))
                    } else {
                      setSelectedInvoices([...selectedInvoices, invoice.id])
                    }
                  }}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => {}}
                  />
                  <div className="flex-1">
                    <div className="font-medium">
                      {invoice.type || 'FC'} {String(invoice.sales_point || 0).padStart(4, '0')}-{String(invoice.voucher_number || 0).padStart(8, '0')}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Emisión: {new Date(invoice.issue_date).toLocaleDateString('es-AR')} • 
                      Vencimiento: {new Date(invoice.due_date).toLocaleDateString('es-AR')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-bold text-lg">{formatCurrency(invoice.pending_amount || invoice.total)}</div>
                      {isOverdue && <Badge className="mt-1 bg-red-100 text-red-700 font-medium">Vencida</Badge>}
                    </div>
                    <Button size="sm" variant="ghost" onClick={(e) => {
                      e.stopPropagation()
                      onViewInvoice(invoice.id)
                    }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
