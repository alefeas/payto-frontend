import apiClient from '@/lib/api-client';

export interface Company {
  id: string;
  uniqueId?: string;
  name: string;
  businessName?: string;
  business_name?: string;
  nationalId: string;
  national_id?: string;
  phone?: string;
  addressData?: {
    street?: string;
    streetNumber?: string;
    floor?: string;
    apartment?: string;
    postalCode?: string;
    province?: string;
    city?: string;
  };
  taxCondition?: string;
  tax_condition?: string;
  defaultSalesPoint?: number;
  default_sales_point?: number;
  lastInvoiceNumber?: number;
  defaultVat?: number;
  vatPerception?: number;
  grossIncomePerception?: number;
  socialSecurityPerception?: number;
  vatRetention?: number;
  incomeTaxRetention?: number;
  grossIncomeRetention?: number;
  socialSecurityRetention?: number;
  isActive?: boolean;
  inviteCode?: string;
  role?: string;
  verificationStatus?: 'unverified' | 'verified';
  verification_status?: 'unverified' | 'verified';
  verifiedAt?: string;
  verified_at?: string;
  requiredApprovals?: number;
  required_approvals?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCompanyData {
  name: string;
  business_name?: string;
  national_id: string;
  phone?: string;
  default_sales_point?: number;
  last_invoice_number?: number;
  deletion_code: string;
  street: string;
  street_number: string;
  floor?: string;
  apartment?: string;
  postal_code: string;
  province: string;
}

export const companyService = {
  async getCompanies(): Promise<Company[]> {
    const response = await apiClient.get<{ success: boolean; data: Company[] }>('/companies');
    return response.data.data;
  },

  async getCompanyById(id: string): Promise<Company> {
    const response = await apiClient.get<{ success: boolean; data: Company }>(`/companies/${id}`);
    return response.data.data;
  },

  async createCompany(data: CreateCompanyData): Promise<Company> {
    const response = await apiClient.post<{ success: boolean; data: Company }>('/companies', data);
    return response.data.data;
  },

  async joinCompany(inviteCode: string): Promise<Company> {
    const response = await apiClient.post<{ success: boolean; data: Company }>('/companies/join', {
      invite_code: inviteCode,
    });
    return response.data.data;
  },

  async updateCompany(id: string, data: any): Promise<Company> {
    const response = await apiClient.put<{ success: boolean; data: Company }>(`/companies/${id}`, data);
    return response.data.data;
  },

  async regenerateInviteCode(id: string): Promise<{ inviteCode: string }> {
    const response = await apiClient.post<{ success: boolean; data: { inviteCode: string } }>(`/companies/${id}/regenerate-invite`);
    return response.data.data;
  },

  async deleteCompany(id: string, deletionCode: string): Promise<void> {
    await apiClient.delete(`/companies/${id}`, {
      data: { deletion_code: deletionCode }
    });
  },

  // Alias for getCompanyById
  async getCompany(id: string): Promise<Company> {
    return this.getCompanyById(id);
  },
};
