import apiClient from '@/lib/api-client';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
}

export interface CreateInvoiceData {
  client_id: string;
  invoice_type: 'A' | 'B' | 'C' | 'E';
  sales_point: number;
  issue_date: string;
  due_date?: string;
  currency?: string;
  exchange_rate?: number;
  notes?: string;
  items: InvoiceItem[];
}

export interface Invoice {
  id: string;
  number: string;
  type: string;
  sales_point: number;
  voucher_number: number;
  issuer_company_id: string;
  client_id: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  total_taxes: number;
  total: number;
  currency: string;
  status: string;
  afip_cae?: string;
  afip_cae_due_date?: string;
  afip_status: string;
  afip_error_message?: string;
  notes?: string;
  client?: any;
  items?: any[];
}

export interface ValidateAfipData {
  issuer_cuit: string;
  invoice_type: 'A' | 'B' | 'C' | 'E';
  invoice_number: string;
}

export interface AfipInvoiceData {
  found: boolean;
  cae: string;
  cae_expiration: string;
  issue_date: string;
  doc_type: number;
  doc_number: string;
  subtotal: number;
  total_taxes: number;
  total_perceptions: number;
  total: number;
  currency: string;
  exchange_rate: number;
  result: string;
}

export interface InvoiceAttachment {
  path: string;
  original_name: string;
  url: string;
}

export const invoiceService = {
  async getInvoices(companyId: string) {
    const response = await apiClient.get(`/companies/${companyId}/invoices`);
    return response.data;
  },

  async getInvoice(companyId: string, invoiceId: string) {
    const response = await apiClient.get(`/companies/${companyId}/invoices/${invoiceId}`);
    return response.data;
  },

  async createInvoice(companyId: string, data: CreateInvoiceData) {
    const response = await apiClient.post(`/companies/${companyId}/invoices`, data);
    return response.data;
  },

  async validateWithAfip(companyId: string, data: ValidateAfipData) {
    const response = await apiClient.post(`/companies/${companyId}/invoices/validate-afip`, data);
    return response.data;
  },

  async cancelInvoice(companyId: string, invoiceId: string) {
    const response = await apiClient.post(`/companies/${companyId}/invoices/${invoiceId}/cancel`);
    return response.data;
  },

  async deleteInvoice(companyId: string, invoiceId: string) {
    const response = await apiClient.delete(`/companies/${companyId}/invoices/${invoiceId}`);
    return response.data;
  },

  async uploadAttachment(companyId: string, invoiceId: string, file: File) {
    const formData = new FormData();
    formData.append('attachment', file);
    const response = await apiClient.post(`/companies/${companyId}/invoices/${invoiceId}/attachment`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async downloadAttachment(companyId: string, invoiceId: string) {
    const response = await apiClient.get(`/companies/${companyId}/invoices/${invoiceId}/attachment`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async deleteAttachment(companyId: string, invoiceId: string) {
    const response = await apiClient.delete(`/companies/${companyId}/invoices/${invoiceId}/attachment`);
    return response.data;
  },
};
