"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { AuditDashboardStats } from '@/components/audit/audit-dashboard-stats'
import { AuditFilters } from "@/components/audit/audit-filters"
import { AuditLogsTable } from "@/components/audit/audit-logs-table"
import { AuditPagination } from "@/components/audit/audit-pagination"
import { AuditSearchAdvanced } from "@/components/audit/audit-search-advanced"
import { AuditLoadingSkeleton } from "@/components/audit/audit-skeletons"
import { AuditNoResults, AuditNoLogs } from "@/components/audit/audit-empty-state"
import { auditService, AuditLog, AuditFilters as AuditFiltersType } from "@/services/audit.service"
import { toast } from "sonner"

export default function AuditLogPage() {
  const params = useParams()
  const companyId = params.id as string
  
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [filters, setFilters] = useState<AuditFiltersType>({
    action: '',
    entity_type: '',
    entity_id: '',
    user_id: '',
    start_date: '',
    end_date: ''
  })
  const [hasSearched, setHasSearched] = useState(false)
  const [availableActions, setAvailableActions] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)

  const loadLogs = useCallback(async (page: number = 1, currentFilters: AuditFiltersType = filters) => {
    try {
      setLoading(true)
      const response = await auditService.getCompanyAuditLogs(companyId, page, currentFilters)
      setLogs(response.data)
      setCurrentPage(response.current_page)
      setTotalPages(response.total_pages)
      setTotalItems(response.total_items)
      setHasSearched(true)
      
      // Extraer acciones únicas de los logs
      const actions = [...new Set(response.data.map(log => log.action))].sort()
      setAvailableActions(actions)
    } catch (error: any) {
      console.error('Error loading audit logs:', error)
      if (error.message?.includes('timeout')) {
        toast.error('Tiempo de espera agotado. Por favor, intente nuevamente.')
      } else if (error.response?.status === 500) {
        toast.error('Error del servidor. Por favor, intente más tarde.')
      } else {
        toast.error('No se pudieron cargar los registros de auditoría')
      }
    } finally {
      setLoading(false)
    }
  }, [companyId, filters])

  const loadStats = useCallback(async (currentFilters: AuditFiltersType = filters) => {
    try {
      const statsData = await auditService.getCompanyAuditStats(companyId, currentFilters)
      setStats(statsData)
    } catch (error: any) {
      console.error('Error loading audit stats:', error)
      if (error.message?.includes('timeout')) {
        toast.error('Tiempo de espera agotado al cargar estadísticas')
      }
    }
  }, [companyId, filters])

  useEffect(() => {
    loadLogs(1, filters)
    loadStats(filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId])

  const handleFiltersChange = useCallback((newFilters: AuditFiltersType) => {
    setFilters(newFilters)
    setCurrentPage(1)
    loadLogs(1, newFilters)
    loadStats(newFilters)
  }, [companyId])

  const handleSearch = useCallback((query: string, searchFilters: AuditFiltersType) => {
    setFilters(searchFilters)
    setCurrentPage(1)
    loadLogs(1, searchFilters)
    loadStats(searchFilters)
  }, [companyId])

  const resetFilters = useCallback(() => {
    const reset = {
      action: '',
      entity_type: '',
      entity_id: '',
      user_id: '',
      start_date: '',
      end_date: ''
    }
    setFilters(reset)
    setCurrentPage(1)
    loadLogs(1, reset)
    loadStats(reset)
  }, [companyId])

  const handlePageChange = useCallback((page: number) => {
    loadLogs(page, filters)
  }, [filters])

  const handleExport = useCallback(async () => {
    try {
      setIsExporting(true)
      const csvBlob = await auditService.exportAuditLogsToCsv(companyId, filters)
      
      // Crear nombre de archivo con fecha y filtros
      const timestamp = new Date().toISOString().split('T')[0]
      let filename = `auditoria_${timestamp}`
      
      if (filters.action) filename += `_accion_${filters.action}`
      if (filters.entity_type) filename += `_entidad_${filters.entity_type}`
      if (filters.start_date) filename += `_desde_${filters.start_date}`
      if (filters.end_date) filename += `_hasta_${filters.end_date}`
      
      filename += '.csv'
      
      // Download the blob
      const url = window.URL.createObjectURL(csvBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Archivo CSV exportado correctamente')
    } catch (error) {
      console.error('Error exporting audit logs:', error)
      toast.error('Error al exportar el archivo CSV')
    } finally {
      setIsExporting(false)
    }
  }, [companyId, filters])

  const handleViewTrail = useCallback((log: AuditLog) => {
    if (log.entityType && log.entityId) {
      // Aquí podrías abrir un modal o redirigir a una vista de trail
      toast.info(`Mostrando trail para ${log.entityType} ${log.entityId}`)
    }
  }, [])

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Registro de Auditoría</h1>
        <p className="text-gray-600">Monitoree todas las actividades realizadas en su empresa</p>
      </div>

      <AuditDashboardStats companyId={companyId} />

      <div className="mb-6">
        <AuditFilters
          companyId={companyId}
          onFiltersChange={handleFiltersChange}
          onExport={handleExport}
          availableActions={availableActions}
          isLoading={loading || isExporting}
        />
      </div>

      {loading ? (
        <AuditLoadingSkeleton />
      ) : logs.length === 0 ? (
        hasSearched ? (
          <AuditNoResults onResetFilters={resetFilters} />
        ) : (
          <AuditNoLogs />
        )
      ) : (
        <>
          <div className="mb-6">
            <AuditLogsTable
              logs={logs}
              isLoading={loading}
              onViewTrail={handleViewTrail}
            />
          </div>

          {totalPages > 1 && (
            <AuditPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={10}
              onPageChange={handlePageChange}
              isLoading={loading}
            />
          )}
        </>
      )}
    </div>
  )
}
