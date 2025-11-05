'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, FileSpreadsheet, Filter } from 'lucide-react'
import { auditService } from '@/services/audit.service'
import { toast } from 'sonner'

interface AuditExportButtonProps {
  companyId: string
  filters?: {
    action?: string
    entityType?: string
    entityId?: string
    userId?: string
    startDate?: string
    endDate?: string
  }
  className?: string
}

export function AuditExportButton({ companyId, filters = {}, className }: AuditExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      
      const csvContent = await auditService.exportAuditLogsToCsv(companyId, filters)
      
      // Crear blob y descargar
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `auditoria_${companyId}_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Exportación completada exitosamente')
    } catch (error) {
      console.error('Error exporting audit logs:', error)
      toast.error('Error al exportar los registros de auditoría')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant="outline"
      className={className}
    >
      {isExporting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
          Exportando...
        </>
      ) : (
        <>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar CSV
        </>
      )}
    </Button>
  )
}