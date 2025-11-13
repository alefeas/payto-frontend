"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import { BackButton } from "@/components/ui/back-button"
import { Skeleton } from "@/components/ui/skeleton"
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
  const [allLogs, setAllLogs] = useState<AuditLog[]>([])
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
  const isInitialMount = useRef(true)

  const loadLogs = async (page: number = 1, currentFilters: AuditFiltersType = filters) => {
    try {
      setLoading(true)
      const response = await auditService.getCompanyAuditLogs(companyId, page, { ...currentFilters, per_page: 20 })
      setLogs(response.data)
      setCurrentPage(response.current_page)
      setTotalPages(response.total_pages)
      setTotalItems(response.total_items)
      setHasSearched(true)
      
      // Only update stats on first page load or filter change
      if (page === 1) {
        const uniqueActions = new Set(response.data.map(log => log.action)).size
        const actionBreakdown: Record<string, number> = {}
        response.data.forEach(log => {
          actionBreakdown[log.action] = (actionBreakdown[log.action] || 0) + 1
        })
        
        setStats({
          total_logs: response.total_items || 0,
          unique_actions: uniqueActions || 0,
          action_breakdown: actionBreakdown
        })
      }
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
  }

  useEffect(() => {
    if (companyId && isInitialMount.current) {
      isInitialMount.current = false
      loadInitialData()
    }
  }, [companyId])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      // Load first page to get all available actions
      const response = await auditService.getCompanyAuditLogs(companyId, 1, { per_page: 100 })
      const allActions = [...new Set(response.data.map(log => log.action))].sort()
      setAvailableActions(allActions)
      
      // Now load with actual filters
      await loadLogs(1, filters)
    } catch (error) {
      console.error('Error loading initial data:', error)
      await loadLogs(1, filters)
    }
  }

  const handleFiltersChange = (newFilters: AuditFiltersType) => {
    setFilters(newFilters)
    setCurrentPage(1)
    loadLogs(1, newFilters)
  }

  const handleSearch = (query: string, searchFilters: AuditFiltersType) => {
    setFilters(searchFilters)
    setCurrentPage(1)
    loadLogs(1, searchFilters)
  }

  const resetFilters = () => {
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
  }

  const handlePageChange = (page: number) => {
    loadLogs(page, filters)
  }

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
    } catch (error: any) {
      console.error('Error exporting audit logs:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Error al exportar el archivo CSV'
      toast.error('Error al exportar', {
        description: errorMsg
      })
    } finally {
      setIsExporting(false)
    }
  }, [companyId, filters])



  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {loading ? (
          <>
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-5 w-96" />
              </div>
            </div>
            <AuditLoadingSkeleton />
          </>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <BackButton href={`/company/${companyId}`} />
              <div className="flex-1">
                <h1 className="text-3xl font-bold">Registro de Auditoría</h1>
                <p className="text-muted-foreground">Monitoree todas las actividades realizadas en su empresa</p>
              </div>
            </div>

            {stats && <AuditDashboardStats companyId={companyId} stats={stats} />}

            <AuditFilters
              companyId={companyId}
              onFiltersChange={handleFiltersChange}
              onExport={handleExport}
              availableActions={availableActions}
              isLoading={isExporting}
            />

            {logs.length === 0 ? (
              hasSearched ? (
                <AuditNoResults onResetFilters={resetFilters} />
              ) : (
                <AuditNoLogs />
              )
            ) : (
              <>
                <AuditLogsTable
                  logs={logs}
                  isLoading={false}
                />

                <AuditPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={20}
                  onPageChange={handlePageChange}
                  isLoading={false}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
