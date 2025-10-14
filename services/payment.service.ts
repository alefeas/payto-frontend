import apiClient from '@/lib/api-client'

export interface InvoicePayment {
  id: string
  invoiceId: string
  amount: number
  paymentDate: string
  paymentMethod: 'transfer' | 'cash' | 'check' | 'debit_card' | 'credit_card' | 'mercadopago' | 'other'
  reference?: string
  notes?: string
  createdBy?: string
  creatorName?: string
  createdAt: string
  updatedAt: string
}

export interface CreatePaymentData {
  amount: number
  payment_date: string
  payment_method: 'transfer' | 'cash' | 'check' | 'debit_card' | 'credit_card' | 'mercadopago' | 'other'
  reference?: string
  notes?: string
}

export interface PaymentSummary {
  payments: InvoicePayment[]
  total_paid: number
  remaining_amount: number
}

export const paymentService = {
  async getInvoicePayments(companyId: string, invoiceId: string): Promise<PaymentSummary> {
    const response = await apiClient.get(`/companies/${companyId}/invoices/${invoiceId}/payments`)
    return {
      payments: response.data.data.payments.map((p: any) => ({
        id: p.id,
        invoiceId: p.invoice_id,
        amount: parseFloat(p.amount),
        paymentDate: p.payment_date,
        paymentMethod: p.payment_method,
        reference: p.reference,
        notes: p.notes,
        createdBy: p.created_by,
        creatorName: p.creator?.name,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      })),
      total_paid: parseFloat(response.data.data.total_paid),
      remaining_amount: parseFloat(response.data.data.remaining_amount),
    }
  },

  async createPayment(companyId: string, invoiceId: string, data: CreatePaymentData): Promise<InvoicePayment> {
    const response = await apiClient.post(`/companies/${companyId}/invoices/${invoiceId}/payments`, data)
    const p = response.data.data
    return {
      id: p.id,
      invoiceId: p.invoice_id,
      amount: parseFloat(p.amount),
      paymentDate: p.payment_date,
      paymentMethod: p.payment_method,
      reference: p.reference,
      notes: p.notes,
      createdBy: p.created_by,
      creatorName: p.creator?.name,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }
  },

  async deletePayment(companyId: string, invoiceId: string, paymentId: string): Promise<void> {
    await apiClient.delete(`/companies/${companyId}/invoices/${invoiceId}/payments/${paymentId}`)
  },
}
