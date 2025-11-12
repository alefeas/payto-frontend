'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Search, 
  Filter, 
  X, 
  History,
  Clock,
  User,
  Hash,
  Globe
} from 'lucide-react'
import { AuditFilters } from '@/services/audit.service'

interface AuditSearchAdvancedProps {
  companyId: string
  onSearch: (query: string, filters: AuditFilters) => void
  loading?: boolean
}

export function AuditSearchAdvanced({ companyId, onSearch, loading }: AuditSearchAdvancedProps) {
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState(false)
  
  // Filtros avanzados
  const [filters, setFilters] = useState<AuditFilters>({
    action: '',
    entity_type: '',
    entity_id: '',
    user_id: '',
    start_date: '',
    end_date: ''
  })

  useEffect(() => {
    // Cargar historial de búsqueda del localStorage
    const savedHistory = localStorage.getItem(`audit_search_history_${companyId}`)
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory))
    }
  }, [companyId])

  const saveToHistory = (searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10)
    setSearchHistory(newHistory)
    localStorage.setItem(`audit_search_history_${companyId}`, JSON.stringify(newHistory))
  }

  const handleSearch = () => {
    if (query.trim()) {
      saveToHistory(query)
    }
    
    onSearch(query, filters)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const selectFromHistory = (historyQuery: string) => {
    setQuery(historyQuery)
    setShowHistory(false)
    handleSearch()
  }

  const clearFilters = () => {
    setFilters({
      action: '',
      entity_type: '',
      entity_id: '',
      user_id: '',
      start_date: '',
      end_date: ''
    })
    setQuery('')
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '') || query !== ''

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda principal */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar en registros de auditoría..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 pr-10"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? 'bg-white border-gray-200' : ''}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2 h-5 px-1">
              {Object.values(filters).filter(v => v !== '').length + (query ? 1 : 0)}
            </Badge>
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setShowHistory(!showHistory)}
        >
          <History className="h-4 w-4 mr-2" />
          Historial
        </Button>
        
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
              Buscando...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </>
          )}
        </Button>
      </div>

      {/* Historial de búsqueda */}
      {showHistory && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <History className="h-4 w-4" />
                Búsquedas recientes
              </h4>
              {searchHistory.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchHistory([])
                    localStorage.removeItem(`audit_search_history_${companyId}`)
                  }}
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>
            
            {searchHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay búsquedas recientes
              </p>
            ) : (
              <div className="space-y-2">
                {searchHistory.map((historyQuery, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => selectFromHistory(historyQuery)}
                    className="w-full justify-start text-left"
                  >
                    <Clock className="h-3 w-3 mr-2" />
                    {historyQuery}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filtros avanzados */}
      {showFilters && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Acción</label>
                <Input
                  placeholder="Ej: create, update, delete"
                  value={filters.action || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                  className="text-sm"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Tipo de Entidad</label>
                <Input
                  placeholder="Ej: invoice, company, user"
                  value={filters.entity_type || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, entity_type: e.target.value }))}
                  className="text-sm"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">ID de Entidad</label>
                <Input
                  placeholder="ID específico"
                  value={filters.entity_id || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, entity_id: e.target.value }))}
                  className="text-sm"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">ID de Usuario</label>
                <Input
                  placeholder="ID del usuario"
                  value={filters.user_id || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, user_id: e.target.value }))}
                  className="text-sm"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Fecha Inicio</label>
                <Input
                  type="date"
                  value={filters.start_date || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
                  className="text-sm"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Fecha Fin</label>
                <Input
                  type="date"
                  value={filters.end_date || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
                  className="text-sm"
                />
              </div>
            </div>
            
            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="h-3 w-3 mr-1" />
                  Limpiar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}