"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Search, Filter, Eye, User, Calendar, Activity, Shield, FileText, CreditCard, Users as UsersIcon, Settings as SettingsIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { auditService, AuditLog } from "@/services/audit.service"
import { toast } from "sonner"

export default function AuditLogPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState("all")

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    } else if (isAuthenticated) {
      loadLogs()
    }
  }, [isAuthenticated, authLoading, router])

  const loadLogs = async () => {
    try {
      setLoading(true)
      const response = await auditService.getCompanyAuditLogs(companyId)
      setLogs(response.data)
    } catch (error) {
      console.error('Error loading audit logs:', error)
      toast.error('Error al cargar registro de auditoría')
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesAction = actionFilter === "all" || log.action.includes(actionFilter)
    
    return matchesSearch && matchesAction
  })

  const getActionIcon = (action: string) => {
    if (action.includes('member')) return <UsersIcon className="h-4 w-4" />
    if (action.includes('company')) return <SettingsIcon className="h-4 w-4" />
    if (action.includes('invoice')) return <FileText className="h-4 w-4" />
    if (action.includes('payment')) return <CreditCard className="h-4 w-4" />
    return <Activity className="h-4 w-4" />
  }

  const getActionLabel = (action: string): string => {
    const labels: Record<string, string> = {
      'company.created': 'Empresa Creada',
      'company.updated': 'Empresa Actualizada',
      'company.deleted': 'Empresa Eliminada',
      'company.invite_code_regenerated': 'Código Regenerado',
      'member.joined': 'Miembro Unido',
      'member.role_updated': 'Rol Actualizado',
      'member.removed': 'Miembro Removido',
    }
    return labels[action] || action
  }

  const getActionColor = (action: string): string => {
    if (action.includes('created') || action.includes('joined')) return 'bg-green-100 text-green-800'
    if (action.includes('updated') || action.includes('regenerated')) return 'bg-blue-100 text-blue-800'
    if (action.includes('deleted') || action.includes('removed')) return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-muted rounded animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-8 w-64 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-96 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push(`/company/${companyId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Registro de Auditoría</h1>
            <p className="text-muted-foreground">Historial completo de actividades del sistema</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Eventos</p>
                  <p className="text-2xl font-bold">{logs.length}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hoy</p>
                  <p className="text-2xl font-bold">{logs.filter(log => 
                    new Date(log.createdAt).toDateString() === new Date().toDateString()
                  ).length}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Usuarios Únicos</p>
                  <p className="text-2xl font-bold">{new Set(logs.map(l => l.userId)).size}</p>
                </div>
                <User className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <SelectItem value="company">Empresa</SelectItem>
                  <SelectItem value="member">Miembros</SelectItem>
                  <SelectItem value="invoice">Facturas</SelectItem>
                  <SelectItem value="payment">Pagos</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("")
                  setActionFilter("all")
                }}
              >
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registro de Eventos ({filteredLogs.length})</CardTitle>
            <CardDescription>Historial cronológico de todas las actividades</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No hay eventos registrados</h3>
                <p className="text-sm text-muted-foreground">
                  {logs.length === 0 
                    ? "Aún no se han registrado actividades en esta empresa"
                    : "No se encontraron eventos con los filtros aplicados"
                  }
                </p>
              </div>
            ) : (
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
                            <p className="font-medium">{log.description}</p>
                            <Badge className={getActionColor(log.action)}>
                              {getActionLabel(log.action)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {log.user.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(log.createdAt).toLocaleString()}
                            </span>
                            {log.ipAddress && (
                              <span>IP: {log.ipAddress}</span>
                            )}
                            {log.entityId && (
                              <span>ID: {log.entityId}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
