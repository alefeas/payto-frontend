import apiClient from '@/lib/api-client'

export interface Client {
  id: string
  companyId: string
  documentType: 'CUIT' | 'CUIL' | 'DNI' | 'Pasaporte' | 'CDI'
  documentNumber: string
  businessName?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  address?: string
  taxCondition: 'registered_taxpayer' | 'monotax' | 'exempt' | 'final_consumer'
  createdAt: string
  updatedAt: string
}

export interface CreateClientData {
  document_type: 'CUIT' | 'CUIL' | 'DNI' | 'Pasaporte' | 'CDI'
  document_number: string
  business_name?: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  address?: string
  tax_condition: 'registered_taxpayer' | 'monotax' | 'exempt' | 'final_consumer'
}

export const clientService = {
  async getClients(companyId: string): Promise<Client[]> {
    const response = await apiClient.get(`/companies/${companyId}/clients`)
    return response.data.data.map((client: any) => ({
      id: client.id,
      companyId: client.company_id,
      documentType: client.document_type,
      documentNumber: client.document_number,
      businessName: client.business_name,
      firstName: client.first_name,
      lastName: client.last_name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      taxCondition: client.tax_condition,
      createdAt: client.created_at,
      updatedAt: client.updated_at
    }))
  },

  async createClient(companyId: string, data: CreateClientData): Promise<Client> {
    const response = await apiClient.post(`/companies/${companyId}/clients`, data)
    const client = response.data.data
    return {
      id: client.id,
      companyId: client.company_id,
      documentType: client.document_type,
      documentNumber: client.document_number,
      businessName: client.business_name,
      firstName: client.first_name,
      lastName: client.last_name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      taxCondition: client.tax_condition,
      createdAt: client.created_at,
      updatedAt: client.updated_at
    }
  },

  async updateClient(companyId: string, clientId: string, data: Partial<CreateClientData>): Promise<Client> {
    const response = await apiClient.put(`/companies/${companyId}/clients/${clientId}`, data)
    const client = response.data.data
    return {
      id: client.id,
      companyId: client.company_id,
      documentType: client.document_type,
      documentNumber: client.document_number,
      businessName: client.business_name,
      firstName: client.first_name,
      lastName: client.last_name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      taxCondition: client.tax_condition,
      createdAt: client.created_at,
      updatedAt: client.updated_at
    }
  },

  async deleteClient(companyId: string, clientId: string): Promise<void> {
    await apiClient.delete(`/companies/${companyId}/clients/${clientId}`)
  },

  async getArchivedClients(companyId: string): Promise<Client[]> {
    const response = await apiClient.get(`/companies/${companyId}/clients/archived`)
    return response.data.data.map((client: any) => ({
      id: client.id,
      companyId: client.company_id,
      documentType: client.document_type,
      documentNumber: client.document_number,
      businessName: client.business_name,
      firstName: client.first_name,
      lastName: client.last_name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      taxCondition: client.tax_condition,
      createdAt: client.created_at,
      updatedAt: client.updated_at
    }))
  },

  async restoreClient(companyId: string, clientId: string): Promise<void> {
    await apiClient.post(`/companies/${companyId}/clients/${clientId}/restore`)
  }
}
