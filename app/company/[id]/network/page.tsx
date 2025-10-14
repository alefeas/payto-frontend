"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Search, Plus, Users, Send, Check, X, Building2, Loader2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
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

export default function NetworkPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [connections, setConnections] = useState<CompanyConnection[]>([])
  const [requests, setRequests] = useState<ConnectionRequest[]>([])
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([])
  const [stats, setStats] = useState<NetworkStats>({ totalConnections: 0, pendingReceived: 0, pendingSent: 0 })
  const [searchTerm, setSearchTerm] = useState("")
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [newRequest, setNewRequest] = useState({
    companyId: "",
    message: ""
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    } else if (isAuthenticated && companyId) {
      loadData()
    }
  }, [isAuthenticated, authLoading, router, companyId])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [connectionsData, requestsData, sentRequestsData, statsData] = await Promise.all([
        networkService.getConnections(companyId),
        networkService.getPendingRequests(companyId),
        networkService.getSentRequests(companyId),
        networkService.getStats(companyId)
      ])
      setConnections(connectionsData)
      setRequests(requestsData)
      setSentRequests(sentRequestsData)
      setStats(statsData)
    } catch (error) {
      toast.error('Error al cargar datos de red')
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
      toast.error(error.response?.data?.message || 'Error al enviar solicitud')
    } finally {
      setIsSending(false)
    }
  }

  const handleAcceptRequest = async (request: ConnectionRequest) => {
    try {
      await networkService.acceptRequest(companyId, request.id)
      toast.success('Solicitud aceptada', {
        description: `${request.fromCompanyName} ahora está en tu red empresarial`
      })
      loadData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al aceptar solicitud')
    }
  }

  const handleRejectRequest = async (request: ConnectionRequest) => {
    try {
      await networkService.rejectRequest(companyId, request.id)
      toast.success('Solicitud rechazada', {
        description: `Se rechazó la solicitud de ${request.fromCompanyName}`
      })
      loadData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al rechazar solicitud')
    }
  }

  const filteredConnections = connections.filter(conn =>
    conn.connectedCompanyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conn.connectedCompanyUniqueId.includes(searchTerm)
  )

  if (authLoading) return null
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/company/${companyId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Red Empresarial</h1>
            <p className="text-muted-foreground">Gestiona las conexiones con otras empresas</p>
          </div>
          <Button onClick={() => setShowRequestModal(true)}>
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
                            <p className="text-sm text-muted-foreground">ID: {connection.connectedCompanyUniqueId}</p>
                            <p className="text-xs text-muted-foreground">
                              Conectado el {new Date(connection.connectedAt!).toLocaleDateString()}
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
                          <div className="text-center">
                            <p className="text-sm font-medium text-green-600">
                              ${((connection.totalAmountSent || 0) + (connection.totalAmountReceived || 0)).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">Total</p>
                          </div>
                          <Badge variant="secondary">Conectado</Badge>
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
                            <p className="text-sm text-muted-foreground">ID: {request.fromCompanyUniqueId}</p>
                            <p className="text-xs text-muted-foreground">
                              Solicitado el {new Date(request.requestedAt).toLocaleDateString()}
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
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Aceptar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRejectRequest(request)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Rechazar
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
                            <p className="text-sm text-muted-foreground">ID: {request.fromCompanyUniqueId}</p>
                            <p className="text-xs text-muted-foreground">
                              Enviado el {new Date(request.requestedAt).toLocaleDateString()}
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