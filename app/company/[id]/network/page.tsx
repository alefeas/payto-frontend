"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Search, Plus, Users, Send, Check, X, Building2, Loader2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { networkService } from "@/services/network.service"
import type { CompanyConnection, ConnectionRequest, NetworkStats } from "@/types/network"
import { Skeleton } from "@/components/ui/skeleton"
import { parseDateLocal } from "@/lib/utils"
import { ResponsiveHeading, ResponsiveText } from "@/components/ui/responsive-heading"

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
    return (
      <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <BackButton href={`/company/${companyId}`} />
          <div className="flex-1">
            <ResponsiveHeading level="h1">Red Empresarial</ResponsiveHeading>
            <div className="flex items-center gap-3 mt-1">
              <ResponsiveText size="sm" className="text-muted-foreground">Gestiona las conexiones con otras empresas</ResponsiveText>
              {myCompanyId && (
                <>
                  <span className="text-sm text-muted-foreground">•</span>
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
          <Button onClick={() => setShowRequestModal(true)} className="bg-gradient-to-br from-[#002bff] via-[#0078ff] to-[#0000d4] hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            Conectar Empresa
          </Button>
        </div>

        <Tabs defaultValue="connections" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="connections" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Empresas Conectadas {!isLoading && `(${stats.totalConnections})`}
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Solicitudes Recibidas {!isLoading && `(${stats.pendingReceived})`}
              </TabsTrigger>
              <TabsTrigger value="sent" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Solicitudes Enviadas {!isLoading && `(${stats.pendingSent})`}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="connections" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Empresas Conectadas</CardTitle>
                    <CardDescription>Empresas con las que tienes relación comercial establecida</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre o ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
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
                <div className="space-y-4">
                  {filteredConnections.map((connection) => (
                    <Card key={connection.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Building2 className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{connection.connectedCompanyName}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-sm text-muted-foreground">ID de Conexión:</p>
                              <code className="px-2 py-0.5 bg-gray-100 rounded text-sm font-mono">{connection.connectedCompanyUniqueId}</code>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(connection.connectedCompanyUniqueId);
                                  toast.success('ID copiado al portapapeles');
                                }}
                              >
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Conectado el {parseDateLocal(connection.connectedAt)?.toLocaleDateString('es-AR')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-sm font-medium">{connection.totalInvoicesSent}</p>
                            <p className="text-xs text-muted-foreground">Enviadas</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium">{connection.totalInvoicesReceived}</p>
                            <p className="text-xs text-muted-foreground">Recibidas</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeleteConnection(connection)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
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
                <div className="space-y-4">
                  {requests.map((request) => (
                    <Card key={request.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Building2 className="h-6 w-6 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{request.fromCompanyName}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-sm text-muted-foreground">ID de Conexión:</p>
                              <code className="px-2 py-0.5 bg-gray-100 rounded text-sm font-mono">{request.fromCompanyUniqueId}</code>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(request.fromCompanyUniqueId);
                                  toast.success('ID copiado al portapapeles');
                                }}
                              >
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Solicitado el {parseDateLocal(request.requestedAt)?.toLocaleDateString('es-AR')}
                            </p>
                            {request.message && (
                              <p className="text-sm mt-2 p-2 bg-gray-50 rounded text-gray-700">
                                &ldquo;{request.message}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleAcceptRequest(request)}
                            disabled={acceptingId === request.id || rejectingId === request.id}
                          >
                            {acceptingId === request.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                Aceptando...
                              </>
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Aceptar
                              </>
                            )}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRejectRequest(request)}
                            disabled={acceptingId === request.id || rejectingId === request.id}
                          >
                            {rejectingId === request.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                Rechazando...
                              </>
                            ) : (
                              <>
                                <X className="h-4 w-4 mr-1" />
                                Rechazar
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>
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
                <div className="space-y-4">
                  {sentRequests.map((request) => (
                    <Card key={request.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Building2 className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{request.toCompanyName}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-sm text-muted-foreground">ID de Conexión:</p>
                              <code className="px-2 py-0.5 bg-gray-100 rounded text-sm font-mono">{request.fromCompanyUniqueId}</code>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(request.fromCompanyUniqueId);
                                  toast.success('ID copiado al portapapeles');
                                }}
                              >
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Enviado el {parseDateLocal(request.requestedAt)?.toLocaleDateString('es-AR')}
                            </p>
                            {request.message && (
                              <p className="text-sm mt-2 p-2 bg-gray-50 rounded text-gray-700 break-words">
                                &ldquo;{request.message}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          <Clock className="h-3 w-3 mr-1" />
                          Pendiente
                        </Badge>
                      </div>
                    </Card>
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
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <X className="h-5 w-5" />
                Eliminar Conexión
              </DialogTitle>
              <DialogDescription className="break-words pt-2">
                ¿Estás seguro de que deseas eliminar la conexión con{" "}
                <span className="font-semibold text-foreground">{connectionToDelete?.connectedCompanyName}</span>?
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-3 py-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-amber-800 mb-1">
                      La empresa se convertirá en Cliente/Proveedor externo
                    </h4>
                    <p className="text-sm text-amber-700">
                      Esta acción mantendrá el historial del Libro IVA, pero ya no podrás facturar directamente a esta empresa.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-blue-700">
                      Podrás editar los datos del cliente/proveedor y seguir viendo las facturas históricas.
                    </p>
                  </div>
                </div>
              </div>
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
              <DialogTitle className="break-words">Conectar con Nueva Empresa</DialogTitle>
              <DialogDescription className="break-words">
                Envía una solicitud de conexión a otra empresa para establecer una relación comercial
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyId">ID de la Empresa *</Label>
                <Input
                  id="companyId"
                  placeholder="TC8X9K2L"
                  value={newRequest.companyId}
                  onChange={(e) => setNewRequest({...newRequest, companyId: e.target.value})}
                  maxLength={10}
                  className="break-all"
                />
                <p className="text-xs text-muted-foreground break-words">
                  Ingresa el ID único de la empresa (ej: TC8X9K2L)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Mensaje (Opcional)</Label>
                <Textarea
                  id="message"
                  placeholder="Mensaje personalizado para la solicitud..."
                  value={newRequest.message}
                  onChange={(e) => setNewRequest({...newRequest, message: e.target.value})}
                  rows={3}
                  maxLength={500}
                  className="resize-none break-words"
                />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setShowRequestModal(false)} className="w-full sm:w-auto" disabled={isSending}>
                Cancelar
              </Button>
              <Button onClick={handleSendRequest} className="w-full sm:w-auto" disabled={isSending}>
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