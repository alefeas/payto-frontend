"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Search, Plus, Users, Send, X, Loader2, Clock, AlertTriangle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { networkService } from "@/services/network.service"
import type { CompanyConnection, ConnectionRequest, NetworkStats } from "@/types/network"
import { ResponsiveHeading, ResponsiveText } from "@/components/ui/responsive-heading"
import { NetworkSkeleton } from "@/components/network/NetworkSkeleton"
import { ConnectionCard } from "@/components/network/ConnectionCard"
import { ReceivedRequestCard } from "@/components/network/ReceivedRequestCard"
import { SentRequestCard } from "@/components/network/SentRequestCard"
import { InfoMessage } from "@/components/ui/info-message"

export default function NetworkPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [connections, setConnections] = useState<CompanyConnection[]>([])
  const [requests, setRequests] = useState<ConnectionRequest[]>([])
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([])
  const [stats, setStats] = useState<NetworkStats>({ totalConnections: 0, pendingReceived: 0, pendingSent: 0 })
  const [myCompanyId, setMyCompanyId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState("")
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [connectionToDelete, setConnectionToDelete] = useState<CompanyConnection | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [newRequest, setNewRequest] = useState({
    companyId: "",
    message: ""
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/log-in')
    } else if (isAuthenticated && companyId) {
      loadData()
    }
  }, [isAuthenticated, authLoading, router, companyId])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // Cargar ID de mi empresa
      try {
        const { companyService } = await import('@/services/company.service')
        const company = await companyService.getCompanyById(companyId)
        setMyCompanyId(company.uniqueId || '')
      } catch (error) {
        console.error('Error al cargar ID de empresa:', error)
      }
      
      // Cargar datos de forma independiente para que un error no afecte a los demás
      const [connectionsResult, requestsResult, sentRequestsResult, statsResult] = await Promise.allSettled([
        networkService.getConnections(companyId),
        networkService.getPendingRequests(companyId),
        networkService.getSentRequests(companyId),
        networkService.getStats(companyId)
      ])
      
      // Procesar resultados
      if (connectionsResult.status === 'fulfilled') {
        setConnections(connectionsResult.value)
      } else {
        console.error('Error al cargar conexiones:', connectionsResult.reason)
        toast.error('Error al cargar empresas conectadas')
      }
      
      if (requestsResult.status === 'fulfilled') {
        setRequests(requestsResult.value)
      } else {
        console.error('Error al cargar solicitudes recibidas:', requestsResult.reason)
      }
      
      if (sentRequestsResult.status === 'fulfilled') {
        setSentRequests(sentRequestsResult.value)
      } else {
        console.error('Error al cargar solicitudes enviadas:', sentRequestsResult.reason)
        setSentRequests([]) // Asegurar que sea un array vacío
        // No mostrar toast para este error, es opcional
      }
      
      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value)
      } else {
        console.error('Error al cargar estadísticas:', statsResult.reason)
        // Mantener stats por defecto si falla
      }
      
    } catch (error) {
      console.error('Error inesperado al cargar datos de red:', error)
      toast.error('Error inesperado al cargar datos de red')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendRequest = async () => {
    if (!newRequest.companyId.trim()) {
      toast.error('Ingrese el ID de la empresa')
      return
    }

    try {
      setIsSending(true)
      await networkService.sendConnectionRequest(companyId, {
        company_unique_id: newRequest.companyId,
        message: newRequest.message || undefined
      })
      
      toast.success('Solicitud enviada exitosamente', {
        description: `Se envió la solicitud a la empresa con ID ${newRequest.companyId}`
      })
      
      setShowRequestModal(false)
      setNewRequest({ companyId: "", message: "" })
      loadData()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Error al enviar solicitud'
      toast.error(errorMessage)
    } finally {
      setIsSending(false)
    }
  }

  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  const handleAcceptRequest = async (request: ConnectionRequest) => {
    try {
      setAcceptingId(request.id)
      await networkService.acceptRequest(companyId, request.id)
      toast.success('Solicitud aceptada', {
        description: `${request.fromCompanyName} ahora está en tu red empresarial`
      })
      loadData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al aceptar solicitud')
    } finally {
      setAcceptingId(null)
    }
  }

  const handleRejectRequest = async (request: ConnectionRequest) => {
    try {
      setRejectingId(request.id)
      await networkService.rejectRequest(companyId, request.id)
      toast.success('Solicitud rechazada', {
        description: `Se rechazó la solicitud de ${request.fromCompanyName}`
      })
      loadData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al rechazar solicitud')
    } finally {
      setRejectingId(null)
    }
  }

  const handleDeleteConnection = async (connection: CompanyConnection) => {
    setConnectionToDelete(connection)
    setShowDeleteModal(true)
  }

  const confirmDeleteConnection = async () => {
    if (!connectionToDelete) return
    
    try {
      setIsDeleting(true)
      const response = await networkService.deleteConnection(companyId, connectionToDelete.id)
      toast.success('Conexión eliminada', {
        description: response.data?.message || 'La empresa fue convertida en cliente/proveedor externo'
      })
      setShowDeleteModal(false)
      setConnectionToDelete(null)
      loadData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar conexión')
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredConnections = connections.filter(conn =>
    conn.connectedCompanyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conn.connectedCompanyUniqueId.includes(searchTerm)
  )

  if (authLoading || isLoading) {
    return <NetworkSkeleton />
  }
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BackButton href={`/company/${companyId}`} />
            <div className="flex-1 min-w-0">
              <ResponsiveHeading level="h1">Red Empresarial</ResponsiveHeading>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-1">
                <ResponsiveText size="sm" className="text-muted-foreground">Gestiona las conexiones con otras empresas</ResponsiveText>
                {myCompanyId && (
                  <>
                    <span className="hidden sm:inline text-sm text-muted-foreground">•</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Tu ID:</span>
                      <code className="px-2 py-0.5 bg-gray-100 rounded text-sm font-mono font-bold">{myCompanyId}</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          navigator.clipboard.writeText(myCompanyId);
                          toast.success('ID copiado al portapapeles');
                        }}
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <Button onClick={() => setShowRequestModal(true)} className="bg-gradient-to-br from-[#002bff] via-[#0078ff] to-[#0000d4] hover:opacity-90 w-full sm:w-64 lg:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Conectar Empresa
          </Button>
        </div>

        <Tabs defaultValue="connections" className="space-y-6">
          <TabsList className="w-full sm:w-auto flex gap-2">
            <TabsTrigger value="connections" className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-initial [&[data-state=active]>span]:text-white">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span className="hidden lg:inline">Empresas Conectadas</span>
              <span className="lg:hidden">Conectadas</span>
              {!isLoading && <span className="font-medium-heading text-gray-700">({stats.totalConnections})</span>}
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-initial [&[data-state=active]>span]:text-white">
              <Send className="h-4 w-4 flex-shrink-0" />
              <span className="hidden lg:inline">Solicitudes Recibidas</span>
              <span className="lg:hidden">Recibidas</span>
              {!isLoading && <span className="font-medium-heading text-gray-700">({stats.pendingReceived})</span>}
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-initial [&[data-state=active]>span]:text-white">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span className="hidden lg:inline">Solicitudes Enviadas</span>
              <span className="lg:hidden">Enviadas</span>
              {!isLoading && <span className="font-medium-heading text-gray-700">({stats.pendingSent})</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connections" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Empresas Conectadas</CardTitle>
                    <CardDescription>Empresas con las que tienes relación comercial establecida</CardDescription>
                  </div>
                  <div className="relative w-full lg:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre o ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                <div className="space-y-3">
                  {filteredConnections.map((connection) => (
                    <ConnectionCard 
                      key={connection.id}
                      connection={connection}
                      onDelete={handleDeleteConnection}
                    />
                  ))}
                  
                  {filteredConnections.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No se encontraron empresas conectadas</p>
                    </div>
                  )}
                </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Solicitudes Recibidas</CardTitle>
                <CardDescription>Solicitudes pendientes de otras empresas</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                <div className="space-y-3">
                  {requests.map((request) => (
                    <ReceivedRequestCard
                      key={request.id}
                      request={request}
                      onAccept={handleAcceptRequest}
                      onReject={handleRejectRequest}
                      isAccepting={acceptingId === request.id}
                      isRejecting={rejectingId === request.id}
                    />
                  ))}
                  
                  {requests.length === 0 && (
                    <div className="text-center py-8">
                      <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No hay solicitudes recibidas</p>
                    </div>
                  )}
                </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sent" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Solicitudes Enviadas</CardTitle>
                <CardDescription>Solicitudes que has enviado a otras empresas</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                <div className="space-y-3">
                  {sentRequests.map((request) => (
                    <SentRequestCard
                      key={request.id}
                      request={request}
                    />
                  ))}
                  
                  {sentRequests.length === 0 && (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No has enviado solicitudes</p>
                    </div>
                  )}
                </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Connection Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Eliminar Conexión</DialogTitle>
              <DialogDescription className="break-words pt-2">
                ¿Estás seguro de que deseas eliminar la conexión con{" "}
                <span className="font-semibold text-foreground">{connectionToDelete?.connectedCompanyName}</span>?
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-3 py-4">
              <InfoMessage
                icon={AlertTriangle}
                variant="warning"
                title="La empresa se convertirá en Cliente/Proveedor externo"
                description="Esta acción mantendrá el historial del Libro IVA, pero ya no podrás facturar directamente a esta empresa."
              />
              
              <InfoMessage
                icon={Info}
                variant="info"
                title="Información adicional"
                description="Podrás editar los datos del cliente/proveedor y seguir viendo las facturas históricas."
              />
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDeleteModal(false)
                  setConnectionToDelete(null)
                }} 
                className="w-full sm:w-auto" 
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive"
                onClick={confirmDeleteConnection} 
                className="w-full sm:w-auto" 
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Eliminar Conexión
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Send Request Modal */}
        <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Conectar con Nueva Empresa</DialogTitle>
              <DialogDescription className="text-sm">
                Envía una solicitud de conexión a otra empresa para establecer una relación comercial
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="companyId" className="text-sm">ID de la Empresa *</Label>
                <Input
                  id="companyId"
                  placeholder="TC8X9K2L"
                  value={newRequest.companyId}
                  onChange={(e) => setNewRequest({...newRequest, companyId: e.target.value})}
                  maxLength={10}
                />
                <p className="text-xs text-muted-foreground">
                  Ingresa el ID único de la empresa (ej: TC8X9K2L)
                </p>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-sm">Mensaje (Opcional)</Label>
                <Textarea
                  id="message"
                  placeholder="Mensaje personalizado para la solicitud..."
                  value={newRequest.message}
                  onChange={(e) => setNewRequest({...newRequest, message: e.target.value})}
                  rows={3}
                  maxLength={500}
                  className="resize-none"
                />
              </div>
            </div>
            
            <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowRequestModal(false)} 
                className="w-full sm:w-auto" 
                disabled={isSending}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSendRequest} 
                className="w-full sm:w-auto bg-gradient-to-br from-[#002bff] via-[#0078ff] to-[#0000d4] hover:opacity-90" 
                disabled={isSending}
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Solicitud'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}