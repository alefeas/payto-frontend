import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { auditService } from '@/services/audit.service'
import { Bell, AlertTriangle, Shield, Activity, User, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import { colors } from '@/styles'

interface AuditNotification {
  id: string
  type: 'security' | 'system' | 'user' | 'error'
  title: string
  message: string
  action: string
  entity_type: string
  entity_id: string
  user_email: string
  created_at: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  read: boolean
}

interface AuditNotificationsProps {
  companyId: string
  limit?: number
}

export function AuditNotifications({ companyId, limit = 10 }: AuditNotificationsProps) {
  const [notifications, setNotifications] = useState<AuditNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all')

  useEffect(() => {
    loadNotifications()
  }, [companyId, filter])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      // Simulamos notificaciones basadas en logs de auditoría
      const logs = await auditService.getCompanyAuditLogs(companyId, 1, { per_page: limit * 3 })
      const mockNotifications: AuditNotification[] = logs.data
        .filter(log => {
          // Filtrar logs importantes para notificaciones
          const importantActions = ['login', 'logout', 'create', 'delete', 'export', 'import']
          return importantActions.some(action => log.action.toLowerCase().includes(action))
        })
        .slice(0, limit)
        .map(log => ({
          id: log.id,
          type: getNotificationType(log.action),
          title: getNotificationTitle(log.action, log.entityType || ''),
          message: getNotificationMessage(log),
          action: log.action,
          entity_type: log.entityType || '',
          entity_id: log.entityId || '',
          user_email: log.user.email,
          created_at: log.createdAt,
          severity: getNotificationSeverity(log.action),
          read: false
        }))
      
      setNotifications(mockNotifications)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNotificationType = (action: string): 'security' | 'system' | 'user' | 'error' => {
    if (action.toLowerCase().includes('login') || action.toLowerCase().includes('logout')) {
      return 'security'
    }
    if (action.toLowerCase().includes('create') || action.toLowerCase().includes('delete')) {
      return 'system'
    }
    if (action.toLowerCase().includes('export') || action.toLowerCase().includes('import')) {
      return 'user'
    }
    return 'system'
  }

  const getNotificationTitle = (action: string, entityType: string | null): string => {
    const titles = {
      'login': 'Inicio de sesión',
      'logout': 'Cierre de sesión',
      'create': 'Nuevo registro creado',
      'delete': 'Registro eliminado',
      'export': 'Exportación de datos',
      'import': 'Importación de datos'
    }
    
    const actionLower = action.toLowerCase()
    return Object.entries(titles).find(([key]) => actionLower.includes(key))?.[1] || `Acción: ${action}`
  }

  const getNotificationMessage = (log: any): string => {
    const messages = {
      'login': `Usuario ${log.user.email} inició sesión en el sistema`,
      'logout': `Usuario ${log.user.email} cerró sesión`,
      'create': `Se creó un nuevo ${log.entityType || 'registro'}`,
      'delete': `Se eliminó un ${log.entityType || 'registro'}`,
      'export': `Usuario ${log.user.email} exportó datos de ${log.entityType || 'sistema'}`,
      'import': `Usuario ${log.user.email} importó datos de ${log.entityType || 'sistema'}`
    }
    
    const actionLower = log.action.toLowerCase()
    return Object.entries(messages).find(([key]) => actionLower.includes(key))?.[1] || log.description || 'Actividad registrada'
  }

  const getNotificationSeverity = (action: string): 'low' | 'medium' | 'high' | 'critical' => {
    if (action.toLowerCase().includes('delete')) return 'high'
    if (action.toLowerCase().includes('export') || action.toLowerCase().includes('import')) return 'medium'
    if (action.toLowerCase().includes('login')) return 'low'
    return 'low'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#dc2626' // red-600
      case 'high': return '#b45309' // amber-700
      case 'medium': return '#ca8a04' // amber-600
      case 'low': return colors.accent
      default: return '#6b7280' // gray-500
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security': return <Shield className="h-4 w-4" />
      case 'system': return <Activity className="h-4 w-4" />
      case 'user': return <User className="h-4 w-4" />
      case 'error': return <AlertTriangle className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read
    if (filter === 'critical') return notification.severity === 'critical' || notification.severity === 'high'
    return true
  })

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones de Auditoría
          </CardTitle>
          <CardDescription>Actividades importantes del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones de Auditoría
          </CardTitle>
          <CardDescription>Actividades importantes del sistema</CardDescription>
        </div>
        <Link href={`/company/${companyId}/audit-log`}>
          <Button variant="outline" size="sm">
            Ver todo
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Todas
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            No leídas
          </Button>
          <Button
            variant={filter === 'critical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('critical')}
          >
            Importantes
          </Button>
        </div>

        {/* Notificaciones */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No hay notificaciones para mostrar</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border transition-all cursor-pointer hover:shadow-sm bg-white border-gray-200`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full border border-gray-200 bg-white">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium" style={{ color: getSeverityColor(notification.severity) }}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.accent }}></div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{notification.user_email}</span>
                        <span>•</span>
                        <span>{notification.entity_type}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(notification.created_at), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}