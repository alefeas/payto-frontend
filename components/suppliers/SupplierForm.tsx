"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { supplierService, Supplier } from "@/services/supplier.service"
import { formatCUIT, formatPhone, getMaxLengthForDocumentType } from "@/lib/input-formatters"
import { afipVerificationService } from "@/services/afip-verification.service"
import { Loader2, CheckCircle2 } from "lucide-react"

interface SupplierFormProps {
  supplier?: Supplier | null
  companyId: string
  onClose: () => void
  onSuccess: () => void
}

export function SupplierForm({ supplier, companyId, onClose, onSuccess }: SupplierFormProps) {
  const [formData, setFormData] = useState<{
    documentType: "CUIT" | "CUIL"
    documentNumber: string
    businessName: string
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    taxCondition: "registered_taxpayer" | "monotax" | "exempt" | "final_consumer"
    bankName: string
    bankAccountType: "CA" | "CC" | ""
    bankAccountNumber: string
    bankCbu: string
    bankAlias: string
  }>({
    documentType: supplier?.documentType || "CUIT",
    documentNumber: supplier?.documentNumber || "",
    businessName: supplier?.businessName || "",
    firstName: supplier?.firstName || "",
    lastName: supplier?.lastName || "",
    email: supplier?.email || "",
    phone: supplier?.phone || "",
    address: supplier?.address || "",
    taxCondition: supplier?.taxCondition || "final_consumer",
    bankName: supplier?.bankName || "",
    bankAccountType: supplier?.bankAccountType || "",
    bankAccountNumber: supplier?.bankAccountNumber || "",
    bankCbu: supplier?.bankCbu || "",
    bankAlias: supplier?.bankAlias || ""
  })
  const [saving, setSaving] = useState(false)
  const [validating, setValidating] = useState(false)
  const [validated, setValidated] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar que tenga razón social O nombre+apellido
    if (!formData.businessName && (!formData.firstName || !formData.lastName)) {
      toast.error('Debes completar Razón Social o Nombre y Apellido')
      return
    }
    
    if (!formData.address) {
      toast.error('El domicilio fiscal es obligatorio')
      return
    }
    
    try {
      setSaving(true)
      const data = {
        document_type: formData.documentType,
        document_number: formData.documentNumber,
        business_name: formData.businessName || undefined,
        first_name: formData.firstName || undefined,
        last_name: formData.lastName || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address,
        tax_condition: formData.taxCondition,
        bank_name: formData.bankName || undefined,
        bank_account_type: formData.bankAccountType || undefined,
        bank_account_number: formData.bankAccountNumber || undefined,
        bank_cbu: formData.bankCbu || undefined,
        bank_alias: formData.bankAlias || undefined
      }
      
      if (supplier) {
        await supplierService.updateSupplier(companyId, supplier.id, data)
        toast.success('Proveedor actualizado')
      } else {
        await supplierService.createSupplier(companyId, data)
        toast.success('Proveedor creado')
      }
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar proveedor')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="documentType">Tipo de Documento *</Label>
          <Select value={formData.documentType} onValueChange={(value) => setFormData({...formData, documentType: value as "CUIT" | "CUIL"})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CUIT">CUIT</SelectItem>
              <SelectItem value="CUIL">CUIL</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="documentNumber">Número de Documento *</Label>
          <div className="flex gap-2">
            <Input
              id="documentNumber"
              value={formData.documentNumber}
              onChange={(e) => {
                const value = e.target.value
                const numbers = value.replace(/\D/g, '').slice(0, 11)
                const formatted = formatCUIT(numbers)
                setFormData({...formData, documentNumber: formatted})
                setValidated(false)
              }}
              placeholder="20-12345678-9"
              required
            />
            {(
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  if (formData.documentNumber.replace(/\D/g, '').length !== 11) {
                    toast.error('Ingresa un CUIT/CUIL válido')
                    return
                  }
                  try {
                    setValidating(true)
                    const result = await afipVerificationService.validateCuit(formData.documentNumber, companyId)
                    if (result.valid && result.data) {
                      setFormData({
                        ...formData,
                        businessName: result.data.businessName || formData.businessName,
                        taxCondition: (result.data.taxCondition as "registered_taxpayer" | "monotax" | "exempt" | "final_consumer") || formData.taxCondition,
                        address: result.data.fiscalAddress || formData.address
                      })
                      setValidated(true)
                      toast.success('Datos obtenidos de AFIP')
                    } else if (result.requires_verification) {
                      toast.error(result.message || 'Debes verificar tu perfil fiscal primero', { duration: 6000 })
                    } else {
                      toast.error(result.message || 'No se encontraron datos en AFIP')
                    }
                  } catch (error: any) {
                    if (error.response?.status === 403) {
                      toast.error(error.response?.data?.message || 'Debes verificar tu perfil fiscal primero', { duration: 6000 })
                    } else {
                      toast.error(error.response?.data?.message || 'Error al validar con AFIP')
                    }
                  } finally {
                    setValidating(false)
                  }
                }}
                disabled={validating}
              >
                {validating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : validated ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  'Validar AFIP'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="taxCondition">Condición IVA *</Label>
        <Select value={formData.taxCondition} onValueChange={(value) => setFormData({...formData, taxCondition: value as "registered_taxpayer" | "monotax" | "exempt" | "final_consumer"})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="registered_taxpayer">Responsable Inscripto</SelectItem>
            <SelectItem value="monotax">Monotributo</SelectItem>
            <SelectItem value="exempt">Exento</SelectItem>
            <SelectItem value="final_consumer">Consumidor Final</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessName">Razón Social * (o Nombre y Apellido)</Label>
        <Input
          id="businessName"
          value={formData.businessName}
          onChange={(e) => setFormData({...formData, businessName: e.target.value.slice(0, 100)})}
          maxLength={100}
          placeholder="Requerido para empresas"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nombre * (si no tiene Razón Social)</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value.slice(0, 50)})}
            maxLength={50}
            placeholder="Requerido para personas"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Apellido * (si no tiene Razón Social)</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value.slice(0, 50)})}
            maxLength={50}
            placeholder="Requerido para personas"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Domicilio Fiscal *</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value.slice(0, 200)})}
          maxLength={200}
          required
          placeholder="Requerido por AFIP"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value.slice(0, 100)})}
          maxLength={100}
          placeholder="Opcional"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: formatPhone(e.target.value)})}
          placeholder="Opcional - 11 1234-5678"
        />
      </div>

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

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Guardando...' : (supplier ? "Actualizar" : "Crear")}
        </Button>
      </div>
    </form>
  )
}
