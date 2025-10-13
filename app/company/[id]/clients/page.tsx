"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Search, Plus, Edit, Trash2, FileText, Mail, Phone, MapPin, Building2, User, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Client } from "@/types/client"

// Mock data
const mockClients: Client[] = [
  {
    id: "1",
    companyId: "TC8X9K2L",
    documentType: "CUIT",
    documentNumber: "20-12345678-9",
    businessName: "Distribuidora El Sol SRL",
    email: "contacto@elsol.com.ar",
    phone: "+54 11 4567-8901",
    address: "Av. Corrientes 1234, CABA",
    taxCondition: "RI",
    isCompanyConnection: false,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
  },
  {
    id: "2",
    companyId: "TC8X9K2L",
    documentType: "CUIT",
    documentNumber: "27-98765432-1",
    businessName: "Servicios Técnicos Martínez",
    email: "info@tecnicosmartinez.com",
    phone: "+54 11 5678-9012",
    address: "Calle Falsa 123, Buenos Aires",
    taxCondition: "Monotributo",
    isCompanyConnection: false,
    createdAt: "2024-02-10T14:30:00Z",
    updatedAt: "2024-02-10T14:30:00Z"
  },
  {
    id: "3",
    companyId: "TC8X9K2L",
    documentType: "DNI",
    documentNumber: "35.123.456",
    firstName: "Laura",
    lastName: "González",
    email: "laura.gonzalez@email.com",
    phone: "+54 9 11 6789-0123",
    taxCondition: "CF",
    isCompanyConnection: false,
    createdAt: "2024-03-05T09:15:00Z",
    updatedAt: "2024-03-05T09:15:00Z"
  },
  {
    id: "4",
    companyId: "TC8X9K2L",
    documentType: "CUIT",
    documentNumber: "30-55667788-9",
    businessName: "Comercial Norte SA",
    email: "ventas@comercialnorte.com",
    phone: "+54 11 7890-1234",
    address: "Av. Santa Fe 5678, CABA",
    taxCondition: "RI",
    isCompanyConnection: false,
    createdAt: "2024-01-20T11:45:00Z",
    updatedAt: "2024-01-20T11:45:00Z"
  },
  {
    id: "5",
    companyId: "TC8X9K2L",
    documentType: "CUIL",
    documentNumber: "20-44556677-8",
    firstName: "Roberto",
    lastName: "Fernández",
    email: "roberto.f@email.com",
    phone: "+54 9 11 8901-2345",
    taxCondition: "Monotributo",
    isCompanyConnection: false,
    createdAt: "2024-02-28T16:20:00Z",
    updatedAt: "2024-02-28T16:20:00Z"
  }
]

const condicionIvaLabels = {
  RI: "Responsable Inscripto",
  Monotributo: "Monotributo",
  Exento: "Exento",
  CF: "Consumidor Final",
  Consumidor_Final: "Consumidor Final"
}

const condicionIvaColors = {
  RI: "bg-blue-100 text-blue-800",
  Monotributo: "bg-green-100 text-green-800",
  Exento: "bg-purple-100 text-purple-800",
  CF: "bg-gray-100 text-gray-800",
  Consumidor_Final: "bg-gray-100 text-gray-800"
}

