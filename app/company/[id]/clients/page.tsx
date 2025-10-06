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
    tipoDocumento: "CUIT",
    numeroDocumento: "20-12345678-9",
    razonSocial: "Distribuidora El Sol SRL",
    email: "contacto@elsol.com.ar",
    telefono: "+54 11 4567-8901",
    domicilio: "Av. Corrientes 1234, CABA",
    condicionIva: "RI",
    isCompanyConnection: false,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
  },
  {
    id: "2",
    companyId: "TC8X9K2L",
    tipoDocumento: "CUIT",
    numeroDocumento: "27-98765432-1",
    razonSocial: "Servicios Técnicos Martínez",
    email: "info@tecnicosmartinez.com",
    telefono: "+54 11 5678-9012",
    domicilio: "Calle Falsa 123, Buenos Aires",
    condicionIva: "Monotributo",
    isCompanyConnection: false,
    createdAt: "2024-02-10T14:30:00Z",
    updatedAt: "2024-02-10T14:30:00Z"
  },
  {
    id: "3",
    companyId: "TC8X9K2L",
    tipoDocumento: "DNI",
    numeroDocumento: "35.123.456",
    nombre: "Laura",
    apellido: "González",
    email: "laura.gonzalez@email.com",
    telefono: "+54 9 11 6789-0123",
    condicionIva: "CF",
    isCompanyConnection: false,
    createdAt: "2024-03-05T09:15:00Z",
    updatedAt: "2024-03-05T09:15:00Z"
  },
  {
    id: "4",
    companyId: "TC8X9K2L",
    tipoDocumento: "CUIT",
    numeroDocumento: "30-55667788-9",
    razonSocial: "Comercial Norte SA",
    email: "ventas@comercialnorte.com",
    telefono: "+54 11 7890-1234",
    domicilio: "Av. Santa Fe 5678, CABA",
    condicionIva: "RI",
    isCompanyConnection: false,
    createdAt: "2024-01-20T11:45:00Z",
    updatedAt: "2024-01-20T11:45:00Z"
  },
  {
    id: "5",
    companyId: "TC8X9K2L",
    tipoDocumento: "CUIL",
    numeroDocumento: "20-44556677-8",
    nombre: "Roberto",
    apellido: "Fernández",
    email: "roberto.f@email.com",
    telefono: "+54 9 11 8901-2345",
    condicionIva: "Monotributo",
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
      client.numeroDocumento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.razonSocial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${client.nombre} ${client.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterCondicion === "all" || client.condicionIva === filterCondicion

    return matchesSearch && matchesFilter
  })

  const getClientDisplayName = (client: Client) => {
    if (client.razonSocial) return client.razonSocial
    if (client.nombre && client.apellido) return `${client.nombre} ${client.apellido}`
    return client.numeroDocumento
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
                            <Badge className={condicionIvaColors[client.condicionIva]}>
                              {condicionIvaLabels[client.condicionIva]}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {client.tipoDocumento}: {client.numeroDocumento}
                            </span>
                            {client.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {client.email}
                              </span>
                            )}
                            {client.telefono && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {client.telefono}
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
    tipoDocumento: client?.tipoDocumento || "CUIT",
    numeroDocumento: client?.numeroDocumento || "",
    razonSocial: client?.razonSocial || "",
    nombre: client?.nombre || "",
    apellido: client?.apellido || "",
    email: client?.email || "",
    telefono: client?.telefono || "",
    domicilio: client?.domicilio || "",
    condicionIva: client?.condicionIva || "CF"
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
          <Label htmlFor="tipoDocumento">Tipo de Documento</Label>
          <Select value={formData.tipoDocumento} onValueChange={(value: any) => setFormData({...formData, tipoDocumento: value})}>
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
          <Label htmlFor="numeroDocumento">Número de Documento</Label>
          <Input
            id="numeroDocumento"
            value={formData.numeroDocumento}
            onChange={(e) => setFormData({...formData, numeroDocumento: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="condicionIva">Condición IVA</Label>
        <Select value={formData.condicionIva} onValueChange={(value: any) => setFormData({...formData, condicionIva: value})}>
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
        <Label htmlFor="razonSocial">Razón Social (opcional para personas físicas)</Label>
        <Input
          id="razonSocial"
          value={formData.razonSocial}
          onChange={(e) => setFormData({...formData, razonSocial: e.target.value})}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre</Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="apellido">Apellido</Label>
          <Input
            id="apellido"
            value={formData.apellido}
            onChange={(e) => setFormData({...formData, apellido: e.target.value})}
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
        <Label htmlFor="telefono">Teléfono</Label>
        <Input
          id="telefono"
          value={formData.telefono}
          onChange={(e) => setFormData({...formData, telefono: e.target.value})}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="domicilio">Domicilio</Label>
        <Input
          id="domicilio"
          value={formData.domicilio}
          onChange={(e) => setFormData({...formData, domicilio: e.target.value})}
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
