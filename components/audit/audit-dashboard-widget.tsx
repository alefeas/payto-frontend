import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { auditService, AuditLog } from '@/services/audit.service'
import { Activity, Users, Clock, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import { colors } from '@/styles'

interface AuditDashboardWidgetProps {
  companyId: string
}

interface WidgetStats {
  total_logs: number
  unique_actions: number
  unique_users: number
  action_breakdown: Record<string, number>
  recent_logs: AuditLog[]
}

export function AuditDashboardWidget({ companyId }: AuditDashboardWidgetProps) {
  const [stats, setStats] = useState<WidgetStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([])

  useEffect(() => {
    loadStats()
  }, [companyId])

  const loadStats = async () => {
    try {
      setLoading(true)
      const [statsData, logsData] = await Promise.all([
        auditService.getCompanyAuditStats(companyId),
        auditService.getRecentAuditActivities(companyId, 5)
      ])
      setStats({
        total_logs: statsData.total_logs,
        unique_actions: statsData.unique_actions,
        unique_users: statsData.unique_users,
        action_breakdown: statsData.action_breakdown,
        recent_logs: logsData
      })
      setRecentLogs(logsData)
    } catch (error) {
      console.error('Error loading audit stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (_action: string) => {
    return 'bg-white text-foreground border border-gray-200'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
          <CardDescription>Estadísticas de auditoría</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
          <CardDescription>No hay datos disponibles</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">No se pudieron cargar las estadísticas de auditoría</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
          <CardDescription>Estadísticas de auditoría</CardDescription>
        </div>
        <Link href={`/company/${companyId}/audit-log`}>
          <Button variant="outline" size="sm">
            Ver todo
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: colors.accent }}>Eventos Totales</p>
                  <p className="text-2xl font-bold" style={{ color: colors.accent }}>{(stats.total_logs || 0).toLocaleString()}</p>
                </div>
                <Activity className="h-8 w-8" style={{ color: colors.accent }} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: colors.accent }}>Acciones Únicas</p>
                  <p className="text-2xl font-bold" style={{ color: colors.accent }}>{stats.unique_actions || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8" style={{ color: colors.accent }} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: colors.accent }}>Usuarios Activos</p>
                  <p className="text-2xl font-bold" style={{ color: colors.accent }}>{stats.unique_users || 0}</p>
                </div>
                <Users className="h-8 w-8" style={{ color: colors.accent }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top acciones */}
        {stats.action_breakdown && Object.keys(stats.action_breakdown).length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Acciones más comunes</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.action_breakdown)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([action, count], index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {action}: {count}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Eventos recientes */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Eventos Recientes
          </h4>
          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all">
                <div className="flex items-center gap-3">
                  <Badge className={getActionColor(log.action)} style={{ color: colors.accent }}>
                    {log.action}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">
                      {log.entityType || 'Sistema'}
                    </p>
                    <p className="text-xs text-gray-500">
                      por {log.user.email}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(log.createdAt), { 
                    addSuffix: true, 
                    locale: es 
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}