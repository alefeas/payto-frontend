'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  Users, 
  Activity, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  BarChart3
} from 'lucide-react'
import { auditService, AuditStats } from '@/services/audit.service'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface AuditDashboardStatsProps {
  companyId: string
}

export function AuditDashboardStats({ companyId }: AuditDashboardStatsProps) {
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await auditService.getCompanyAuditStats(companyId)
      setStats(data)
    } catch (error) {
      console.error('Error loading audit stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadStats()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cargando...</CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <Card className="col-span-full">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>No se pudieron cargar las estadísticas</p>
            <Button variant="outline" size="sm" onClick={loadStats} className="mt-2">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const statCards = [
    {
      title: 'Eventos Totales',
      value: (stats.total_logs || 0).toLocaleString(),
      description: 'Registros de auditoría',
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: 'stable'
    },
    {
      title: 'Acciones Únicas',
      value: (stats.unique_actions || 0).toString(),
      description: 'Tipos de acciones registradas',
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: 'stable'
    },
    {
      title: 'Usuarios Activos',
      value: (stats.unique_users || 0).toString(),
      description: 'Usuarios con actividad',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: 'up'
    },
    {
      title: 'Tipos de Acción',
      value: Object.keys(stats.action_breakdown || {}).length.toString(),
      description: 'Acciones diferentes',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      trend: 'stable'
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Estadísticas de Auditoría</h2>
          <p className="text-sm text-muted-foreground">
            Resumen de actividad del sistema
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
                {card.trend === 'up' && (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                )}
                {card.trend === 'recent' && (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Actions */}
      {stats.action_breakdown && Object.keys(stats.action_breakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Acciones Más Comunes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.action_breakdown)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([action, count], index) => (
                <div key={action} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{index + 1}.</span>
                    <Badge variant="outline" className="text-xs">
                      {action}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {count} veces
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}