'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Filter, X, Download, Search } from 'lucide-react'
import { DatePicker } from '@/components/ui/date-picker'
import { formatDateToLocal, parseDateLocal } from '@/lib/utils'
import type { AuditFilters } from '@/services/audit.service'

interface AuditFiltersProps {
  companyId: string
  onFiltersChange: (filters: AuditFilters) => void
  onExport: () => void
  availableActions: string[]
  isLoading?: boolean
}

export function AuditFilters({ companyId, onFiltersChange, onExport, availableActions, isLoading }: AuditFiltersProps) {
  const [filters, setFilters] = useState<AuditFilters>({})
  const [dateFrom, setDateFrom] = useState<Date | undefined>()
  const [dateTo, setDateTo] = useState<Date | undefined>()
  const [showFilters, setShowFilters] = useState(false)

  const handleFilterChange = (key: keyof AuditFilters, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }))
  }

  const applyFilters = () => {
    const formattedFilters = {
      ...filters,
      start_date: dateFrom ? formatDateToLocal(dateFrom) : undefined,
      end_date: dateTo ? formatDateToLocal(dateTo) : undefined
    }
    onFiltersChange(formattedFilters)
  }

  const clearFilters = () => {
    setFilters({})
    setDateFrom(undefined)
    setDateTo(undefined)
    onFiltersChange({})
  }

  const hasActiveFilters = Object.keys(filters).length > 0 || dateFrom || dateTo

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            disabled={isLoading}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Limpiar Filtros
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            disabled={isLoading}
          >
            <Download className="h-4 w-4 mr-2" />
            {isLoading ? 'Exportando...' : 'Exportar CSV'}
          </Button>
        </div>
      </div>
      
      {showFilters && (
        <Card className="border-gray-200">
          <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="action">Acción</Label>
              <Select
                value={filters.action || 'all'}
                onValueChange={(value) => handleFilterChange('action', value === 'all' ? undefined : value)}
              >
                <SelectTrigger id="action">
                  <SelectValue placeholder="Todas las acciones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las acciones</SelectItem>
                  {availableActions.map(action => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entity_type">Tipo de Entidad</Label>
              <Input
                id="entity_type"
                placeholder="Ej: User, Company"
                value={filters.entity_type || ''}
                onChange={(e) => handleFilterChange('entity_type', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entity_id">ID de Entidad</Label>
              <Input
                id="entity_id"
                placeholder="ID de la entidad"
                value={filters.entity_id || ''}
                onChange={(e) => handleFilterChange('entity_id', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_id">ID de Usuario</Label>
              <Input
                id="user_id"
                placeholder="ID del usuario"
                value={filters.user_id || ''}
                onChange={(e) => handleFilterChange('user_id', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ip_address">Dirección IP</Label>
              <Input
                id="ip_address"
                placeholder="Ej: 192.168.1.1"
                value={filters.ip_address || ''}
                onChange={(e) => handleFilterChange('ip_address', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                placeholder="Buscar en descripción"
                value={filters.description || ''}
                onChange={(e) => handleFilterChange('description', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Fecha Desde</Label>
              <DatePicker
                date={dateFrom}
                onSelect={setDateFrom}
                placeholder="Seleccionar fecha"
              />
            </div>

            <div className="space-y-2">
              <Label>Fecha Hasta</Label>
              <DatePicker
                date={dateTo}
                onSelect={setDateTo}
                placeholder="Seleccionar fecha"
                minDate={dateFrom}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              onClick={applyFilters}
              disabled={isLoading}
            >
              <Search className="h-4 w-4 mr-2" />
              Aplicar Filtros
            </Button>
          </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}