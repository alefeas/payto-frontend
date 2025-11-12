'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  BarChart3
} from 'lucide-react'
import { colors } from '@/styles'
import { AuditStats } from '@/services/audit.service'

interface AuditDashboardStatsProps {
  companyId: string
  stats: AuditStats | null
}

export function AuditDashboardStats({ companyId, stats }: AuditDashboardStatsProps) {
  if (!stats) {
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



  const getMostCommonAction = () => {
    if (!stats.action_breakdown || Object.keys(stats.action_breakdown).length === 0) {
      return 'N/A'
    }
    const sorted = Object.entries(stats.action_breakdown).sort(([, a], [, b]) => (b as number) - (a as number))
    return sorted[0][0]
  }

  const statCards = [
    {
      title: 'Eventos Totales',
      value: (stats.total_logs || 0).toLocaleString(),
      description: 'Registros de auditoría',
      icon: Activity,
      color: colors.accent
    },
    {
      title: 'Acciones Únicas',
      value: (stats.unique_actions || 0).toString(),
      description: 'Tipos de acciones registradas',
      icon: BarChart3,
      color: colors.accent
    },
    {
      title: 'Acción Más Frecuente',
      value: getMostCommonAction(),
      description: 'Acción más realizada',
      icon: BarChart3,
      color: colors.accent
    }
  ]

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Estadísticas de Auditoría</h2>
        <p className="text-sm text-muted-foreground">
          Resumen de actividad del sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((card, index) => (
          <Card key={index} className="border-gray-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className="p-2 rounded-lg border border-gray-200 bg-white">
                <card.icon className="h-4 w-4" style={{ color: card.color }} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}