import apiClient from '@/lib/api-client';
import { invalidateCompanyCache } from '@/lib/api-client';
import { Company as BaseCompany, ApiResponse } from '@/types';
import { isCompany, isValidCompany } from '@/lib/type-guards';

// Interfaz extendida para el servicio con campos adicionales del backend
export interface Company extends Omit<BaseCompany, 'uniqueId'> {
  uniqueId: string;
  business_name?: string;
  national_id?: string;
  addressData?: {
    street?: string;
    streetNumber?: string;
    floor?: string;
    apartment?: string;
    postalCode?: string;
    province?: string;
    city?: string;
  };
  tax_condition?: string;
  default_sales_point?: number;
  lastInvoiceNumber?: number;
  verification_status?: 'unverified' | 'verified';
  verified_at?: string;
  required_approvals?: number;
  isPerceptionAgent?: boolean;
  autoPerceptions?: any[];
  isRetentionAgent?: boolean;
  autoRetentions?: any[];
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
    const response = await apiClient.get<ApiResponse<Company[]>>('/companies', {
      showToast: false,
      suppressError: true
    });
    const companies = response.data.data;
    
    // Validar que todas las empresas tengan la estructura correcta
    companies.forEach((company: any) => {
      if (!isCompany(company)) {
        console.warn('Invalid company structure received:', company);
      }
    });
    
    return companies;
  },

  async getCompanyById(id: string): Promise<Company> {
    const response = await apiClient.get<ApiResponse<Company>>(`/companies/${id}`, {
      showToast: false,
      suppressError: true
    });
    const company = response.data.data;
    
    // Validar la estructura de la empresa
    if (!isValidCompany(company)) {
      console.warn('Invalid company structure received:', company);
    }
    
    return company;
  },

  async createCompany(data: CreateCompanyData): Promise<Company> {
    const response = await apiClient.post<ApiResponse<Company>>('/companies', data, {
      showToast: false,
      suppressError: true
    });
    const company = response.data.data;
    
    // Validar la empresa creada
    if (!isValidCompany(company)) {
      console.warn('Invalid company structure received after creation:', company);
    }
    
    // Invalidar caché de empresas después de crear una nueva
    invalidateCompanyCache();
    
    return company;
  },

  async joinCompany(inviteCode: string): Promise<Company> {
    const response = await apiClient.post<ApiResponse<Company>>('/companies/join', { invite_code: inviteCode }, {
      showToast: false,
      suppressError: true
    });
    const company = response.data.data;
    
    // Validar la empresa
    if (!isValidCompany(company)) {
      console.warn('Invalid company structure received after joining:', company);
    }
    
    // Invalidar caché de empresas después de unirse a una
    invalidateCompanyCache();
    
    return company;
  },

  async updateCompany(id: string, data: Partial<CreateCompanyData>): Promise<Company> {
    const response = await apiClient.put<ApiResponse<Company>>(`/companies/${id}`, data, {
      showToast: false,
      suppressError: true
    });
    const company = response.data.data;
    
    // Validar la empresa actualizada
    if (!isValidCompany(company)) {
      console.warn('Invalid company structure received after update:', company);
    }
    
    // Invalidar caché de empresa específica y general
    invalidateCompanyCache(id);
    invalidateCompanyCache();
    
    return company;
  },

  async regenerateInviteCode(id: string): Promise<string> {
    const response = await apiClient.post<ApiResponse<{ invite_code: string }>>(`/companies/${id}/regenerate-invite`, {}, {
      showToast: false,
      suppressError: true
    });
    
    // Invalidar caché de empresa específica
    invalidateCompanyCache(id);
    
    return response.data.data.invite_code;
  },

  async deleteCompany(id: string, deletionCode: string): Promise<void> {
    await apiClient.delete(`/companies/${id}`, { deletion_code: deletionCode }, {
      showToast: false,
      suppressError: true
    });
    
    // Invalidar caché de empresa específica y general
    invalidateCompanyCache(id);
    invalidateCompanyCache();
  },

  // Alias for getCompanyById
  async getCompany(id: string): Promise<Company> {
    return this.getCompanyById(id);
  },
};
