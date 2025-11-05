'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  FileText, 
  Filter, 
  RefreshCw,
  Calendar,
  User,
  AlertCircle,
  Plus
} from 'lucide-react'

interface AuditEmptyStateProps {
  title?: string
  description?: string
  type?: 'no-results' | 'no-logs' | 'no-permission'
  onResetFilters?: () => void
  onRefresh?: () => void
  showCreateButton?: boolean
  onCreateClick?: () => void
}

export function AuditEmptyState({ 
  title, 
  description, 
  type = 'no-results',
  onResetFilters,
  onRefresh,
  showCreateButton = false,
  onCreateClick
}: AuditEmptyStateProps) {
  
  const getContent = () => {
    switch (type) {
      case 'no-permission':
        return {
          icon: AlertCircle,
          title: title || 'Sin Permisos',
          description: description || 'No tienes permisos para ver los registros de auditoría de esta empresa.',
          color: 'text-red-500',
          bgColor: 'bg-red-50'
        }
      case 'no-logs':
        return {
          icon: FileText,
          title: title || 'Sin Registros',
          description: description || 'Aún no hay actividad registrada en esta empresa.',
          color: 'text-blue-500',
          bgColor: 'bg-blue-50'
        }
      case 'no-results':
      default:
        return {
          icon: Search,
          title: title || 'Sin Resultados',
          description: description || 'No se encontraron registros que coincidan con tus filtros.',
          color: 'text-gray-500',
          bgColor: 'bg-gray-50'
        }
    }
  }

  const content = getContent()
  const Icon = content.icon

  return (
    <Card className="border-dashed">
      <CardContent className="p-8">
        <div className="text-center">
          <div className={`mx-auto h-12 w-12 ${content.bgColor} rounded-full flex items-center justify-center mb-4`}>
            <Icon className={`h-6 w-6 ${content.color}`} />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {content.title}
          </h3>
          
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {content.description}
          </p>

          <div className="flex flex-wrap gap-3 justify-center mb-6">
            {type === 'no-results' && (
              <>
                <Badge variant="outline" className="gap-1">
                  <Filter className="h-3 w-3" />
                  Intenta ajustar tus filtros
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Search className="h-3 w-3" />
                  Usa términos de búsqueda más generales
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  Expande el rango de fechas
                </Badge>
              </>
            )}
            
            {type === 'no-logs' && (
              <>
                <Badge variant="outline" className="gap-1">
                  <User className="h-3 w-3" />
                  La actividad aparecerá aquí
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <FileText className="h-3 w-3" />
                  Todos los eventos se registran automáticamente
                </Badge>
              </>
            )}
          </div>

          <div className="flex gap-3 justify-center">
            {type === 'no-results' && onResetFilters && (
              <Button variant="outline" onClick={onResetFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Limpiar filtros
              </Button>
            )}
            
            {onRefresh && (
              <Button variant="outline" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            )}
            
            {showCreateButton && onCreateClick && (
              <Button onClick={onCreateClick}>
                <Plus className="h-4 w-4 mr-2" />
                Crear actividad
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function AuditNoResults({ onResetFilters, onRefresh }: { onResetFilters?: () => void; onRefresh?: () => void }) {
  return (
    <AuditEmptyState
      type="no-results"
      onResetFilters={onResetFilters}
      onRefresh={onRefresh}
    />
  )
}

export function AuditNoLogs({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <AuditEmptyState
      type="no-logs"
      onRefresh={onRefresh}
    />
  )
}

export function AuditNoPermission() {
  return (
    <AuditEmptyState
      type="no-permission"
    />
  )
}