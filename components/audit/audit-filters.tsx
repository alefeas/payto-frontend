'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Filter, X, Download } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { AuditExportButton } from './audit-export-button'
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
  const didMountRef = useRef(false)

  useEffect(() => {
    if (!didMountRef.current) {
      // Evitar disparar filtros en el primer render para prevenir bucles
      didMountRef.current = true
      return
    }

    const timeoutId = setTimeout(() => {
      const formattedFilters = {
        ...filters,
        start_date: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : undefined,
        end_date: dateTo ? format(dateTo, 'yyyy-MM-dd') : undefined
      }
      onFiltersChange(formattedFilters)
    }, 500) // Debounce de 500ms

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, dateFrom, dateTo])

  const handleFilterChange = (key: keyof AuditFilters, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }))
  }

  const clearFilters = () => {
    setFilters({})
    setDateFrom(undefined)
    setDateTo(undefined)
  }

  const hasActiveFilters = Object.keys(filters).length > 0 || dateFrom || dateTo

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Filtros de Auditoría</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </CardHeader>
      
      {showFilters && (
        <CardContent>
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="lg">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "dd 'de' MMMM 'de' yyyy", { locale: es }) : 
                     <span>Seleccionar fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    locale={es}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Fecha Hasta</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="lg">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "dd 'de' MMMM 'de' yyyy", { locale: es }) : 
                     <span>Seleccionar fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    locale={es}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex justify-end mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Limpiar Filtros
              </Button>
            </div>
          )}
        </CardContent>
      )}
      
      <div className="pt-4 border-t">
        <AuditExportButton 
          companyId={companyId}
          filters={{
            action: filters.action,
            entityType: filters.entity_type,
            entityId: filters.entity_id,
            userId: filters.user_id,
            startDate: filters.start_date,
            endDate: filters.end_date
          }}
          className="w-full"
        />
      </div>
    </Card>
  )
}