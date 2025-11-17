"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Search, Plus, Edit, FileText, Mail, Phone, User, AlertTriangle, Loader2, Archive, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { clientService, Client } from "@/services/client.service"
import { companyService } from "@/services/company.service"
import { hasPermission } from "@/lib/permissions"
import { CompanyRole } from "@/types"
import { ClientForm } from "@/components/clients/ClientForm"
import { useAfipCertificate } from "@/hooks/use-afip-certificate"
import { AfipCertificateBanner } from "@/components/afip/afip-certificate-banner"
import { PageHeader } from "@/components/layouts/PageHeader"
import { EntitiesSkeleton } from "@/components/entities/EntitiesSkeleton"
            
const condicionIvaLabels: Record<string, string> = {
  registered_taxpayer: "Responsable Inscripto",
  monotax: "Monotributo",
  exempt: "Exento",
  final_consumer: "Consumidor Final"
}

const condicionIvaColors: Record<string, string> = {
  registered_taxpayer: "bg-slate-100 text-slate-700 border-slate-200",
  monotax: "bg-slate-100 text-slate-700 border-slate-200",
  exempt: "bg-slate-100 text-slate-700 border-slate-200",
  final_consumer: "bg-slate-100 text-slate-700 border-slate-200"
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

  // AFIP Certificate validation
  const { isVerified: isAfipVerified } = useAfipCertificate(companyId)
  const [loadingArchived, setLoadingArchived] = useState(false)
  const [archivingId, setArchivingId] = useState<string | null>(null)
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [company, setCompany] = useState<any>(null)

  // Cargar datos de la empresa
  const loadCompany = async () => {
    try {
      const companyData = await companyService.getCompanyById(companyId)
      setCompany(companyData)
    } catch (error) {
      console.error('Error loading company:', error)
      toast.error('Error al cargar datos de la empresa')
    }
  }

  useEffect(() => {
    if (companyId) {
      loadCompany()
    }
  }, [companyId])

  // Obtener permisos del usuario
  const userRole = company?.role as CompanyRole
  const canCreate = company && hasPermission(userRole, 'contacts.create')
  const canUpdate = company && hasPermission(userRole, 'contacts.update')
  const canDelete = company && hasPermission(userRole, 'contacts.delete')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/log-in')
    } else if (isAuthenticated) {
      loadClients()
      loadArchivedClients()
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
    return <EntitiesSkeleton />
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header with Action Buttons */}
        <div className="header-responsive">
          <PageHeader 
            title="Mis Clientes"
            description="Gestiona tus clientes externos"
            backHref={`/company/${companyId}`}
          />
          
          <div className="buttons-responsive">
            <Button
              variant="outline"
              onClick={() => setShowArchived(!showArchived)}
              className="w-full sm:w-auto"
            >
              <Archive className="h-4 w-4 mr-2" />
              {showArchived ? "Ver Activos" : "Ver Archivados"}
            </Button>
            {!showArchived && canCreate && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
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

        {/* Mensaje de certificado AFIP requerido */}
        {!isAfipVerified && (
          <AfipCertificateBanner 
            companyId={companyId}
            message="No puedes buscar datos fiscales automáticamente en el padrón AFIP sin un certificado activo. Configura tu certificado para autocompletar datos de clientes."
          />
        )}

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, documento o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap hidden sm:inline">Condición:</span>
            <Select value={filterCondicion} onValueChange={setFilterCondicion}>
              <SelectTrigger className="w-full sm:w-[200px] h-12">
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

        {/* Clients List */}
        <div>
          <div className="mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">
              {showArchived ? `Clientes Archivados (${archivedClients.length})` : `Clientes (${filteredClients.length})`}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {showArchived 
                ? "Clientes archivados que pueden ser restaurados. Necesarios para el Libro IVA histórico."
                : "Lista de clientes externos guardados para facturación rápida"}
            </p>
          </div>
          <div>
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
                    <Card key={client.id} className="p-3 sm:p-4 hover:shadow-md transition-shadow bg-muted/30">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0 w-full sm:w-auto">
                            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 flex-wrap">
                              <h3 className="font-semibold text-sm sm:text-base truncate">{getClientDisplayName(client)}</h3>
                              <Badge variant="outline" className={`${condicionIvaColors[client.taxCondition]} text-[10px] sm:text-xs`}>
                                {condicionIvaLabels[client.taxCondition]}
                              </Badge>
                              <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 text-[10px] sm:text-xs">
                                Archivado
                              </Badge>
                              {client.incompleteData && (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] sm:text-xs">
                                  Datos Incompletos
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{client.documentType}: {client.documentNumber}</span>
                              </span>
                              {client.email && (
                                <span className="flex items-center gap-1 min-w-0">
                                  <Mail className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{client.email}</span>
                                </span>
                              )}
                              {client.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3 flex-shrink-0" />
                                  {client.phone}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedClient(client)
                                setIsEditDialogOpen(true)
                              }}
                              className="w-full sm:w-auto"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRestore(client.id)}
                              disabled={client.incompleteData || restoringId === client.id}
                              title={client.incompleteData ? 'Debes completar los datos del cliente antes de restaurarlo' : 'Restaurar cliente'}
                              className="w-full sm:w-auto"
                            >
                              {restoringId === client.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <RotateCcw className="h-4 w-4 mr-2" />
                              )}
                              {restoringId === client.id ? 'Restaurando...' : 'Restaurar'}
                            </Button>
                          </div>
                        </div>
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
                  <Card key={client.id} className="p-3 sm:p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                        {/* Client Info */}
                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 flex-wrap">
                            <h3 className="font-semibold text-sm sm:text-base truncate">{getClientDisplayName(client)}</h3>
                            <Badge variant="outline" className={`${condicionIvaColors[client.taxCondition]} text-[10px] sm:text-xs`}>
                              {condicionIvaLabels[client.taxCondition]}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{client.documentType}: {client.documentNumber}</span>
                            </span>
                            {client.email && (
                              <span className="flex items-center gap-1 min-w-0">
                                <Mail className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{client.email}</span>
                              </span>
                            )}
                            {client.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3 flex-shrink-0" />
                                {client.phone}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          {canUpdate && (
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => {
                                setSelectedClient(client)
                                setIsEditDialogOpen(true)
                              }}
                              className="flex-shrink-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="outline"
                              size="icon"
                              className="flex-shrink-0"
                              onClick={() => {
                                setClientToDelete(client)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

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
              onSuccess={() => {
                loadClients()
                loadArchivedClients()
              }}
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
                      toast.success('Cliente archivado')
                      // Recargar ambas listas para reflejar el cambio
                      await Promise.all([
                        loadClients(),
                        loadArchivedClients()
                      ])
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