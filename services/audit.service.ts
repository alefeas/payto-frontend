import apiClient from '@/lib/api-client'

export interface AuditLog {
  id: string
  companyId: string
  userId: string
  action: string
  entityType: string | null
  entityId: string | null
  description: string
  metadata: Record<string, any> | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  updatedAt: string
  formattedDate: string
  relativeTime: string
  user: {
    id: string
    name: string
    email: string
  }
}

export interface AuditLogsResponse {
  data: AuditLog[]
  current_page: number
  total_pages: number
  total_items: number
  per_page: number
}

export interface AuditStats {
  total_logs: number
  unique_actions: number
  unique_users: number
  action_breakdown: Record<string, number>
}

export interface AuditFilters {
  action?: string
  entity_type?: string
  entity_id?: string
  user_id?: string
  start_date?: string
  end_date?: string
  ip_address?: string
  description?: string
  per_page?: number
}

export const auditService = {
  async getCompanyAuditLogs(
    companyId: string, 
    page: number = 1, 
    filters: AuditFilters = {}
  ): Promise<AuditLogsResponse> {
    try {
      const response = await apiClient.get(`/companies/${companyId}/audit-logs`, {
        params: { 
          page, 
          per_page: filters.per_page || 50,
          ...filters 
        },
        timeout: 30000
      })
      const result = response.data.data
      return {
        data: result.data,
        current_page: result.pagination.currentPage,
        total_pages: result.pagination.lastPage,
        total_items: result.pagination.total,
        per_page: result.pagination.perPage
      }
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Tiempo de espera agotado. Por favor, intente nuevamente.')
      }
      if (error.response?.status === 404) {
        return {
          data: [],
          current_page: 1,
          total_pages: 1,
          total_items: 0,
          per_page: 50
        }
      }
      throw error
    }
  },

  async getCompanyAuditStats(companyId: string, filters: AuditFilters = {}): Promise<AuditStats> {
    try {
      const response = await apiClient.get(`/companies/${companyId}/audit-logs/stats`, {
        params: filters,
        timeout: 30000 // 30 segundos timeout
      })
      return response.data.data
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Tiempo de espera agotado. Por favor, intente nuevamente.')
      }
      if (error.response?.status === 404) {
        // Retornar estadísticas vacías en lugar de error
        return {
          total_logs: 0,
          unique_actions: 0,
          unique_users: 0,
          action_breakdown: {}
        }
      }
      throw error
    }
  },

  async getEntityAuditLogs(
    companyId: string, 
    entityType: string, 
    entityId: string, 
    page: number = 1,
    perPage: number = 50
  ): Promise<AuditLogsResponse> {
    const response = await apiClient.get(`/companies/${companyId}/audit-logs/entity/${entityType}/${entityId}`, {
      params: { page, per_page: perPage }
    })
    return response.data.data
  },

  async getUserAuditLogs(
    companyId: string, 
    userId: string, 
    page: number = 1,
    perPage: number = 50
  ): Promise<AuditLogsResponse> {
    const response = await apiClient.get(`/companies/${companyId}/audit-logs/user/${userId}`, {
      params: { page, per_page: perPage }
    })
    return response.data.data
  },

  async getRecentAuditActivities(companyId: string, limit: number = 10): Promise<AuditLog[]> {
    const response = await apiClient.get(`/companies/${companyId}/audit-logs/recent`, {
      params: { limit }
    })
    return response.data.data
  },

  async getAuditTrail(
    companyId: string, 
    entityType: string, 
    entityId: string
  ): Promise<AuditLog[]> {
    const response = await apiClient.get(`/companies/${companyId}/audit-logs/trail/${entityType}/${entityId}`)
    return response.data.data
  },

  async exportAuditLogsToCsv(companyId: string, filters: AuditFilters = {}): Promise<Blob> {
    const response = await apiClient.get(`/companies/${companyId}/audit-logs/export`, {
      params: filters,
      responseType: 'blob'
    })
    return response.data
  }
}
