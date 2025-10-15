import apiClient from '@/lib/api-client'

export interface Invoice {
  id: string
  number: string
  type: 'A' | 'B' | 'C' | 'E'
  sales_point: number
  voucher_number: number
  issue_date: string
  due_date: string
  subtotal: number
  total_taxes: number
  total_perceptions: number
  total: number
  status: string
  approvals_required: number
  approvals_received: number
  approval_date: string | null
  rejection_reason: string | null
  rejected_at: string | null
  issuerCompany?: {
    id: string
    name: string
    business_name: string
    national_id: string
  }
  receiverCompany?: {
    id: string
    name: string
    business_name: string
    national_id: string
  }
  client?: {
    id: string
    document_type: string
    document_number: string
    business_name: string | null
    first_name: string | null
    last_name: string | null
  }
  items?: InvoiceItem[]
  approvals?: InvoiceApproval[]
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  subtotal: number
  tax_rate: number
  tax_amount: number
}

export interface InvoiceApproval {
  id: string
  user: {
    id: string
    name: string
    email: string
  }
  notes: string | null
  approved_at: string
}

export const invoiceService = {
  async getInvoices(companyId: string, status?: string): Promise<{ data: Invoice[], total: number }> {
    const params = status ? { status } : {}
    const response = await apiClient.get(`/companies/${companyId}/invoices`, { params })
    return {
      data: response.data.data,
      total: response.data.total
    }
  },

  async getInvoice(companyId: string, invoiceId: string): Promise<Invoice> {
    const response = await apiClient.get(`/companies/${companyId}/invoices/${invoiceId}`)
    return response.data
  },

  async approveInvoice(companyId: string, invoiceId: string, notes?: string): Promise<void> {
    await apiClient.post(`/companies/${companyId}/invoices/${invoiceId}/approve`, { notes })
  },

  async rejectInvoice(companyId: string, invoiceId: string, reason: string): Promise<void> {
    await apiClient.post(`/companies/${companyId}/invoices/${invoiceId}/reject`, { reason })
  },

  async getApprovals(companyId: string, invoiceId: string): Promise<{
    approvals: InvoiceApproval[]
    approvals_received: number
    approvals_required: number
  }> {
    const response = await apiClient.get(`/companies/${companyId}/invoices/${invoiceId}/approvals`)
    return response.data.data
  }
}
