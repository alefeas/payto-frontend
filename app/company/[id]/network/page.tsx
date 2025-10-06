"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Search, Plus, Users, Send, Check, X, Building2 } from "lucide-react"
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
import type { CompanyConnection, ConnectionRequest, NetworkStats } from "@/types/network"

const mockConnections: CompanyConnection[] = [
  {
    id: "1",
    companyId: "TC8X9K2L",
    connectedCompanyId: "SU4P7M9N",
    connectedCompanyName: "StartupXYZ",
    connectedCompanyUniqueId: "SU4P7M9N",
    status: "connected",
    requestedAt: "2024-01-15T10:00:00Z",
    connectedAt: "2024-01-15T14:30:00Z",
    requestedBy: "admin@techcorp.com",
    totalInvoicesSent: 12,
    totalInvoicesReceived: 8,
    totalAmountSent: 45000,
    totalAmountReceived: 32000,
    lastTransactionDate: "2024-01-20T09:15:00Z"
  },
  {
    id: "2",
    companyId: "TC8X9K2L",
    connectedCompanyId: "CL1Q3R8T",
    connectedCompanyName: "Consulting LLC",
    connectedCompanyUniqueId: "CL1Q3R8T",
    status: "connected",
    requestedAt: "2024-01-10T08:00:00Z",
    connectedAt: "2024-01-10T16:45:00Z",
    requestedBy: "admin@techcorp.com",
    totalInvoicesSent: 5,
    totalInvoicesReceived: 15,
    totalAmountSent: 18000,
    totalAmountReceived: 67000,
    lastTransactionDate: "2024-01-18T11:30:00Z"
  }
]

const mockRequests: ConnectionRequest[] = [
  {
    id: "1",
    fromCompanyId: "AB1C2D3E",
    fromCompanyName: "Servicios Digitales SA",
    fromCompanyUniqueId: "AB1C2D3E",
    toCompanyId: "TC8X9K2L",
    toCompanyName: "TechCorp",
    message: "Nos gustaría establecer una relación comercial para intercambio de servicios tecnológicos.",
    requestedAt: "2024-01-22T14:20:00Z",
    requestedBy: "contacto@serviciosdigitales.com"
  },
  {
    id: "2",
    fromCompanyId: "XY9Z8W7V",
    fromCompanyName: "Logística Express",
    fromCompanyUniqueId: "XY9Z8W7V",
    toCompanyId: "TC8X9K2L",
    toCompanyName: "TechCorp",
    requestedAt: "2024-01-21T09:45:00Z",
    requestedBy: "admin@logisticaexpress.com"
  }
]

const mockStats: NetworkStats = {
  totalConnections: 2,
  pendingReceived: 2
}

export default function NetworkPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [connections] = useState<CompanyConnection[]>(mockConnections)
  const [requests] = useState<ConnectionRequest[]>(mockRequests)
  const [stats] = useState<NetworkStats>(mockStats)
  const [searchTerm, setSearchTerm] = useState("")
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [newRequest, setNewRequest] = useState({
    companyId: "",
    message: ""
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  const handleSendRequest = () => {
    if (!newRequest.companyId.trim()) {
      toast.error('Ingrese el ID de la empresa')
      return
    }

    toast.success('Solicitud enviada exitosamente', {
      description: `Se envió la solicitud a la empresa con ID ${newRequest.companyId}`
    })
    
    setShowRequestModal(false)
    setNewRequest({ companyId: "", message: "" })
  }

  const handleAcceptRequest = (request: ConnectionRequest) => {
    toast.success('Solicitud aceptada', {
      description: `${request.fromCompanyName} ahora está en tu red empresarial`
    })
  }

  const handleRejectRequest = (request: ConnectionRequest) => {
    toast.success('Solicitud rechazada', {
      description: `Se rechazó la solicitud de ${request.fromCompanyName}`
    })
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
                Empresas Conectadas ({stats.totalConnections})
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Solicitudes ({stats.pendingReceived})
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Solicitudes de Conexión</CardTitle>
                <CardDescription>Solicitudes pendientes de otras empresas</CardDescription>
              </CardHeader>
              <CardContent>
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
                      <p className="text-muted-foreground">No hay solicitudes pendientes</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Send Request Modal */}
        <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Conectar con Nueva Empresa</DialogTitle>
              <DialogDescription>
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
                />
                <p className="text-xs text-muted-foreground">
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
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRequestModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSendRequest}>
                Enviar Solicitud
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}