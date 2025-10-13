import api from './api';

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

export const invoiceService = {
  async getInvoices(companyId: string) {
    const response = await api.get(`/companies/${companyId}/invoices`);
    return response.data;
  },

  async getInvoice(companyId: string, invoiceId: string) {
    const response = await api.get(`/companies/${companyId}/invoices/${invoiceId}`);
    return response.data;
  },

  async createInvoice(companyId: string, data: CreateInvoiceData) {
    const response = await api.post(`/companies/${companyId}/invoices`, data);
    return response.data;
  },

  async deleteInvoice(companyId: string, invoiceId: string) {
    const response = await api.delete(`/companies/${companyId}/invoices/${invoiceId}`);
    return response.data;
  },
};
