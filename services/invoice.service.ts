import apiClient from '@/lib/api-client'

export interface Invoice {
  id: string
  number: string
  type: 'A' | 'B' | 'C' | 'E' | 'M' | 'NCA' | 'NCB' | 'NCC' | 'NCM' | 'NDA' | 'NDB' | 'NDC' | 'NDM'
  sales_point: number
  voucher_number: number
  concept: 'products' | 'services' | 'products_services'
  service_date_from?: string | null
  service_date_to?: string | null
  issue_date: string
  due_date: string
  subtotal: number
  total_taxes: number
  total_perceptions: number
  total: number
  currency: string
  exchange_rate: number
  notes?: string | null
  status: string
  afip_status?: string
  afip_cae?: string | null
  afip_cae_due_date?: string | null
  approvals_required: number
  approvals_received: number
  approval_date: string | null
  rejection_reason: string | null
  rejected_at: string | null
  direction?: 'issued' | 'received'
  pdf_url?: string | null
  afip_txt_url?: string | null
  attachment_path?: string | null
  attachment_original_name?: string | null
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
    email: string | null
    phone: string | null
    tax_condition?: string
  }
  supplier?: {
    id: string
    document_type: string
    document_number: string
    business_name: string | null
    first_name: string | null
    last_name: string | null
    email: string | null
    phone: string | null
    bank_cbu: string | null
    bank_alias: string | null
    tax_condition?: string
  }
  items?: InvoiceItem[]
  perceptions?: InvoicePerception[]
  approvals?: InvoiceApproval[]
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  discount_percentage?: number
  subtotal: number
  tax_rate: number
  tax_amount: number
  order_index?: number
}

export interface InvoicePerception {
  id: string
  type: string
  name: string
  rate: number
  base_type: 'net' | 'total' | 'vat'
  base_amount: number
  amount: number
  jurisdiction?: string | null
}

export interface InvoiceApproval {
  id: string
  user: {
    id: string
    name: string
    first_name?: string
    last_name?: string
    email: string
  }
  notes: string | null
  approved_at: string
}

export const invoiceService = {
  async getInvoices(companyId: string, page: number = 1, filters?: {
    status?: string
    search?: string
    type?: string
    client?: string
    date_from?: string
    date_to?: string
  }): Promise<{ data: Invoice[], total: number, last_page: number, current_page: number }> {
    const params: any = { page }
    if (filters?.status && filters.status !== 'all') params.status = filters.status
    if (filters?.search) params.search = filters.search
    if (filters?.type && filters.type !== 'all') params.type = filters.type
    if (filters?.client && filters.client !== 'all') params.client = filters.client
    if (filters?.date_from) params.date_from = filters.date_from
    if (filters?.date_to) params.date_to = filters.date_to
    const response = await apiClient.get(`/companies/${companyId}/invoices`, { params })
    return {
      data: response.data.data || response.data,
      total: response.data.total || response.data.length,
      last_page: response.data.last_page || 1,
      current_page: response.data.current_page || 1
    }
  },

  async getInvoice(companyId: string, invoiceId: string): Promise<Invoice> {
    const response = await apiClient.get(`/companies/${companyId}/invoices/${invoiceId}`)
    return response.data
  },

  async approveInvoice(companyId: string, invoiceId: string, notes?: string): Promise<{
    approvals_received: number
    approvals_required: number
    is_approved: boolean
  }> {
    const response = await apiClient.post(`/companies/${companyId}/invoices/${invoiceId}/approve`, { notes })
    return response.data.data
  },

  async rejectInvoice(companyId: string, invoiceId: string, reason: string): Promise<void> {
    const response = await apiClient.post(`/companies/${companyId}/invoices/${invoiceId}/reject`, { reason })
    return response.data
  },

  async getApprovals(companyId: string, invoiceId: string): Promise<{
    approvals: InvoiceApproval[]
    approvals_received: number
    approvals_required: number
  }> {
    const response = await apiClient.get(`/companies/${companyId}/invoices/${invoiceId}/approvals`)
    return response.data.data
  },

  async createInvoice(companyId: string, data: any): Promise<any> {
    const response = await apiClient.post(`/companies/${companyId}/invoices`, data)
    return response.data
  },

  async createReceivedInvoice(companyId: string, data: any): Promise<any> {
    const response = await apiClient.post(`/companies/${companyId}/invoices/received`, data)
    return response.data
  },

  async validateWithAfip(companyId: string, data: { issuer_cuit: string, invoice_type: string, invoice_number: string }): Promise<any> {
    const response = await apiClient.post(`/companies/${companyId}/invoices/validate-afip`, data)
    return response.data
  },

  async archiveInvoice(companyId: string, invoiceId: string): Promise<void> {
    await apiClient.post(`/companies/${companyId}/invoices/${invoiceId}/archive`)
  },

  async getNextNumber(companyId: string, salesPoint: number, invoiceType: string): Promise<{
    last_number: number
    next_number: number
    formatted_number: string
  }> {
    const response = await apiClient.get(`/companies/${companyId}/invoices/next-number`, {
      params: { sales_point: salesPoint, invoice_type: invoiceType }
    })
    return response.data
  },

  async downloadPDF(companyId: string, invoiceId: string): Promise<Blob> {
    const response = await apiClient.get(`/companies/${companyId}/invoices/${invoiceId}/pdf`, {
      responseType: 'blob'
    })
    return response.data
  },

  async downloadTXT(companyId: string, invoiceId: string): Promise<Blob> {
    const response = await apiClient.get(`/companies/${companyId}/invoices/${invoiceId}/txt`, {
      responseType: 'blob'
    })
    return response.data
  },

  async downloadBulk(companyId: string, invoiceIds: string[], format: 'pdf' | 'txt'): Promise<Blob> {
    const response = await apiClient.post(`/companies/${companyId}/invoices/download-bulk`, {
      invoice_ids: invoiceIds,
      format
    }, {
      responseType: 'blob'
    })
    return response.data
  },

  async syncFromAfip(companyId: string, data: any): Promise<{
    success: boolean
    imported_count: number
    summary?: any[]
    invoices: any[]
    date_from?: string
    date_to?: string
  }> {
    const response = await apiClient.post(`/companies/${companyId}/invoices/sync-from-afip`, data, {
      timeout: 600000 // 10 minutos
    })
    return response.data
  },

  async deleteInvoice(companyId: string, invoiceId: string): Promise<void> {
    await apiClient.delete(`/companies/${companyId}/invoices/${invoiceId}`)
  },

  async deleteAllInvoices(companyId: string): Promise<void> {
    await apiClient.delete(`/companies/${companyId}/invoices/delete-all`)
  },

  async uploadAttachment(companyId: string, invoiceId: string, file: File): Promise<void> {
    const formData = new FormData()
    formData.append('attachment', file)
    await apiClient.post(`/companies/${companyId}/invoices/${invoiceId}/attachment`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  async deleteAttachment(companyId: string, invoiceId: string): Promise<void> {
    await apiClient.delete(`/companies/${companyId}/invoices/${invoiceId}/attachment`)
  },

  async downloadAttachment(companyId: string, invoiceId: string): Promise<Blob> {
    const response = await apiClient.get(`/companies/${companyId}/invoices/${invoiceId}/attachment`, {
      responseType: 'blob'
    })
    return response.data
  }
}
