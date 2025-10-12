import apiClient from '@/lib/api-client';

export interface Company {
  id: string;
  name: string;
  businessName?: string;
  nationalId: string;
  phone?: string;
  address?: string;
  taxCondition: string;
  defaultSalesPoint: number;
  isActive: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyData {
  name: string;
  business_name?: string;
  national_id: string;
  phone?: string;
  tax_condition: string;
  default_sales_point?: number;
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
};
