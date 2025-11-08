'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Activity, Clock, User, Hash } from 'lucide-react'
import { auditService, AuditLog } from '@/services/audit.service'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

interface RecentActivityProps {
  companyId: string
  limit?: number
}

export function RecentActivity({ companyId, limit = 5 }: RecentActivityProps) {
  const [activities, setActivities] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecentActivities()
  }, [companyId])

  const loadRecentActivities = async () => {
    try {
      setLoading(true)
      const recentLogs = await auditService.getRecentAuditActivities(companyId, limit)
      setActivities(recentLogs)
    } catch (error) {
      console.error('Error loading recent activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      'create': 'bg-green-100 text-green-800',
      'update': 'bg-blue-100 text-blue-800',
      'delete': 'bg-red-100 text-red-800',
      'login': 'bg-purple-100 text-purple-800',
      'logout': 'bg-gray-100 text-gray-800',
      'view': 'bg-yellow-100 text-yellow-800',
      'export': 'bg-indigo-100 text-indigo-800',
      'import': 'bg-pink-100 text-pink-800',
    }
    return colors[action.toLowerCase()] || 'bg-gray-100 text-gray-800'
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

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Actividad Reciente</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!activities.length) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Actividad Reciente</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            <Activity className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No hay actividad reciente</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Actividad Reciente</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={getActionColor(activity.action)}>
                    {getActionLabel(activity.action)}
                  </Badge>
                  <span className="text-sm text-muted-foreground truncate">
                    {activity.description}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {activity.user.name}
                  </span>
                  {activity.entityType && activity.entityId && (
                    <span className="flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      {activity.entityType}:{activity.entityId.slice(-6)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: es })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <Link href={`/company/${companyId}/audit-log`}>
            <Button variant="outline" size="lg">
              Ver todos los registros
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}