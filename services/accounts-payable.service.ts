import apiClient from '@/lib/api-client'

export interface AccountsPayableDashboard {
  summary: {
    total_payable: number
    total_paid: number
    total_pending: number
    overdue_count: number
    overdue_amount: number
    upcoming_count: number
    upcoming_amount: number
  }
  overdue_invoices: Array<{
    id: string
    supplier: string
    voucher_number: string
    due_date: string
    days_overdue: number
    pending_amount: number
  }>
  upcoming_invoices: Array<{
    id: string
    supplier: string
    voucher_number: string
    due_date: string
    days_until_due: number
    pending_amount: number
  }>
  by_supplier: Array<{
    supplier_id: string
    supplier_name: string
    invoice_count: number
    total_pending: number
  }>
  recent_payments: Array<{
    id: string
    date: string
    supplier: string
    amount: number
    retentions: number
    net_paid: number
    method: string
    status: string
  }>
}

export interface PayableInvoice {
  id: string
  voucher_type: string
  voucher_number: string
  supplier: {
    id: string
    name: string
    cuit: string
  }
  issue_date: string
  due_date: string
  total_amount: number
  paid_amount: number
  pending_amount: number
  payment_status: string
  days_until_due: number | null
  payments_count: number
}

export interface Retention {
  type: string
  name: string
  rate: number
  base_amount: number
  amount: number
  certificate_number?: string
}

export interface Payment {
  id: string
  invoice_id: string
  voucher_number: string
  supplier: {
    id: string
    name: string
  }
  amount: number
  retentions: Array<{
    type: string
    name: string
    amount: number
  }>
  total_retentions: number
  net_paid: number
  payment_date: string
  payment_method: string
  reference_number: string | null
  status: string
  registered_by: string | null
}

export const accountsPayableService = {
  async getDashboard(companyId: string): Promise<AccountsPayableDashboard> {
    const response = await apiClient.get(`/companies/${companyId}/accounts-payable/dashboard`)
    return response.data.data
  },

  async getInvoices(companyId: string, filters?: {
    supplier_id?: string
    payment_status?: string
    from_date?: string
    to_date?: string
    overdue?: boolean
    search?: string
    page?: number
  }): Promise<{ data: PayableInvoice[], pagination: any }> {
    const response = await apiClient.get(`/companies/${companyId}/accounts-payable/invoices`, { params: filters })
    return {
      data: response.data.data || [],
      pagination: response.data.pagination || {}
    }
  },

  async getSupplierSummary(companyId: string, supplierId: string) {
    const response = await apiClient.get(`/companies/${companyId}/accounts-payable/suppliers/${supplierId}`)
    return response.data.data
  },

  async getPayments(companyId: string, filters?: {
    status?: string
    from_date?: string
    to_date?: string
    page?: number
  }): Promise<{ data: Payment[], pagination: any }> {
    const response = await apiClient.get(`/companies/${companyId}/supplier-payments`, { params: filters })
    return {
      data: response.data.data || [],
      pagination: response.data.pagination || {}
    }
  },

  async registerPayment(companyId: string, data: {
    invoice_id: string
    amount: number
    payment_date: string
    payment_method: string
    reference_number?: string
    notes?: string
    retentions?: Retention[]
  }): Promise<Payment> {
    const response = await apiClient.post(`/companies/${companyId}/supplier-payments`, data)
    return response.data.data
  },

  async calculateRetentions(companyId: string, invoiceId: string): Promise<{
    retentions: Retention[]
    total_retentions: number
    is_retention_agent: boolean
  }> {
    const response = await apiClient.get(`/companies/${companyId}/supplier-payments/invoices/${invoiceId}/calculate-retentions`)
    return response.data.data
  },

  async confirmPayment(companyId: string, paymentId: string): Promise<Payment> {
    const response = await apiClient.post(`/companies/${companyId}/supplier-payments/${paymentId}/confirm`)
    return response.data.data
  },

  async generatePaymentTxt(companyId: string, invoiceIds: string[]): Promise<Blob> {
    const response = await apiClient.post(`/companies/${companyId}/accounts-payable/generate-txt`, 
      { invoice_ids: invoiceIds },
      { responseType: 'blob' }
    )
    return response.data
  },

  async getDefaultRetentions(companyId: string): Promise<{ is_retention_agent: boolean, auto_retentions: Array<{ type: string, name: string, rate: number, baseType: string }> }> {
    const response = await apiClient.get(`/companies/${companyId}/accounts-payable/default-retentions`)
    return response.data.data
  }
}
