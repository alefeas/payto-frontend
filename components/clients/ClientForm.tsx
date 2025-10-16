"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { clientService, Client } from "@/services/client.service"
import { formatCUIT, formatPhone, getMaxLengthForDocumentType } from "@/lib/input-formatters"
import { afipVerificationService } from "@/services/afip-verification.service"
import { Loader2, CheckCircle2 } from "lucide-react"

interface ClientFormProps {
  client?: Client | null
  companyId: string
  onClose: () => void
  onSuccess: (createdClient?: Client) => void
}

export function ClientForm({ client, companyId, onClose, onSuccess }: ClientFormProps) {
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
  }>({
    documentType: (client?.documentType === "CUIT" || client?.documentType === "CUIL" ? client.documentType : "CUIT"),
    documentNumber: client?.documentNumber || "",
    businessName: client?.businessName || "",
    firstName: client?.firstName || "",
    lastName: client?.lastName || "",
    email: client?.email || "",
    phone: client?.phone || "",
    address: client?.address || "",
    taxCondition: client?.taxCondition || "final_consumer"
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
        tax_condition: formData.taxCondition
      }
      
      if (client) {
        await clientService.updateClient(companyId, client.id, data)
        toast.success('Cliente actualizado')
        onSuccess()
      } else {
        const createdClient = await clientService.createClient(companyId, data)
        toast.success('Cliente creado y seleccionado')
        onSuccess(createdClient)
      }
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar cliente')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? (client ? 'Actualizando...' : 'Creando...') : (client ? "Actualizar" : "Crear")}
        </Button>
      </div>
    </form>
  )
}
