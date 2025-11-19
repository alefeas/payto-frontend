import apiClient from '@/lib/api-client'

export const accountsReceivableService = {
  async getInvoices(companyId: string, filters?: {
    search?: string
    from_date?: string
    to_date?: string
    page?: number
  }): Promise<{ data: any[], pagination: any }> {
    const params: any = {}
    if (filters?.search) params.search = filters.search
    if (filters?.from_date) params.from_date = filters.from_date
    if (filters?.to_date) params.to_date = filters.to_date
    if (filters?.page) params.page = filters.page
    
    const response = await apiClient.get(`/companies/${companyId}/accounts-receivable/invoices`, { params })
    return {
      data: response.data.data || [],
      pagination: response.data.pagination || {}
    }
  },

  async getBalances(companyId: string): Promise<{
    credit_notes: Array<{
      id: string
      type: string
      number: string
      voucher_number: string
      issue_date: string
      due_date: string
      client_name: string
      total: number
      collected_amount: number
      pending_amount: number
      balance_type: 'credit' | 'debit'
      description: string
    }>
    debit_notes: Array<{
      id: string
      type: string
      number: string
      voucher_number: string
      issue_date: string
      due_date: string
      client_name: string
      total: number
      collected_amount: number
      pending_amount: number
      balance_type: 'credit' | 'debit'
      description: string
    }>
    summary: {
      total_credits: number
      total_debits: number
      net_balance: number
      net_balance_type: 'credit' | 'debit'
    }
  }> {
    const response = await apiClient.get(`/companies/${companyId}/accounts-receivable/balances`)
    return response.data.data
  }
}


