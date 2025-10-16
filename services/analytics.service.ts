import apiClient from '@/lib/api-client'

export interface AnalyticsSummary {
  period: {
    start: string
    end: string
    month: string
  }
  sales: {
    total: number
    count: number
    average: number
  }
  purchases: {
    total: number
    count: number
    average: number
  }
  balance: number
}

export interface RevenueTrend {
  month: string
  sales: number
  purchases: number
  balance: number
}

export interface TopClient {
  client_id: string
  client_name: string
  total_amount: number
  invoice_count: number
}

export interface PendingInvoices {
  to_collect: number
  to_pay: number
  pending_approvals: number
}

export const analyticsService = {
  getSummary: async (companyId: string): Promise<AnalyticsSummary> => {
    const response = await apiClient.get(`/companies/${companyId}/analytics/summary`)
    return response.data
  },

  getRevenueTrend: async (companyId: string): Promise<RevenueTrend[]> => {
    const response = await apiClient.get(`/companies/${companyId}/analytics/revenue-trend`)
    return response.data
  },

  getTopClients: async (companyId: string): Promise<TopClient[]> => {
    const response = await apiClient.get(`/companies/${companyId}/analytics/top-clients`)
    return response.data
  },

  getPendingInvoices: async (companyId: string): Promise<PendingInvoices> => {
    const response = await apiClient.get(`/companies/${companyId}/analytics/pending-invoices`)
    return response.data
  }
}
