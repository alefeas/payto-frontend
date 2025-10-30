"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { clientService, Client } from "@/services/client.service"
import { supplierService, Supplier } from "@/services/supplier.service"
import { formatCUIT, formatPhone } from "@/lib/input-formatters"
import { afipPadronService } from "@/services/afip-padron.service"
import { Loader2, CheckCircle2 } from "lucide-react"

type EntityType = "client" | "supplier"
type Entity = Client | Supplier

interface EntityFormProps {
  type: EntityType
  entity?: Entity | null
  companyId: string
  onClose: () => void
  onSuccess: (createdEntity?: Entity) => void
  showBankFields?: boolean
}

export function EntityForm({ type, entity, companyId, onClose, onSuccess, showBankFields = false }: EntityFormProps) {
  const [formData, setFormData] = useState<{
    documentType: "CUIT" | "CUIL" | "DNI" | "CDI" | "Pasaporte"
    documentNumber: string
    businessName: string
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    postalCode: string
    city: string
    province: string
    taxCondition: "registered_taxpayer" | "monotax" | "exempt" | "final_consumer"
    bankName: string
    bankAccountType: "CA" | "CC" | ""
    bankAccountNumber: string
    bankCbu: string
    bankAlias: string
  }>({
    documentType: entity?.documentType || "CUIT",
    documentNumber: entity?.documentNumber || "",
    businessName: entity?.businessName || "",
    firstName: entity?.firstName || "",
    lastName: entity?.lastName || "",
    email: entity?.email || "",
    phone: entity?.phone || "",
    address: entity?.address || "",
    postalCode: (entity as any)?.postalCode || "",
    city: (entity as any)?.city || "",
    province: (entity as any)?.province || "",
    taxCondition: entity?.taxCondition || (type === "client" ? "final_consumer" : "registered_taxpayer"),
    bankName: (entity as Supplier)?.bankName || "",
    bankAccountType: (entity as Supplier)?.bankAccountType || "",
    bankAccountNumber: (entity as Supplier)?.bankAccountNumber || "",
    bankCbu: (entity as Supplier)?.bankCbu || "",
    bankAlias: (entity as Supplier)?.bankAlias || ""
  })
  const [saving, setSaving] = useState(false)
  const [validating, setValidating] = useState(false)
  const [validated, setValidated] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors }
    
    switch (field) {
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Email no válido'
        } else {
          delete newErrors.email
        }
        break
      case 'documentNumber':
        if (formData.taxCondition === 'final_consumer') {
          if (value && value.length < 7) {
            newErrors.documentNumber = 'DNI debe tener al menos 7 dígitos'
          } else {
            delete newErrors.documentNumber
          }
        } else {
          if (value && value.replace(/\D/g, '').length !== 11) {
            newErrors.documentNumber = 'CUIT debe tener 11 dígitos'
          } else {
            delete newErrors.documentNumber
          }
        }
        break
      case 'phone':
        if (value && value.replace(/\D/g, '').length < 8) {
          newErrors.phone = 'Teléfono debe tener al menos 8 dígitos'
        } else {
          delete newErrors.phone
        }
        break
    }
    
    setErrors(newErrors)
  }

  const getFieldClassName = (field: string, value: string, isRequired = false) => {
    if (errors[field]) {
      return 'border-red-300 bg-red-50'
    }
    if (value && !errors[field]) {
      return 'border-green-300 bg-green-50'
    }
    if (isRequired && !value) {
      return 'border-amber-300'
    }
    return ''
  }

  const entityName = type === "client" ? "Cliente" : "Proveedor"
  const entityNameLower = type === "client" ? "cliente" : "proveedor"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (formData.taxCondition === 'final_consumer') {
      if (!formData.firstName || !formData.lastName) {
        toast.error('Nombre y Apellido son obligatorios para Consumidor Final')
        return
      }
      if (!formData.documentNumber) {
        toast.error('El DNI es obligatorio para Consumidor Final')
        return
      }
      if (formData.documentNumber.length < 7) {
        toast.error('El DNI debe tener al menos 7 dígitos')
        return
      }
    } else {
      if (!formData.businessName && (!formData.firstName || !formData.lastName)) {
        toast.error('Debes completar Razón Social o Nombre y Apellido')
        return
      }
      if (!formData.documentNumber) {
        toast.error('CUIT es obligatorio')
        return
      }
      if (!['CUIT', 'CUIL'].includes(formData.documentType)) {
        toast.error('Debe usar CUIT')
        return
      }
      if (formData.documentNumber.replace(/\D/g, '').length !== 11) {
        toast.error('El CUIT debe tener 11 dígitos')
        return
      }
    }
    
    if (formData.taxCondition !== 'final_consumer' && !formData.address) {
      toast.error('El domicilio fiscal es obligatorio')
      return
    }
    
    try {
      setSaving(true)
      const data: any = {
        document_type: formData.documentType,
        document_number: formData.documentNumber || null,
        business_name: formData.businessName || undefined,
        first_name: formData.firstName || undefined,
        last_name: formData.lastName || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.taxCondition !== 'final_consumer' ? formData.address : undefined,
        postal_code: formData.postalCode || undefined,
        city: formData.city || undefined,
        province: formData.province || undefined,
        tax_condition: formData.taxCondition
      }

      if (showBankFields) {
        data.bank_name = formData.bankName || undefined
        data.bank_account_type = formData.bankAccountType || undefined
        data.bank_account_number = formData.bankAccountNumber || undefined
        data.bank_cbu = formData.bankCbu || undefined
        data.bank_alias = formData.bankAlias || undefined
      }
      
      if (entity) {
        if (type === "client") {
          await clientService.updateClient(companyId, entity.id as string, data)
        } else {
          await supplierService.updateSupplier(companyId, entity.id as number, data)
        }
        toast.success(`${entityName} actualizado`)
        onSuccess()
      } else {
        let createdEntity: Entity
        if (type === "client") {
          createdEntity = await clientService.createClient(companyId, data)
          toast.success('Cliente creado y seleccionado')
          onSuccess(createdEntity)
        } else {
          createdEntity = await supplierService.createSupplier(companyId, data)
          toast.success('Proveedor creado y seleccionado')
          onSuccess(createdEntity)
        }
      }
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Error al guardar ${entityNameLower}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${showBankFields ? 'max-h-[70vh] overflow-y-auto pr-2' : ''}`}>
      {formData.taxCondition === 'final_consumer' ? (
        <div className="space-y-2">
          <Label htmlFor="documentNumber" className="flex items-center gap-1">
            DNI
            <span className="text-red-500 text-xs">*</span>
          </Label>
          <Input
            id="documentNumber"
            value={formData.documentNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 8)
              setFormData({...formData, documentNumber: value, documentType: 'DNI'})
              setValidated(false)
              validateField('documentNumber', value)
            }}
            placeholder="7-8 dígitos"
            maxLength={8}
            required
            className={getFieldClassName('documentNumber', formData.documentNumber, true)}
          />
          {errors.documentNumber && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <span className="w-1 h-1 bg-red-600 rounded-full"></span>
              {errors.documentNumber}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="documentNumber" className="flex items-center gap-1">
            CUIT
            <span className="text-red-500 text-xs">*</span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="documentNumber"
              value={formData.documentNumber}
              onChange={(e) => {
                const value = e.target.value
                const numbers = value.replace(/\D/g, '').slice(0, 11)
                const formatted = formatCUIT(numbers)
                setFormData({...formData, documentNumber: formatted, documentType: 'CUIT'})
                setValidated(false)
                validateField('documentNumber', formatted)
              }}
              placeholder="20-12345678-9"
              required
              className={getFieldClassName('documentNumber', formData.documentNumber, true)}
            />
            {errors.documentNumber && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                {errors.documentNumber}
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                if (formData.documentNumber.replace(/\D/g, '').length !== 11) {
                  toast.error('Ingresa un CUIT válido')
                  return
                }
                try {
                  setValidating(true)
                  const result = await afipPadronService.searchByCuit(companyId, formData.documentNumber)
                  
                  if (result.success && result.data) {
                    const taxConditionMap: Record<string, "registered_taxpayer" | "monotax" | "exempt" | "final_consumer"> = {
                      'responsable_inscripto': 'registered_taxpayer',
                      'monotributo': 'monotax',
                      'exento': 'exempt',
                      'consumidor_final': 'final_consumer'
                    }
                    
                    setFormData({
                      ...formData,
                      businessName: result.data.business_name || result.data.name || formData.businessName,
                      taxCondition: taxConditionMap[result.data.tax_condition] || formData.taxCondition,
                      address: result.data.address || formData.address
                    })
                    setValidated(true)
                    
                    const message = result.mock_mode
                      ? 'Datos simulados cargados (modo testing)'
                      : 'Datos obtenidos de AFIP'
                    
                    toast.success(message, {
                      description: result.mock_mode
                        ? 'El servicio de padrón AFIP solo funciona con certificado de producción'
                        : undefined
                    })
                  }
                } catch (error: any) {
                  if (error.response?.status === 400 && error.response?.data?.error?.includes('certificado')) {
                    toast.error('Configura un certificado AFIP primero', { duration: 6000 })
                  } else {
                    toast.error(error.response?.data?.error || 'Error al consultar AFIP')
                  }
                } finally {
                  setValidating(false)
                }
              }}
              disabled={validating}
              title="Buscar datos en AFIP"
            >
              {validating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : validated ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                'Buscar AFIP'
              )}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="taxCondition" className="flex items-center gap-1">
          Condición IVA
          <span className="text-red-500 text-xs">*</span>
        </Label>
        <Select value={formData.taxCondition} onValueChange={(value) => {
          const newTaxCondition = value as "registered_taxpayer" | "monotax" | "exempt" | "final_consumer"
          if ((formData.taxCondition === 'final_consumer' && newTaxCondition !== 'final_consumer') ||
              (formData.taxCondition !== 'final_consumer' && newTaxCondition === 'final_consumer')) {
            setFormData({
              ...formData, 
              taxCondition: newTaxCondition, 
              documentNumber: '', 
              documentType: newTaxCondition === 'final_consumer' ? 'DNI' : 'CUIT',
              address: newTaxCondition === 'final_consumer' ? '' : formData.address
            })
          } else {
            setFormData({...formData, taxCondition: newTaxCondition})
          }
        }}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="registered_taxpayer">Responsable Inscripto</SelectItem>
            <SelectItem value="monotax">Monotributo</SelectItem>
            <SelectItem value="exempt">Exento</SelectItem>
            {type === "client" && <SelectItem value="final_consumer">Consumidor Final</SelectItem>}
          </SelectContent>
        </Select>
      </div>

      <div className="border-t pt-4 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="font-semibold text-sm text-muted-foreground">Identificación</h3>
          {formData.taxCondition !== 'final_consumer' && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
              Razón Social O Nombre y Apellido
            </span>
          )}
        </div>
        
        {formData.taxCondition !== 'final_consumer' && (
          <div className="space-y-2 mb-4">
            <Label htmlFor="businessName" className="flex items-center gap-1">
              Razón Social
              <span className="text-xs text-muted-foreground">(opcional si completas nombre y apellido)</span>
            </Label>
            <Input
              id="businessName"
              value={formData.businessName}
              onChange={(e) => setFormData({...formData, businessName: e.target.value.slice(0, 100)})}
              maxLength={100}
              placeholder="Ej: Empresa S.A."
              className={getFieldClassName('businessName', formData.businessName)}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="flex items-center gap-1">
              Nombre
              {formData.taxCondition === 'final_consumer' ? (
                <span className="text-red-500 text-xs">*</span>
              ) : (
                <span className="text-xs text-muted-foreground">(opcional si completas razón social)</span>
              )}
            </Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value.slice(0, 50)})}
              maxLength={50}
              placeholder="Ej: Juan"
              required={formData.taxCondition === 'final_consumer'}
              className={getFieldClassName('firstName', formData.firstName, formData.taxCondition === 'final_consumer')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="flex items-center gap-1">
              Apellido
              {formData.taxCondition === 'final_consumer' ? (
                <span className="text-red-500 text-xs">*</span>
              ) : (
                <span className="text-xs text-muted-foreground">(opcional si completas razón social)</span>
              )}
            </Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value.slice(0, 50)})}
              maxLength={50}
              placeholder="Ej: Pérez"
              required={formData.taxCondition === 'final_consumer'}
              className={getFieldClassName('lastName', formData.lastName, formData.taxCondition === 'final_consumer')}
            />
          </div>
        </div>
        
        {formData.taxCondition !== 'final_consumer' && !formData.businessName && !formData.firstName && !formData.lastName && (
          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
            <span className="w-1 h-1 bg-amber-600 rounded-full"></span>
            Completa la Razón Social o el Nombre y Apellido
          </p>
        )}
        
        {formData.taxCondition !== 'final_consumer' && (formData.businessName || (formData.firstName && formData.lastName)) && (
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <span className="w-1 h-1 bg-green-600 rounded-full"></span>
            Identificación completada
          </p>
        )}
      </div>

      {formData.taxCondition !== 'final_consumer' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-1">
              Domicilio Fiscal
              <span className="text-red-500 text-xs">*</span>
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value.slice(0, 200)})}
              maxLength={200}
              required
              placeholder="Calle y número"
              className={getFieldClassName('address', formData.address, true)}
            />
            <p className="text-xs text-muted-foreground">
              Requerido para registros contables. AFIP obtiene automáticamente el domicilio fiscal desde su padrón al emitir comprobantes.
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode" className="flex items-center gap-1">
                Código Postal
                <span className="text-xs text-muted-foreground">(opcional)</span>
              </Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => setFormData({...formData, postalCode: e.target.value.slice(0, 20)})}
                maxLength={20}
                placeholder="Ej: 1425"
                className={getFieldClassName('postalCode', formData.postalCode)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" className="flex items-center gap-1">
                Ciudad
                <span className="text-xs text-muted-foreground">(opcional)</span>
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value.slice(0, 100)})}
                maxLength={100}
                placeholder="Ej: Buenos Aires"
                className={getFieldClassName('city', formData.city)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="province" className="flex items-center gap-1">
                Provincia
                <span className="text-xs text-muted-foreground">(opcional)</span>
              </Label>
              <Input
                id="province"
                value={formData.province}
                onChange={(e) => setFormData({...formData, province: e.target.value.slice(0, 100)})}
                maxLength={100}
                placeholder="Ej: CABA"
                className={getFieldClassName('province', formData.province)}
              />
            </div>
          </div>
        </>
      )}

      <div className="border-t pt-4 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="font-semibold text-sm text-muted-foreground">Información de Contacto</h3>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            Al menos uno requerido
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-1">
              Email
              <span className="text-xs text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                const value = e.target.value.slice(0, 100)
                setFormData({...formData, email: value})
                validateField('email', value)
              }}
              maxLength={100}
              placeholder="ejemplo@correo.com"
              className={getFieldClassName('email', formData.email)}
            />
            {errors.email && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-1">
              Teléfono
              <span className="text-xs text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => {
                const formatted = formatPhone(e.target.value)
                setFormData({...formData, phone: formatted})
                validateField('phone', formatted)
              }}
              placeholder="11 1234-5678"
              className={getFieldClassName('phone', formData.phone)}
            />
            {errors.phone && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                {errors.phone}
              </p>
            )}
          </div>
        </div>
        
        {!formData.email && !formData.phone && (
          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
            <span className="w-1 h-1 bg-amber-600 rounded-full"></span>
            Debes completar al menos email o teléfono para poder contactar al {entityNameLower}
          </p>
        )}
        
        {(formData.email || formData.phone) && (
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <span className="w-1 h-1 bg-green-600 rounded-full"></span>
            Información de contacto completada
          </p>
        )}
      </div>

      {showBankFields && (
        <div className="border-t pt-4 mt-4">
          <h3 className="font-semibold mb-3 text-sm text-muted-foreground">Datos Bancarios (Opcional)</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankCbu">CBU</Label>
              <Input
                id="bankCbu"
                value={formData.bankCbu}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 22)
                  setFormData({...formData, bankCbu: value})
                }}
                placeholder="22 dígitos"
                maxLength={22}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankAlias">Alias</Label>
                <Input
                  id="bankAlias"
                  value={formData.bankAlias}
                  onChange={(e) => setFormData({...formData, bankAlias: e.target.value.slice(0, 50)})}
                  placeholder="ALIAS.BANCO.PROVEEDOR"
                  maxLength={50}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankName">Banco</Label>
                <Input
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) => setFormData({...formData, bankName: e.target.value.slice(0, 100)})}
                  placeholder="Nombre del banco"
                  maxLength={100}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankAccountType">Tipo de Cuenta</Label>
                <Select value={formData.bankAccountType} onValueChange={(value) => setFormData({...formData, bankAccountType: value as "CA" | "CC" | ""})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CA">Caja de Ahorro</SelectItem>
                    <SelectItem value="CC">Cuenta Corriente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankAccountNumber">Número de Cuenta</Label>
                <Input
                  id="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={(e) => setFormData({...formData, bankAccountNumber: e.target.value.slice(0, 50)})}
                  placeholder="Número de cuenta"
                  maxLength={50}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? (entity ? 'Actualizando...' : 'Creando...') : (entity ? "Actualizar" : "Crear")}
        </Button>
      </div>
    </form>
  )
}
