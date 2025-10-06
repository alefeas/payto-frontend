"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Building2, UserPlus } from "lucide-react"

type ClientType = 'registered' | 'saved' | 'new'

interface ClientSelectorProps {
  connectedCompanies: Array<{ id: string; name: string; uniqueId: string }>
  savedClients?: Array<{ id: string; razonSocial?: string; nombre?: string; apellido?: string; numeroDocumento: string; condicionIva: string }>
  onSelect: (data: {
    receiver_company_id?: string
    client_id?: string
    client_data?: any
    save_client?: boolean
  }) => void
}

export function ClientSelector({ connectedCompanies, savedClients = [], onSelect }: ClientSelectorProps) {
  const [clientType, setClientType] = useState<ClientType>('registered')
  const [saveClient, setSaveClient] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState('')
  const [selectedClient, setSelectedClient] = useState('')
  const [newClientData, setNewClientData] = useState({
    tipo_documento: 'CUIT',
    numero_documento: '',
    razon_social: '',
    email: '',
    condicion_iva: 'Consumidor_Final'
  })

  const handleCompanySelect = (companyId: string) => {
    setSelectedCompany(companyId)
    onSelect({ receiver_company_id: companyId })
  }

  const handleClientSelect = (clientId: string) => {
    setSelectedClient(clientId)
    onSelect({ client_id: clientId })
  }

  const handleClientDataChange = (field: string, value: string) => {
    const updated = { ...newClientData, [field]: value }
    setNewClientData(updated)
    onSelect({ 
      client_data: updated, 
      save_client: saveClient 
    })
  }

  const handleSaveClientChange = (checked: boolean) => {
    setSaveClient(checked)
    onSelect({ 
      client_data: newClientData, 
      save_client: checked 
    })
  }

  return (
    <div className="space-y-4">
      <RadioGroup value={clientType} onValueChange={(v) => setClientType(v as ClientType)}>
        <Label 
          htmlFor="registered" 
          className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
        >
          <RadioGroupItem value="registered" id="registered" />
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <div className="font-medium">
              Empresa en mi red PayTo
            </div>
            <p className="text-xs text-muted-foreground">
              Notificaciones automáticas y confirmación de pago
            </p>
          </div>
        </Label>
        
        {savedClients.length > 0 && (
          <Label 
            htmlFor="saved" 
            className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
          >
            <RadioGroupItem value="saved" id="saved" />
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="font-medium">
                Cliente guardado
              </div>
              <p className="text-xs text-muted-foreground">
                Seleccionar de tus clientes externos guardados
              </p>
            </div>
          </Label>
        )}
        
        <Label 
          htmlFor="new" 
          className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
        >
          <RadioGroupItem value="new" id="new" />
          <UserPlus className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <div className="font-medium">
              Nuevo cliente externo
            </div>
            <p className="text-xs text-muted-foreground">
              Consumidor final, monotributista o empresa sin registro
            </p>
          </div>
        </Label>
      </RadioGroup>

      {clientType === 'registered' && (
        <div className="space-y-2 p-4 border rounded-lg bg-accent/50">
          <Label>Seleccionar Empresa</Label>
          <Select value={selectedCompany} onValueChange={handleCompanySelect}>
            <SelectTrigger>
              <SelectValue placeholder="Buscar empresa en tu red..." />
            </SelectTrigger>
            <SelectContent>
              {connectedCompanies.map(company => (
                <SelectItem key={company.id} value={company.id}>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>{company.name}</span>
                    <span className="text-xs text-muted-foreground">({company.uniqueId})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {clientType === 'saved' && (
        <div className="space-y-2 p-4 border rounded-lg bg-accent/50">
          <Label>Seleccionar Cliente</Label>
          <Select value={selectedClient} onValueChange={handleClientSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Buscar cliente guardado..." />
            </SelectTrigger>
            <SelectContent>
              {savedClients.map(client => {
                const displayName = client.razonSocial || `${client.nombre} ${client.apellido}` || client.numeroDocumento
                return (
                  <SelectItem key={client.id} value={client.id}>
                    <div className="flex items-center gap-2">
                      <span>{displayName}</span>
                      <span className="text-xs text-muted-foreground">({client.numeroDocumento})</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      {clientType === 'new' && (
        <div className="space-y-4 p-4 border rounded-lg bg-accent/50">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo Documento *</Label>
              <Select 
                value={newClientData.tipo_documento}
                onValueChange={(v) => handleClientDataChange('tipo_documento', v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUIT">CUIT</SelectItem>
                  <SelectItem value="CUIL">CUIL</SelectItem>
                  <SelectItem value="DNI">DNI</SelectItem>
                  <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Número *</Label>
              <Input 
                placeholder="20-12345678-9"
                value={newClientData.numero_documento}
                onChange={(e) => handleClientDataChange('numero_documento', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nombre / Razón Social *</Label>
            <Input 
              placeholder="Juan Pérez o Empresa SA"
              value={newClientData.razon_social}
              onChange={(e) => handleClientDataChange('razon_social', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input 
              type="email"
              placeholder="cliente@email.com"
              value={newClientData.email}
              onChange={(e) => handleClientDataChange('email', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Condición IVA *</Label>
            <Select 
              value={newClientData.condicion_iva}
              onValueChange={(v) => handleClientDataChange('condicion_iva', v)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Consumidor_Final">Consumidor Final</SelectItem>
                <SelectItem value="RI">Responsable Inscripto</SelectItem>
                <SelectItem value="Monotributo">Monotributo</SelectItem>
                <SelectItem value="Exento">Exento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 pt-2 border-t">
            <Checkbox 
              id="save" 
              checked={saveClient}
              onCheckedChange={handleSaveClientChange}
            />
            <Label htmlFor="save" className="text-sm cursor-pointer">
              Guardar cliente para futuras facturas
            </Label>
          </div>
        </div>
      )}
    </div>
  )
}
