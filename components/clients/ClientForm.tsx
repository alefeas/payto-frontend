"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { clientService, Client } from "@/services/client.service"
import { formatCUIT, formatPhone, getMaxLengthForDocumentType } from "@/lib/input-formatters"

interface ClientFormProps {
  client?: Client | null
  companyId: string
  onClose: () => void
  onSuccess: () => void
}

export function ClientForm({ client, companyId, onClose, onSuccess }: ClientFormProps) {
  const [formData, setFormData] = useState<{
    documentType: "CUIT" | "CUIL" | "DNI" | "Pasaporte" | "CDI"
    documentNumber: string
    businessName: string
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    taxCondition: "registered_taxpayer" | "monotax" | "exempt" | "final_consumer"
  }>({
    documentType: client?.documentType || "CUIT",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
        address: formData.address || undefined,
        tax_condition: formData.taxCondition
      }
      
      if (client) {
        await clientService.updateClient(companyId, client.id, data)
        toast.success('Cliente actualizado')
      } else {
        await clientService.createClient(companyId, data)
        toast.success('Cliente creado')
      }
      onSuccess()
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
          <Select value={formData.documentType} onValueChange={(value) => setFormData({...formData, documentType: value as "CUIT" | "CUIL" | "DNI" | "Pasaporte" | "CDI"})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CUIT">CUIT</SelectItem>
              <SelectItem value="CUIL">CUIL</SelectItem>
              <SelectItem value="DNI">DNI</SelectItem>
              <SelectItem value="Pasaporte">Pasaporte</SelectItem>
              <SelectItem value="CDI">CDI</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="documentNumber">Número de Documento *</Label>
          <Input
            id="documentNumber"
            value={formData.documentNumber}
            onChange={(e) => {
              const value = e.target.value
              const maxLength = getMaxLengthForDocumentType(formData.documentType)
              const numbers = value.replace(/\D/g, '').slice(0, maxLength)
              
              let formatted = numbers
              if (formData.documentType === 'CUIT' || formData.documentType === 'CUIL') {
                formatted = formatCUIT(numbers)
              }
              
              setFormData({...formData, documentNumber: formatted})
            }}
            placeholder={formData.documentType === 'CUIT' || formData.documentType === 'CUIL' ? '20-12345678-9' : '12345678'}
            required
          />
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
        <Label htmlFor="businessName">Razón Social (opcional para personas físicas)</Label>
        <Input
          id="businessName"
          value={formData.businessName}
          onChange={(e) => setFormData({...formData, businessName: e.target.value.slice(0, 100)})}
          maxLength={100}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nombre</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value.slice(0, 50)})}
            maxLength={50}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Apellido</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value.slice(0, 50)})}
            maxLength={50}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value.slice(0, 100)})}
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: formatPhone(e.target.value)})}
          placeholder="11 1234-5678"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Domicilio</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value.slice(0, 200)})}
          maxLength={200}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Guardando...' : (client ? "Actualizar" : "Crear")}
        </Button>
      </div>
    </form>
  )
}
