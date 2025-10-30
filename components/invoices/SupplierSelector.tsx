"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Building2, UserPlus, Plus, Loader2 } from "lucide-react"
import { SupplierForm } from "@/components/suppliers/SupplierForm"

interface Supplier {
  id: string
  documentType: string
  documentNumber: string
  businessName?: string
  firstName?: string
  lastName?: string
  email?: string
  taxCondition?: string
}

interface SupplierSelectorProps {
  companyId: string
  savedSuppliers: Supplier[]
  isLoading?: boolean
  onSelect: (data: { supplier_id?: string }) => void
  onSupplierCreated?: () => void
}

type SupplierType = 'saved' | 'new'

export function SupplierSelector({ companyId, savedSuppliers = [], isLoading, onSelect, onSupplierCreated }: SupplierSelectorProps) {
  const [supplierType, setSupplierType] = useState<SupplierType>('saved')
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [isNewSupplierDialogOpen, setIsNewSupplierDialogOpen] = useState(false)
  const [isCreatingSupplier, setIsCreatingSupplier] = useState(false)

  const handleSupplierSelect = (supplierId: string) => {
    setSelectedSupplier(supplierId)
    onSelect({ supplier_id: supplierId })
  }

  const handleNewSupplierSuccess = (createdSupplier?: any) => {
    if (createdSupplier) {
      setIsCreatingSupplier(true)
      
      // Smooth transition: first switch type, then select after a brief moment
      setSupplierType('saved')
      
      setTimeout(() => {
        setSelectedSupplier(createdSupplier.id.toString())
        onSelect({ supplier_id: createdSupplier.id.toString() })
        
        // Reload suppliers list in background
        if (onSupplierCreated) {
          onSupplierCreated()
        }
        
        setIsCreatingSupplier(false)
      }, 300)
    }
    setIsNewSupplierDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <RadioGroup value={supplierType} onValueChange={(v) => setSupplierType(v as SupplierType)}>
        <Label 
          htmlFor="saved-supplier" 
          className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
        >
          <RadioGroupItem value="saved" id="saved-supplier" />
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <div className="font-medium">
              Proveedor guardado
            </div>
            <p className="text-xs text-muted-foreground">
              {savedSuppliers.length > 0 
                ? `${savedSuppliers.length} proveedor${savedSuppliers.length > 1 ? 'es' : ''} guardado${savedSuppliers.length > 1 ? 's' : ''}`
                : 'Aún no tienes proveedores guardados'}
            </p>
          </div>
        </Label>
        
        <Label 
          htmlFor="new-supplier" 
          className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
        >
          <RadioGroupItem value="new" id="new-supplier" />
          <UserPlus className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <div className="font-medium">
              Nuevo proveedor
            </div>
            <p className="text-xs text-muted-foreground">
              Agregar un nuevo proveedor externo
            </p>
          </div>
        </Label>
      </RadioGroup>

      {supplierType === 'saved' && (
        <div className="space-y-2 p-4 border rounded-lg bg-accent/50">
          <Label>Seleccionar Proveedor</Label>
          {(isLoading || isCreatingSupplier) ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">{isCreatingSupplier ? 'Agregando proveedor...' : 'Cargando proveedores...'}</span>
            </div>
          ) : savedSuppliers.length === 0 ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900 font-medium">No tienes proveedores guardados</p>
              <p className="text-xs text-amber-700 mt-1">
                Crea un nuevo proveedor para registrar facturas recibidas
              </p>
            </div>
          ) : (
            <Select value={selectedSupplier} onValueChange={handleSupplierSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Buscar proveedor guardado..." />
              </SelectTrigger>
              <SelectContent>
                {savedSuppliers.map(supplier => {
                  const displayName = supplier.businessName || `${supplier.firstName} ${supplier.lastName}` || supplier.documentNumber
                  const taxConditionLabel = {
                    'registered_taxpayer': 'RI',
                    'monotax': 'Monotributo',
                    'exempt': 'Exento',
                    'final_consumer': 'CF'
                  }[supplier.taxCondition || ''] || supplier.taxCondition
                  
                  const docTypeDisplay = supplier.taxCondition === 'final_consumer' && supplier.documentType === 'CUIT' 
                    ? 'DNI' 
                    : supplier.documentType
                  
                  return (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{displayName}</span>
                          <span className="text-xs text-muted-foreground">({docTypeDisplay} {supplier.documentNumber})</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{taxConditionLabel}</span>
                          {supplier.email && <span>• {supplier.email}</span>}
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {supplierType === 'new' && (
        <div className="space-y-2 p-4 border rounded-lg bg-accent/50">
          <Label>Agregar Nuevo Proveedor</Label>
          <Button 
            type="button"
            variant="outline" 
            className="w-full"
            onClick={() => setIsNewSupplierDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear Proveedor
          </Button>
          <p className="text-xs text-muted-foreground">
            El proveedor se guardará automáticamente para futuras facturas
          </p>
        </div>
      )}

      <Dialog open={isNewSupplierDialogOpen} onOpenChange={setIsNewSupplierDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Proveedor</DialogTitle>
            <DialogDescription>
              Agrega un proveedor externo para registrar facturas recibidas
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1">
            <SupplierForm 
              companyId={companyId}
              onClose={() => setIsNewSupplierDialogOpen(false)}
              onSuccess={handleNewSupplierSuccess}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
