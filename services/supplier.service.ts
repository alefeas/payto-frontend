import apiClient from '@/lib/api-client'

export interface Supplier {
  id: number
  companyId: string
  documentType: 'CUIT' | 'CUIL' | 'DNI' | 'Pasaporte' | 'CDI'
  documentNumber: string
  businessName?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  address?: string
  postalCode?: string
  city?: string
  province?: string
  taxCondition: 'registered_taxpayer' | 'monotax' | 'exempt'
  bankName?: string
  bankAccountType?: 'CA' | 'CC'
  bankAccountNumber?: string
  bankCbu?: string
  bankAlias?: string
  createdAt: string
  updatedAt: string
}

export const supplierService = {
  async getSuppliers(companyId: string): Promise<Supplier[]> {
    const response = await apiClient.get(`/companies/${companyId}/suppliers`)
    return response.data.map((s: any) => ({
      id: s.id,
      companyId: s.company_id,
      documentType: s.document_type,
      documentNumber: s.document_number,
      businessName: s.business_name,
      firstName: s.first_name,
      lastName: s.last_name,
      email: s.email,
      phone: s.phone,
      address: s.address,
      postalCode: s.postal_code,
      city: s.city,
      province: s.province,
      taxCondition: s.tax_condition,
      bankName: s.bank_name,
      bankAccountType: s.bank_account_type,
      bankAccountNumber: s.bank_account_number,
      bankCbu: s.bank_cbu,
      bankAlias: s.bank_alias,
      createdAt: s.created_at,
      updatedAt: s.updated_at
    }))
  },

  async createSupplier(companyId: string, data: any): Promise<Supplier> {
    const response = await apiClient.post(`/companies/${companyId}/suppliers`, data)
    const s = response.data
    return {
      id: s.id,
      companyId: s.company_id,
      documentType: s.document_type,
      documentNumber: s.document_number,
      businessName: s.business_name,
      firstName: s.first_name,
      lastName: s.last_name,
      email: s.email,
      phone: s.phone,
      address: s.address,
      postalCode: s.postal_code,
      city: s.city,
      province: s.province,
      taxCondition: s.tax_condition,
      bankName: s.bank_name,
      bankAccountType: s.bank_account_type,
      bankAccountNumber: s.bank_account_number,
      bankCbu: s.bank_cbu,
      bankAlias: s.bank_alias,
      createdAt: s.created_at,
      updatedAt: s.updated_at
    }
  },

  async updateSupplier(companyId: string, id: number, data: any): Promise<Supplier> {
    const response = await apiClient.put(`/companies/${companyId}/suppliers/${id}`, data)
    const s = response.data
    return {
      id: s.id,
      companyId: s.company_id,
      documentType: s.document_type,
      documentNumber: s.document_number,
      businessName: s.business_name,
      firstName: s.first_name,
      lastName: s.last_name,
      email: s.email,
      phone: s.phone,
      address: s.address,
      postalCode: s.postal_code,
      city: s.city,
      province: s.province,
      taxCondition: s.tax_condition,
      bankName: s.bank_name,
      bankAccountType: s.bank_account_type,
      bankAccountNumber: s.bank_account_number,
      bankCbu: s.bank_cbu,
      bankAlias: s.bank_alias,
      createdAt: s.created_at,
      updatedAt: s.updated_at
    }
  },

  async deleteSupplier(companyId: string, id: number): Promise<void> {
    await apiClient.delete(`/companies/${companyId}/suppliers/${id}`)
  },

  async getArchivedSuppliers(companyId: string): Promise<Supplier[]> {
    const response = await apiClient.get(`/companies/${companyId}/suppliers/archived`)
    return response.data.map((s: any) => ({
      id: s.id,
      companyId: s.company_id,
      documentType: s.document_type,
      documentNumber: s.document_number,
      businessName: s.business_name,
      firstName: s.first_name,
      lastName: s.last_name,
      email: s.email,
      phone: s.phone,
      address: s.address,
      postalCode: s.postal_code,
      city: s.city,
      province: s.province,
      taxCondition: s.tax_condition,
      bankName: s.bank_name,
      bankAccountType: s.bank_account_type,
      bankAccountNumber: s.bank_account_number,
      bankCbu: s.bank_cbu,
      bankAlias: s.bank_alias,
      createdAt: s.created_at,
      updatedAt: s.updated_at
    }))
  },

  async restoreSupplier(companyId: string, id: number): Promise<void> {
    await apiClient.post(`/companies/${companyId}/suppliers/${id}/restore`)
  }
}
