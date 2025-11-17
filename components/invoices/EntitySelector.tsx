"use client"

import { useState, useEffect, useRef } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Building2, UserPlus, Users, Plus, Info, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type EntityType = 'registered' | 'saved' | 'new'

interface Entity {
  id: string
  documentType: string
  documentNumber: string
  businessName?: string
  firstName?: string
  lastName?: string
  email?: string
  taxCondition?: string
}

interface ConnectedCompany {
  id: string
  name: string
  cuit: string
  taxCondition?: string
}

interface EntitySelectorProps {
  mode: 'client' | 'supplier'
  companyId: string
  savedEntities: Entity[]
  connectedCompanies?: ConnectedCompany[]
  isLoading?: boolean
  selectedEntityId?: string
  onSelect: (data: any) => void
  onEntityCreated?: (entityId?: string) => void
  autoSelectEntity?: { id: string, trigger: number }
}

export function EntitySelector({ 
  mode, 
  companyId, 
  savedEntities = [], 
  connectedCompanies = [], 
  isLoading,
  selectedEntityId,
  onSelect, 
  onEntityCreated,
  autoSelectEntity
}: EntitySelectorProps) {
  const [entityType, setEntityType] = useState<EntityType>('saved')
  const [selectedEntity, setSelectedEntity] = useState(selectedEntityId || '')
  const [selectedCompany, setSelectedCompany] = useState('')
  const [isNewEntityDialogOpen, setIsNewEntityDialogOpen] = useState(false)
  const [companySearchTerm, setCompanySearchTerm] = useState('')
  const [entitySearchTerm, setEntitySearchTerm] = useState('')
  const [isCompanySelectOpen, setIsCompanySelectOpen] = useState(false)
  const [isEntitySelectOpen, setIsEntitySelectOpen] = useState(false)
  const hasCalledCreatedRef = useRef(false)
  
  useEffect(() => {
    if (autoSelectEntity && savedEntities.length > 0) {
      const entity = savedEntities.find(e => e.id === autoSelectEntity.id)
      if (entity) {
        console.log('[EntitySelector] Auto-seleccionando:', autoSelectEntity.id)
        handleEntitySelect(autoSelectEntity.id)
      }
    }
  }, [autoSelectEntity?.trigger, savedEntities])

  const labels = {
    client: {
      registered: 'Empresa en mi red PayTo',
      saved: 'Cliente externo guardado',
      new: 'Nuevo cliente externo',
      entity: 'cliente',
      Entity: 'Cliente',
      selectEntity: 'Seleccionar Cliente',
      selectCompany: 'Seleccionar Empresa',
      noEntities: 'No tienes clientes guardados',
      noEntitiesDesc: 'Crea una factura con "Nuevo cliente externo" y marca la opción "Guardar cliente" para agregarlo aquí',
      noCompanies: 'No tienes empresas conectadas',
      noCompaniesDesc: 'Invita a otras empresas a tu red PayTo para facturarles directamente',
      createButton: 'Crear Cliente Externo',
      dialogTitle: 'Crear Nuevo Cliente',
      dialogDesc: 'Agrega un cliente externo para emitir facturas más rápido'
    },
    supplier: {
      registered: 'Empresa en mi red PayTo',
      saved: 'Proveedor externo guardado',
      new: 'Nuevo proveedor externo',
      entity: 'proveedor',
      Entity: 'Proveedor',
      selectEntity: 'Seleccionar Proveedor',
      selectCompany: 'Seleccionar Empresa',
      noEntities: 'No tienes proveedores guardados',
      noEntitiesDesc: 'Crea un nuevo proveedor para registrar facturas recibidas',
      noCompanies: 'No tienes empresas conectadas',
      noCompaniesDesc: 'Invita a otras empresas a tu red PayTo para registrar sus facturas directamente',
      createButton: 'Crear Proveedor Externo',
      dialogTitle: 'Crear Nuevo Proveedor',
      dialogDesc: 'Agrega un proveedor externo para registrar facturas recibidas'
    }
  }

  const t = labels[mode]

  const handleEntityTypeChange = (newType: EntityType) => {
    if (entityType === newType) return
    setEntityType(newType)
    setSelectedEntity('')
    setSelectedCompany('')
    onSelect({})
  }

  const handleEntitySelect = (entityId: string) => {
    setSelectedEntity(entityId)
    setSelectedCompany('')
    const entity = savedEntities.find(e => e.id === entityId)
    
    if (mode === 'client') {
      onSelect({ 
        entity_id: entityId,
        entity_data: entity ? {
          document_type: entity.documentType,
          document_number: entity.documentNumber,
          business_name: entity.businessName || `${entity.firstName} ${entity.lastName}`,
          email: entity.email,
          tax_condition: entity.taxCondition
        } : undefined
      })
    } else {
      onSelect({ entity_id: entityId })
    }
  }

  const handleCompanySelect = (companyId: string) => {
    setSelectedCompany(companyId)
    setSelectedEntity('')
    
    if (mode === 'client') {
      onSelect({ receiver_company_id: companyId })
    } else {
      onSelect({ issuer_company_id: companyId })
    }
  }

  const handleNewEntitySuccess = (createdEntity?: any) => {
    setIsNewEntityDialogOpen(false)
    
    if (createdEntity?.id && onEntityCreated && !hasCalledCreatedRef.current) {
      console.log('[EntitySelector] Llamando onEntityCreated con ID:', createdEntity.id)
      hasCalledCreatedRef.current = true
      onEntityCreated(createdEntity.id)
      setTimeout(() => {
        hasCalledCreatedRef.current = false
      }, 1000)
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {mode === 'client' && (
          <div
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
              entityType === 'registered' 
                ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200" 
                : "border-[var(--color-gray)] hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
            )}
            onClick={() => handleEntityTypeChange('registered')}
          >
            <div className={cn(
              "h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
              entityType === 'registered' ? "bg-gradient-to-br from-[#002bff] to-[#0078ff] border-[#002bff]" : "border-gray-300 bg-white"
            )}>
              {entityType === 'registered' && (
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <Building2 className={cn(
              "h-4 w-4",
              entityType === 'registered' ? "text-blue-600" : "text-muted-foreground"
            )} />
            <div className="flex-1">
              <div className="font-medium text-sm">{t.registered}</div>
              <p className="text-xs text-muted-foreground">Facturación directa con notificaciones</p>
            </div>
          </div>
        )}
        
        {mode === 'supplier' && (
          <div
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
              entityType === 'registered' 
                ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200" 
                : "border-[var(--color-gray)] hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
            )}
            onClick={() => handleEntityTypeChange('registered')}
          >
            <div className={cn(
              "h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
              entityType === 'registered' ? "bg-gradient-to-br from-[#002bff] to-[#0078ff] border-[#002bff]" : "border-gray-300 bg-white"
            )}>
              {entityType === 'registered' && (
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <Building2 className={cn(
              "h-4 w-4",
              entityType === 'registered' ? "text-blue-600" : "text-muted-foreground"
            )} />
            <div className="flex-1">
              <div className="font-medium text-sm">{t.registered}</div>
              <p className="text-xs text-muted-foreground">Facturación directa con notificaciones</p>
            </div>
          </div>
        )}
        
        <div
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
            entityType === 'saved' 
              ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200" 
              : "border-[var(--color-gray)] hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
          )}
          onClick={() => handleEntityTypeChange('saved')}
        >
          <div className={cn(
            "h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
            entityType === 'saved' ? "bg-gradient-to-br from-[var(--gradient-top-left)] to-[var(--gradient-top-right)] border-[var(--color-accent)]" : "border-gray-300 bg-white"
          )}>
            {entityType === 'saved' && (
              <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <Users className={cn(
            "h-4 w-4",
            entityType === 'saved' ? "text-blue-600" : "text-muted-foreground"
          )} />
          <div className="flex-1">
            <div className="font-medium text-sm">{t.saved}</div>
            <p className="text-xs text-muted-foreground">
              {savedEntities.length > 0 ? `${savedEntities.length} guardado${savedEntities.length > 1 ? 's' : ''}` : `Aún no tienes ${mode === 'client' ? 'clientes' : 'proveedores'}`}
            </p>
          </div>
        </div>
        
        <div
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
            entityType === 'new' 
              ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200" 
              : "border-[var(--color-gray)] hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
          )}
          onClick={() => handleEntityTypeChange('new')}
        >
          <div className={cn(
            "h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
            entityType === 'new' ? "bg-gradient-to-br from-[var(--gradient-top-left)] to-[var(--gradient-top-right)] border-[var(--color-accent)]" : "border-gray-300 bg-white"
          )}>
            {entityType === 'new' && (
              <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <UserPlus className={cn(
            "h-4 w-4",
            entityType === 'new' ? "text-blue-600" : "text-muted-foreground"
          )} />
          <div className="flex-1">
            <div className="font-medium text-sm">{t.new}</div>
            <p className="text-xs text-muted-foreground">Consumidor final o empresa sin registro</p>
          </div>
        </div>
      </div>

      {entityType === 'registered' && (
        <div className="space-y-2">
          <Label className="text-sm font-semibold">{t.selectCompany}</Label>
          {connectedCompanies.length === 0 ? (
            <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
              <svg className="h-5 w-5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{t.noCompanies}</p>
                <p className="text-xs text-gray-600 mt-1">{t.noCompaniesDesc}</p>
              </div>
            </div>
          ) : (
            <Select value={selectedCompany} onValueChange={handleCompanySelect} open={isCompanySelectOpen} onOpenChange={setIsCompanySelectOpen}>
              <SelectTrigger>
                <SelectValue placeholder={`Buscar empresa en tu red...`} />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-2 sticky top-0 bg-white border-b border-gray-100" onClick={(e) => e.stopPropagation()}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                    <Input
                      type="text"
                      placeholder="Buscar empresa..."
                      value={companySearchTerm}
                      onChange={(e) => setCompanySearchTerm(e.target.value)}
                      className="pl-9 h-8 text-sm"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                {(() => {
                  const filtered = connectedCompanies.filter(company =>
                    company.name.toLowerCase().includes(companySearchTerm.toLowerCase()) ||
                    company.cuit.toLowerCase().includes(companySearchTerm.toLowerCase())
                  )
                  
                  const hasResults = filtered.length > 0
                  
                  return (
                    <>
                      {!hasResults && companySearchTerm && (
                        <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                          No se encontraron empresas
                        </div>
                      )}
                      {connectedCompanies.map(company => {
                        const matches = company.name.toLowerCase().includes(companySearchTerm.toLowerCase()) ||
                                       company.cuit.toLowerCase().includes(companySearchTerm.toLowerCase())
                        
                        return (
                          <SelectItem 
                            key={company.id} 
                            value={company.id}
                            className={!matches && companySearchTerm ? 'hidden' : ''}
                          >
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                <span className="font-medium">{company.name}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                CUIT: {company.cuit || 'N/A'} • {company.taxCondition === 'registered_taxpayer' ? 'RI' : 
                                 company.taxCondition === 'monotax' ? 'Monotributo' : 
                                 company.taxCondition === 'exempt' ? 'Exento' : 'CF'}
                              </span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </>
                  )
                })()}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {entityType === 'saved' && (
        <div className="space-y-2">
          <Label className="text-sm font-semibold">{t.selectEntity}</Label>
          {savedEntities.length === 0 ? (
            <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
              <svg className="h-5 w-5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{t.noEntities}</p>
                <p className="text-xs text-gray-600 mt-1">{t.noEntitiesDesc}</p>
              </div>
            </div>
          ) : (
            <Select value={selectedEntity} onValueChange={handleEntitySelect} open={isEntitySelectOpen} onOpenChange={setIsEntitySelectOpen}>
              <SelectTrigger>
                <SelectValue placeholder={`Buscar ${t.entity} guardado...`} />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-2 sticky top-0 bg-white border-b border-gray-100" onClick={(e) => e.stopPropagation()}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                    <Input
                      type="text"
                      placeholder={`Buscar ${t.entity}...`}
                      value={entitySearchTerm}
                      onChange={(e) => setEntitySearchTerm(e.target.value)}
                      className="pl-9 h-8 text-sm"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                {(() => {
                  const filtered = savedEntities.filter(entity => {
                    const displayName = entity.businessName || `${entity.firstName} ${entity.lastName}` || entity.documentNumber
                    return displayName.toLowerCase().includes(entitySearchTerm.toLowerCase()) ||
                           entity.documentNumber.toLowerCase().includes(entitySearchTerm.toLowerCase()) ||
                           entity.email?.toLowerCase().includes(entitySearchTerm.toLowerCase())
                  })
                  
                  const hasResults = filtered.length > 0
                  
                  return (
                    <>
                      {!hasResults && entitySearchTerm && (
                        <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                          No se encontraron {t.entity}s
                        </div>
                      )}
                      {savedEntities.map(entity => {
                        const displayName = entity.businessName || `${entity.firstName} ${entity.lastName}` || entity.documentNumber
                        const matches = displayName.toLowerCase().includes(entitySearchTerm.toLowerCase()) ||
                                       entity.documentNumber.toLowerCase().includes(entitySearchTerm.toLowerCase()) ||
                                       entity.email?.toLowerCase().includes(entitySearchTerm.toLowerCase())
                        
                        const taxConditionLabel = {
                          'registered_taxpayer': 'RI',
                          'monotax': 'Monotributo',
                          'exempt': 'Exento',
                          'final_consumer': 'CF'
                        }[entity.taxCondition || ''] || entity.taxCondition
                        
                        const docTypeDisplay = entity.taxCondition === 'final_consumer' && entity.documentType === 'CUIT' 
                          ? 'DNI' 
                          : entity.documentType
                        
                        return (
                          <SelectItem 
                            key={entity.id} 
                            value={entity.id.toString()}
                            className={!matches && entitySearchTerm ? 'hidden' : ''}
                          >
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{displayName}</span>
                                <span className="text-xs text-muted-foreground">({docTypeDisplay} {entity.documentNumber})</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{taxConditionLabel}</span>
                                {entity.email && <span>• {entity.email}</span>}
                              </div>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </>
                  )
                })()}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {entityType === 'new' && (
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Agregar Nuevo {t.Entity}</Label>
          <Button 
            type="button"
            variant="outline"
            onClick={() => setIsNewEntityDialogOpen(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4" />
            {t.createButton}
          </Button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white border border-gray-200 p-2.5 rounded-md">
            <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <span>El {t.entity} se guardará automáticamente para futuras facturas</span>
          </div>
        </div>
      )}

      <Dialog open={isNewEntityDialogOpen} onOpenChange={setIsNewEntityDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{t.dialogTitle}</DialogTitle>
            <DialogDescription>{t.dialogDesc}</DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1">
            {mode === 'client' ? (
              <ClientFormDynamic 
                companyId={companyId}
                onClose={() => setIsNewEntityDialogOpen(false)}
                onSuccess={handleNewEntitySuccess}
              />
            ) : (
              <SupplierFormDynamic 
                companyId={companyId}
                onClose={() => setIsNewEntityDialogOpen(false)}
                onSuccess={handleNewEntitySuccess}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Dynamic imports to avoid circular dependencies
function ClientFormDynamic({ companyId, onClose, onSuccess }: any) {
  const { ClientForm } = require('@/components/clients/ClientForm')
  return <ClientForm companyId={companyId} onClose={onClose} onSuccess={onSuccess} />
}

function SupplierFormDynamic({ companyId, onClose, onSuccess }: any) {
  const { SupplierForm } = require('@/components/suppliers/SupplierForm')
  return <SupplierForm companyId={companyId} onClose={onClose} onSuccess={onSuccess} />
}
