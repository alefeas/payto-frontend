"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Search, Plus, Edit, Trash2, FileText, Mail, Phone, MapPin, Building2, User, AlertTriangle, Loader2, Archive, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { clientService, Client } from "@/services/client.service"
import { ClientForm } from "@/components/clients/ClientForm"
            
const condicionIvaLabels: Record<string, string> = {
  registered_taxpayer: "Responsable Inscripto",
  monotax: "Monotributo",
  exempt: "Exento",
  final_consumer: "Consumidor Final"
}

const condicionIvaColors: Record<string, string> = {
  registered_taxpayer: "bg-blue-100 text-blue-800",
  monotax: "bg-green-100 text-green-800",
  exempt: "bg-purple-100 text-purple-800",
  final_consumer: "bg-gray-100 text-gray-800"
}

export default function ClientsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCondicion, setFilterCondicion] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [archivedClients, setArchivedClients] = useState<Client[]>([])
  const [showArchived, setShowArchived] = useState(false)
  const [loadingArchived, setLoadingArchived] = useState(false)
  const [archivingId, setArchivingId] = useState<string | null>(null)
  const [restoringId, setRestoringId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    } else if (isAuthenticated) {
      loadClients()
    }
  }, [isAuthenticated, authLoading, router, companyId])

  const loadClients = async () => {
    try {
      setLoading(true)
      const data = await clientService.getClients(companyId)
      setClients(data)
      if (showArchived) {
        loadArchivedClients()
      }
    } catch (error: any) {
      console.error('Error loading clients:', error)
      toast.error(error.response?.data?.message || 'Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }

  const loadArchivedClients = async () => {
    try {
      setLoadingArchived(true)
      const data = await clientService.getArchivedClients(companyId)
      setArchivedClients(data)
    } catch (error: any) {
      console.error('Error loading archived clients:', error)
      toast.error(error.response?.data?.message || 'Error al cargar clientes archivados')
    } finally {
      setLoadingArchived(false)
    }
  }

  const handleRestore = async (clientId: string) => {
    try {
      setRestoringId(clientId)
      await clientService.restoreClient(companyId, clientId)
      toast.success('Cliente restaurado')
      loadArchivedClients()
      loadClients()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al restaurar cliente')
    } finally {
      setRestoringId(null)
    }
  }

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

  const filteredArchivedClients = archivedClients.filter(client => {
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-muted rounded animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-80 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
          <div className="h-32 bg-muted rounded animate-pulse"></div>
          <div className="h-96 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

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
          <div className="flex gap-2">
            <Button
              variant={showArchived ? "outline" : "default"}
              onClick={() => {
                setShowArchived(!showArchived)
                if (!showArchived && archivedClients.length === 0) {
                  loadArchivedClients()
                }
              }}
            >
              <Archive className="h-4 w-4 mr-2" />
              {showArchived ? "Ver Activos" : "Ver Archivados"}
            </Button>
            {!showArchived && (
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
              <ClientForm companyId={companyId} onClose={() => setIsCreateDialogOpen(false)} onSuccess={loadClients} />
            </DialogContent>
              </Dialog>
            )}
          </div>
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
                    <SelectItem value="registered_taxpayer">Responsable Inscripto</SelectItem>
                    <SelectItem value="monotax">Monotributo</SelectItem>
                    <SelectItem value="exempt">Exento</SelectItem>
                    <SelectItem value="final_consumer">Consumidor Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clients List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {showArchived ? `Clientes Archivados (${archivedClients.length})` : `Clientes (${filteredClients.length})`}
            </CardTitle>
            <CardDescription>
              {showArchived 
                ? "Clientes archivados que pueden ser restaurados. Necesarios para el Libro IVA histórico."
                : "Lista de clientes externos guardados para facturación rápida"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showArchived ? (
              filteredArchivedClients.length === 0 ? (
                <div className="text-center py-12">
                  <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay clientes archivados</h3>
                  <p className="text-muted-foreground">Los clientes archivados aparecerán aquí</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredArchivedClients.map((client) => (
                    <Card key={client.id} className="hover:shadow-md transition-shadow bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-base truncate">{getClientDisplayName(client)}</h3>
                              <Badge className={condicionIvaColors[client.taxCondition]}>
                                {condicionIvaLabels[client.taxCondition]}
                              </Badge>
                              <Badge variant="outline" className="text-orange-600 border-orange-600">
                                Archivado
                              </Badge>
                              {client.incompleteData && (
                                <Badge variant="outline" className="text-red-600 border-red-600">
                                  Datos Incompletos
                                </Badge>
                              )}
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

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedClient(client)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleRestore(client.id)}
                              disabled={client.incompleteData || restoringId === client.id}
                              title={client.incompleteData ? 'Debes completar los datos del cliente antes de restaurarlo' : 'Restaurar cliente'}
                            >
                              {restoringId === client.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <RotateCcw className="h-4 w-4 mr-2" />
                              )}
                              {restoringId === client.id ? 'Restaurando...' : 'Restaurar'}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={async () => {
                                if (confirm(`¿Eliminar permanentemente a ${getClientDisplayName(client)}? Esta acción NO se puede deshacer.`)) {
                                  try {
                                    await clientService.forceDeleteClient(companyId, client.id, true)
                                    toast.success('Cliente eliminado permanentemente')
                                    loadArchivedClients()
                                  } catch (error: any) {
                                    toast.error(error.response?.data?.message || 'Error al eliminar')
                                  }
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            ) : filteredClients.length === 0 ? (
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
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            onClick={() => {
                              setClientToDelete(client)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Archive className="h-4 w-4" />
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
              companyId={companyId}
              onClose={() => {
                setIsEditDialogOpen(false)
                setSelectedClient(null)
              }}
              onSuccess={loadClients}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Archivar Cliente
              </DialogTitle>
              <DialogDescription>
                ¿Estás seguro que deseas archivar a {clientToDelete && getClientDisplayName(clientToDelete)}?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                El cliente se ocultará de tu lista pero podrás restaurarlo desde "Ver Archivados". Los datos históricos del Libro IVA se mantendrán intactos.
              </p>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={archivingId !== null}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={async () => {
                  if (clientToDelete) {
                    try {
                      setArchivingId(clientToDelete.id)
                      await clientService.deleteClient(companyId, clientToDelete.id)
                      setClients(clients.filter(c => c.id !== clientToDelete.id))
                      toast.success('Cliente archivado')
                    } catch (error: any) {
                      toast.error(error.response?.data?.message || 'Error al archivar cliente')
                    } finally {
                      setArchivingId(null)
                      setIsDeleteDialogOpen(false)
                      setClientToDelete(null)
                    }
                  }
                }}
                disabled={archivingId !== null}
              >
                {archivingId ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Archivando...
                  </>
                ) : (
                  'Archivar'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}