export default function ClientsPage() {
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [clients, setClients] = useState<Client[]>(mockClients)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCondicion, setFilterCondicion] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Filtrar clientes
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterCondicion === "all" || client.taxCondition === filterCondicion

    return matchesSearch && matchesFilter
  })

  const getClientDisplayName = (client: Client) => {
    if (client.businessName) return client.businessName
    if (client.firstName && client.lastName) return `${client.firstName} ${client.lastName}`
    return client.documentNumber
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push(`/company/${companyId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Mis Clientes</h1>
            <p className="text-muted-foreground">Gestiona tus clientes externos para facturación</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Cliente</DialogTitle>
                <DialogDescription>
                  Agrega un cliente externo para emitir facturas más rápido
                </DialogDescription>
              </DialogHeader>
              <ClientForm onClose={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="!p-2">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, documento o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Condición:</span>
                <Select value={filterCondicion} onValueChange={setFilterCondicion}>
                  <SelectTrigger className="w-[200px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="RI">Responsable Inscripto</SelectItem>
                    <SelectItem value="Monotributo">Monotributo</SelectItem>
                    <SelectItem value="Exento">Exento</SelectItem>
                    <SelectItem value="CF">Consumidor Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clients List */}
        <Card>
          <CardHeader>
            <CardTitle>Clientes ({filteredClients.length})</CardTitle>
            <CardDescription>
              Lista de clientes externos guardados para facturación rápida
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredClients.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay clientes</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterCondicion !== "all" 
                    ? "No se encontraron clientes con los filtros aplicados"
                    : "Comienza agregando tu primer cliente"}
                </p>
                {!searchTerm && filterCondicion === "all" && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Cliente
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredClients.map((client) => (
                  <Card key={client.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        {/* Client Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-base truncate">{getClientDisplayName(client)}</h3>
                            <Badge className={condicionIvaColors[client.taxCondition]}>
                              {condicionIvaLabels[client.taxCondition]}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {client.documentType}: {client.documentNumber}
                            </span>
                            {client.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {client.email}
                              </span>
                            )}
                            {client.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {client.phone}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => router.push(`/company/${companyId}/clients/${client.id}`)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Facturas
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => {
                              setSelectedClient(client)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setClientToDelete(client)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Cliente</DialogTitle>
              <DialogDescription>
                Actualiza la información del cliente
              </DialogDescription>
            </DialogHeader>
            <ClientForm 
              client={selectedClient} 
              onClose={() => {
                setIsEditDialogOpen(false)
                setSelectedClient(null)
              }} 
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Eliminar Cliente
              </DialogTitle>
              <DialogDescription>
                ¿Estás seguro que deseas eliminar a {clientToDelete && getClientDisplayName(clientToDelete)}?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Esta acción no se puede deshacer. El cliente será eliminado permanentemente de tu lista.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  if (clientToDelete) {
                    setClients(clients.filter(c => c.id !== clientToDelete.id))
                    setIsDeleteDialogOpen(false)
                    setClientToDelete(null)
                  }
                }}
              >
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

// Formulario de cliente
function ClientForm({ client, onClose }: { client?: Client | null, onClose: () => void }) {
  const [formData, setFormData] = useState({
    documentType: client?.documentType || "CUIT",
    documentNumber: client?.documentNumber || "",
    businessName: client?.businessName || "",
    firstName: client?.firstName || "",
    lastName: client?.lastName || "",
    email: client?.email || "",
    phone: client?.phone || "",
    address: client?.address || "",
    taxCondition: client?.taxCondition || "CF"
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implementar guardado
    console.log("Guardar cliente:", formData)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="documentType">Tipo de Documento</Label>
          <Select value={formData.documentType} onValueChange={(value: "CUIT" | "CUIL" | "DNI" | "Pasaporte" | "CDI") => setFormData({...formData, documentType: value})}>
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
          <Label htmlFor="documentNumber">Número de Documento</Label>
          <Input
            id="documentNumber"
            value={formData.documentNumber}
            onChange={(e) => setFormData({...formData, documentNumber: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="taxCondition">Condición IVA</Label>
        <Select value={formData.taxCondition} onValueChange={(value: "RI" | "Monotributo" | "Exento" | "CF") => setFormData({...formData, taxCondition: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="RI">Responsable Inscripto</SelectItem>
            <SelectItem value="Monotributo">Monotributo</SelectItem>
            <SelectItem value="Exento">Exento</SelectItem>
            <SelectItem value="CF">Consumidor Final</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessName">Razón Social (opcional para personas físicas)</Label>
        <Input
          id="businessName"
          value={formData.businessName}
          onChange={(e) => setFormData({...formData, businessName: e.target.value})}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nombre</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Apellido</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Domicilio</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">
          {client ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  )
}
