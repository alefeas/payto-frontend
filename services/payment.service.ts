import apiClient from '@/lib/api-client';

export interface InvoicePayment {
  id: number;
  company_id: string;
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method: 'transfer' | 'check' | 'cash' | 'card';
  reference_number?: string;
  attachment_url?: string;
  notes?: string;
  status: 'pending' | 'in_process' | 'confirmed' | 'cancelled';
  registered_by: string;
  registered_at: string;
  confirmed_by?: string;
  confirmed_at?: string;
  created_at: string;
  updated_at: string;
  invoice?: any;
  registered_by_user?: any;
  confirmed_by_user?: any;
}

export interface CreatePaymentData {
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method: 'transfer' | 'check' | 'cash' | 'card';
  reference_number?: string;
  attachment_url?: string;
  notes?: string;
  status?: 'pending' | 'in_process' | 'confirmed' | 'cancelled';
}

export interface UpdatePaymentData {
  amount?: number;
  payment_date?: string;
  payment_method?: 'transfer' | 'check' | 'cash' | 'card';
  reference_number?: string;
  attachment_url?: string;
  notes?: string;
}

export interface GenerateTxtResponse {
  content: string;
  filename: string;
}

class PaymentService {
  async getPayments(companyId: string, status?: string): Promise<InvoicePayment[]> {
    const params = status ? { status } : {};
    const response = await apiClient.get(`/companies/${companyId}/payments`, { params });
    return response.data;
  }

  async createPayment(companyId: string, data: CreatePaymentData): Promise<InvoicePayment> {
    const response = await apiClient.post(`/companies/${companyId}/payments`, data);
    return response.data;
  }

  async updatePayment(companyId: string, paymentId: number, data: UpdatePaymentData): Promise<InvoicePayment> {
    const response = await apiClient.put(`/companies/${companyId}/payments/${paymentId}`, data);
    return response.data;
  }

  async deletePayment(companyId: string, paymentId: number): Promise<void> {
    await apiClient.delete(`/companies/${companyId}/payments/${paymentId}`);
  }

  async confirmPayment(companyId: string, paymentId: number): Promise<InvoicePayment> {
    const response = await apiClient.post(`/companies/${companyId}/payments/${paymentId}/confirm`);
    return response.data;
  }

  async generateTxt(companyId: string, paymentIds: number[]): Promise<GenerateTxtResponse> {
    const response = await apiClient.post(`/companies/${companyId}/payments/generate-txt`, {
      payment_ids: paymentIds
    });
    return response.data;
  }
}

export default new PaymentService();
