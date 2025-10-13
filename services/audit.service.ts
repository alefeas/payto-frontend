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
  user: {
    id: string
    name: string
    email: string
  }
}

export interface AuditLogsResponse {
  data: AuditLog[]
  pagination: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
  }
}

export const auditService = {
  async getCompanyAuditLogs(companyId: string, page: number = 1, perPage: number = 50): Promise<AuditLogsResponse> {
    const response = await apiClient.get(`/companies/${companyId}/audit-logs`, {
      params: { page, per_page: perPage }
    })
    return response.data.data
  }
}
