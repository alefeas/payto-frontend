'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Eye, User, Calendar, Globe, Hash, Code, Search } from 'lucide-react'
import { AuditMetadataViewer } from './audit-metadata-viewer'
import { AuditLog } from '@/services/audit.service'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface AuditLogsTableProps {
  logs: AuditLog[]
  isLoading: boolean
}

export function AuditLogsTable({ logs, isLoading }: AuditLogsTableProps) {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      'create': 'bg-green-100 text-green-800 hover:bg-green-200',
      'update': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      'delete': 'bg-red-100 text-red-800 hover:bg-red-200',
      'login': 'bg-purple-100 text-purple-800 hover:bg-purple-200',
      'logout': 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      'view': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      'export': 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
      'import': 'bg-pink-100 text-pink-800 hover:bg-pink-200',
    }
    return colors[action.toLowerCase()] || 'bg-gray-100 text-gray-800 hover:bg-gray-200'
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'create': 'Crear',
      'update': 'Actualizar',
      'delete': 'Eliminar',
      'login': 'Iniciar Sesión',
      'logout': 'Cerrar Sesión',
      'view': 'Ver',
      'export': 'Exportar',
      'import': 'Importar',
    }
    return labels[action.toLowerCase()] || action
  }

  const filteredLogs = logs.filter(log => 
    log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entityType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entityId?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registros de Auditoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!logs.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registros de Auditoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No se encontraron registros de auditoría
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Registros de Auditoría</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Input
                placeholder="Buscar en los registros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
              <Eye className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
          <span>💡 Desliza horizontalmente para ver más columnas</span>
        </div>
        <div className="relative">
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200">
                <TableHead>Acción</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Entidad</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className="border-b border-gray-200">
                  <TableCell>
                    <Badge className={getActionColor(log.action)}>
                      {getActionLabel(log.action)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {log.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{log.user.name}</div>
                        <div className="text-sm text-gray-500">{log.user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <div>{log.relativeTime}</div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(log.createdAt), "dd 'de' MMMM 'de' yyyy HH:mm", { locale: es })}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      {log.ipAddress || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {log.entityType && log.entityId && (
                        <Badge variant="outline" className="text-xs">
                          {log.entityType}:{log.entityId.slice(-6)}
                        </Badge>
                      )}
                      {log.ipAddress && (
                        <Badge variant="secondary" className="text-xs">
                          {log.ipAddress}
                        </Badge>
                      )}
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <AuditMetadataViewer 
                          metadata={log.metadata}
                          trigger={
                            <Button variant="ghost" size="sm" className="h-6 px-2">
                              <Code className="h-3 w-3 mr-1" />
                              Detalles
                            </Button>
                          }
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye className="h-4 w-4" />
                            Ver Detalles
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalles del Registro de Auditoría</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="font-semibold">ID del Registro</Label>
                                <p className="text-sm">{log.id}</p>
                              </div>
                              <div>
                                <Label className="font-semibold">Acción</Label>
                                <Badge className={getActionColor(log.action)}>
                                  {getActionLabel(log.action)}
                                </Badge>
                              </div>
                              <div>
                                <Label className="font-semibold">Usuario</Label>
                                <p className="text-sm">{log.user.name} ({log.user.email})</p>
                              </div>
                              <div>
                                <Label className="font-semibold">Fecha</Label>
                                <p className="text-sm">
                                  {format(new Date(log.createdAt), "dd 'de' MMMM 'de' yyyy HH:mm:ss", { locale: es })}
                                </p>
                              </div>
                              <div>
                                <Label className="font-semibold">Dirección IP</Label>
                                <p className="text-sm">{log.ipAddress || 'No disponible'}</p>
                              </div>
                              <div>
                                <Label className="font-semibold">Agente de Usuario</Label>
                                <p className="text-sm truncate">{log.userAgent || 'No disponible'}</p>
                              </div>
                              {log.entityType && (
                                <div>
                                  <Label className="font-semibold">Tipo de Entidad</Label>
                                  <p className="text-sm">{log.entityType}</p>
                                </div>
                              )}
                              {log.entityId && (
                                <div>
                                  <Label className="font-semibold">ID de Entidad</Label>
                                  <p className="text-sm">{log.entityId}</p>
                                </div>
                              )}
                            </div>
                            <div>
                              <Label className="font-semibold">Descripción</Label>
                              <p className="text-sm">{log.description}</p>
                            </div>
                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                              <div>
                                <Label className="font-semibold flex items-center gap-2">
                                  <Code className="h-4 w-4" />
                                  Metadatos
                                </Label>
                                <pre className="text-xs bg-gray-50 p-3 rounded-md overflow-auto max-h-48">
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
          <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          Mostrando {filteredLogs.length} de {logs.length} registros
        </div>
      </CardContent>
    </Card>
  )
}