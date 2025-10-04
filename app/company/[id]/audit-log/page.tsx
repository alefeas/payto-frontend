"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Search, Filter, Eye, User, Calendar, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"

// Mock audit log data
const mockAuditLog = [
  {
    id: "1",
    action: "invoice_created",
    entityType: "invoice",
    entityId: "FC-001-00000128",
    user: "Juan Pérez",
    details: "Creó factura FC-001-00000128 por $121,000",
    ipAddress: "192.168.1.100",
    timestamp: "2024-01-25T14:30:00Z",
    severity: "info"
  },
  {
    id: "2", 
    action: "invoice_rejected",
    entityType: "invoice",
    entityId: "FC-001-00000127",
    user: "María González",
    details: "Rechazó factura FC-001-00000127 - Motivo: Monto incorrecto",
    ipAddress: "10.0.0.50",
    timestamp: "2024-01-25T13:15:00Z",
    severity: "warning"
  },
  {
    id: "3",
    action: "payment_confirmed",
    entityType: "payment",
    entityId: "PAG-001",
    user: "Carlos Ruiz",
    details: "Confirmó pago PAG-001 por $85,000",
    ipAddress: "192.168.1.105",
    timestamp: "2024-01-25T12:45:00Z",
    severity: "success"
  },
  {
    id: "4",
    action: "user_login",
    entityType: "session",
    entityId: "session_123",
    user: "Ana López",
    details: "Inicio de sesión exitoso",
    ipAddress: "192.168.1.110",
    timestamp: "2024-01-25T09:30:00Z",
    severity: "info"
  },
  {
    id: "5",
    action: "invoice_approved",
    entityType: "invoice", 
    entityId: "FC-001-00000126",
    user: "Roberto Silva",
    details: "Aprobó factura FC-001-00000126 por $150,000",
    ipAddress: "192.168.1.120",
    timestamp: "2024-01-25T08:20:00Z",
    severity: "success"
  },
  {
    id: "6",
    action: "company_settings_updated",
    entityType: "company",
    entityId: "company_1",
    user: "Juan Pérez",
    details: "Actualizó configuración de impuestos por defecto",
    ipAddress: "192.168.1.100",
    timestamp: "2024-01-24T16:45:00Z",
    severity: "warning"
  }
]

export default function AuditLogPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [userFilter, setUserFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  const filteredLogs = mockAuditLog.filter(log => {
    const matchesSearch = 
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesAction = actionFilter === "all" || log.action.includes(actionFilter)
    const matchesUser = userFilter === "all" || log.user === userFilter
    const matchesSeverity = severityFilter === "all" || log.severity === severityFilter
    
    return matchesSearch && matchesAction && matchesUser && matchesSeverity
  })

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Éxito</Badge>
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Advertencia</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>
      default:
        return <Badge variant="secondary">Info</Badge>
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes('invoice')) return <Eye className="h-4 w-4" />
    if (action.includes('payment')) return <Activity className="h-4 w-4" />
    if (action.includes('user') || action.includes('login')) return <User className="h-4 w-4" />
    return <Activity className="h-4 w-4" />
  }

  const uniqueUsers = [...new Set(mockAuditLog.map(log => log.user))]

  if (authLoading) return null
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/company/${companyId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Registro de Auditoría</h1>
            <p className="text-muted-foreground">Historial completo de actividades del sistema</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Eventos</p>
                  <p className="text-2xl font-bold">{mockAuditLog.length}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Usuarios Activos</p>
                  <p className="text-2xl font-bold">{uniqueUsers.length}</p>
                </div>
                <User className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hoy</p>
                  <p className="text-2xl font-bold">{mockAuditLog.filter(log => 
                    new Date(log.timestamp).toDateString() === new Date().toDateString()
                  ).length}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Advertencias</p>
                  <p className="text-2xl font-bold text-yellow-600">{mockAuditLog.filter(log => 
                    log.severity === 'warning' || log.severity === 'error'
                  ).length}</p>
                </div>
                <Filter className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Acción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las acciones</SelectItem>
                  <SelectItem value="invoice">Facturas</SelectItem>
                  <SelectItem value="payment">Pagos</SelectItem>
                  <SelectItem value="user">Usuarios</SelectItem>
                  <SelectItem value="company">Empresa</SelectItem>
                </SelectContent>
              </Select>

              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Usuario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los usuarios</SelectItem>
                  {uniqueUsers.map(user => (
                    <SelectItem key={user} value={user}>{user}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Severidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="success">Éxito</SelectItem>
                  <SelectItem value="info">Información</SelectItem>
                  <SelectItem value="warning">Advertencia</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("")
                  setActionFilter("all")
                  setUserFilter("all")
                  setSeverityFilter("all")
                }}
              >
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Audit Log */}
        <Card>
          <CardHeader>
            <CardTitle>Registro de Eventos ({filteredLogs.length})</CardTitle>
            <CardDescription>Historial cronológico de todas las actividades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-muted rounded-lg">
                        {getActionIcon(log.action)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{log.details}</p>
                          {getSeverityBadge(log.severity)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {log.user}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                          <span>IP: {log.ipAddress}</span>
                          <span>ID: {log.entityId}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}