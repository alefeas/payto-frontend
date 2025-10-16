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
  getSummary: async (companyId: string, period: 'month' | 'quarter' | 'year' | 'custom' = 'month', startDate?: string, endDate?: string): Promise<AnalyticsSummary> => {
    let url = `/companies/${companyId}/analytics/summary?period=${period}`
    if (period === 'custom' && startDate && endDate) {
      url += `&start_date=${startDate}&end_date=${endDate}`
    }
    const response = await apiClient.get(url)
    return response.data
  },

  getRevenueTrend: async (companyId: string, period: 'month' | 'quarter' | 'year' | 'custom' = 'month', startDate?: string, endDate?: string): Promise<RevenueTrend[]> => {
    let url = `/companies/${companyId}/analytics/revenue-trend?period=${period}`
    if (period === 'custom' && startDate && endDate) {
      url += `&start_date=${startDate}&end_date=${endDate}`
    }
    const response = await apiClient.get(url)
    return response.data
  },

  getTopClients: async (companyId: string, period: 'month' | 'quarter' | 'year' | 'custom' = 'month', startDate?: string, endDate?: string): Promise<TopClient[]> => {
    let url = `/companies/${companyId}/analytics/top-clients?period=${period}`
    if (period === 'custom' && startDate && endDate) {
      url += `&start_date=${startDate}&end_date=${endDate}`
    }
    const response = await apiClient.get(url)
    return response.data
  },

  getPendingInvoices: async (companyId: string): Promise<PendingInvoices> => {
    const response = await apiClient.get(`/companies/${companyId}/analytics/pending-invoices`)
    return response.data
  }
}
