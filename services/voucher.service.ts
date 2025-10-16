import apiClient from '@/lib/api-client'

export interface VoucherType {
  code: string
  name: string
  category: string
  requires_association: boolean
  compatible_with?: string[]
}

export interface VoucherData {
  voucher_type: string
  client_id: string
  sales_point: number
  issue_date: string
  due_date?: string
  currency: string
  exchange_rate?: number
  notes?: string
  items: Array<{
    description: string
    quantity: number
    unit_price: number
    tax_rate: number
  }>
  related_invoice_id?: string
}

export const voucherService = {
  getAvailableTypes: async (companyId: string) => {
    const response = await apiClient.get(`/companies/${companyId}/vouchers/types`)
    return response.data
  },

  getCompatibleInvoices: async (companyId: string, voucherType: string) => {
    const response = await apiClient.get(
      `/companies/${companyId}/vouchers/compatible-invoices`,
      { params: { voucher_type: voucherType } }
    )
    return response.data.invoices
  },

  getInvoiceBalance: async (companyId: string, invoiceId: string) => {
    const response = await apiClient.get(
      `/companies/${companyId}/invoices/${invoiceId}/available-balance`
    )
    return response.data
  },

  createVoucher: async (companyId: string, data: VoucherData) => {
    const response = await apiClient.post(`/companies/${companyId}/vouchers`, data)
    return response.data
  },
}
