"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Building2, UserPlus, Plus, Loader2 } from "lucide-react"
import { ClientSelectorProps } from "@/types"
import { ClientForm } from "@/components/clients/ClientForm"

type ClientType = 'registered' | 'saved' | 'new'

export function ClientSelector({ connectedCompanies, savedClients = [], onSelect, companyId, isLoading }: ClientSelectorProps & { companyId: string; isLoading?: boolean }) {
  const [clientType, setClientType] = useState<ClientType>('registered')
  const [selectedCompany, setSelectedCompany] = useState('')
  const [selectedClient, setSelectedClient] = useState('')
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false)

  const handleCompanySelect = (companyId: string) => {
    setSelectedCompany(companyId)
    onSelect({ receiver_company_id: companyId })
  }

  const handleClientSelect = (clientId: string) => {
    setSelectedClient(clientId)
    const client = savedClients.find(c => c.id === clientId)
    onSelect({ 
      client_id: clientId,
      client_data: client ? {
        document_type: client.documentType,
        document_number: client.documentNumber,
        business_name: client.businessName || `${client.firstName} ${client.lastName}`,
        email: client.email,
        tax_condition: client.taxCondition
      } : undefined
    })
  }

  const handleNewClientSuccess = (createdClient?: any) => {
    setIsNewClientDialogOpen(false)
    if (createdClient) {
      // Auto-select the newly created client
      setClientType('saved')
      setSelectedClient(createdClient.id)
      onSelect({ 
        client_id: createdClient.id,
        client_data: {
          document_type: createdClient.documentType,
          document_number: createdClient.documentNumber,
          business_name: createdClient.businessName || `${createdClient.firstName} ${createdClient.lastName}`,
          email: createdClient.email,
          tax_condition: createdClient.taxCondition
        }
      })
      
      // Trigger parent reload if callback exists
      if (typeof (window as any).reloadClients === 'function') {
        (window as any).reloadClients()
      }
    }
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
              Facturación directa entre empresas conectadas. Notificaciones automáticas y confirmación de pago en tiempo real.
            </p>
          </div>
        </Label>
        
        <Label 
          htmlFor="saved" 
          className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
        >
          <RadioGroupItem value="saved" id="saved" />
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <div className="font-medium">
              Cliente externo guardado
            </div>
            <p className="text-xs text-muted-foreground">
              {savedClients.length > 0 
                ? `${savedClients.length} cliente${savedClients.length > 1 ? 's' : ''} guardado${savedClients.length > 1 ? 's' : ''}`
                : 'Aún no tienes clientes guardados'}
            </p>
          </div>
        </Label>
        
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
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Cargando empresas conectadas...</span>
            </div>
          ) : connectedCompanies.length === 0 ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900 font-medium">No tienes empresas conectadas</p>
              <p className="text-xs text-amber-700 mt-1">
                Invita a otras empresas a tu red PayTo para facturarles directamente
              </p>
            </div>
          ) : (
            <Select value={selectedCompany} onValueChange={handleCompanySelect}>
              <SelectTrigger>
                <SelectValue placeholder="Buscar empresa en tu red..." />
              </SelectTrigger>
              <SelectContent>
                {connectedCompanies.map(company => (
                  <SelectItem key={company.id} value={company.id}>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span className="font-medium">{company.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {company.taxCondition === 'registered_taxpayer' ? 'Responsable Inscripto' : 
                         company.taxCondition === 'monotax' ? 'Monotributo' : 
                         company.taxCondition === 'exempt' ? 'Exento' : 'Consumidor Final'}
                        {company.cuit && ` • CUIT: ${company.cuit}`}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {clientType === 'saved' && (
        <div className="space-y-2 p-4 border rounded-lg bg-accent/50">
          <Label>Seleccionar Cliente</Label>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Cargando clientes guardados...</span>
            </div>
          ) : savedClients.length === 0 ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900 font-medium">No tienes clientes guardados</p>
              <p className="text-xs text-amber-700 mt-1">
                Crea una factura con "Nuevo cliente externo" y marca la opción "Guardar cliente" para agregarlo aquí
              </p>
            </div>
          ) : (
            <Select value={selectedClient} onValueChange={handleClientSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Buscar cliente guardado..." />
              </SelectTrigger>
              <SelectContent>
                {savedClients.map(client => {
                  const displayName = client.businessName || `${client.firstName} ${client.lastName}` || client.documentNumber
                  const taxConditionLabel = {
                    'registered_taxpayer': 'RI',
                    'monotax': 'Monotributo',
                    'exempt': 'Exento',
                    'final_consumer': 'CF'
                  }[client.taxCondition] || client.taxCondition
                  
                  // Show DNI instead of CUIT for final consumers
                  const docTypeDisplay = client.taxCondition === 'final_consumer' && client.documentType === 'CUIT' 
                    ? 'DNI' 
                    : client.documentType
                  
                  return (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{displayName}</span>
                          <span className="text-xs text-muted-foreground">({docTypeDisplay} {client.documentNumber})</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{taxConditionLabel}</span>
                          {client.email && <span>• {client.email}</span>}
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

      {clientType === 'new' && (
        <div className="space-y-2 p-4 border rounded-lg bg-accent/50">
          <Label>Agregar Nuevo Cliente</Label>
          <Button 
            type="button"
            variant="outline" 
            className="w-full"
            onClick={() => setIsNewClientDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear Cliente Externo
          </Button>
          <p className="text-xs text-muted-foreground">
            El cliente se guardará automáticamente para futuras facturas
          </p>
        </div>
      )}

      <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Cliente</DialogTitle>
            <DialogDescription>
              Agrega un cliente externo para emitir facturas más rápido
            </DialogDescription>
          </DialogHeader>
          <ClientForm 
            companyId={companyId}
            onClose={() => setIsNewClientDialogOpen(false)}
            onSuccess={handleNewClientSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
