import apiClient from '@/lib/api-client';

export interface InvoiceCollection {
  id: number;
  company_id: string;
  invoice_id: string;
  amount: number;
  collection_date: string;
  collection_method: 'transfer' | 'check' | 'cash' | 'card' | 'debit_card' | 'credit_card' | 'other';
  reference_number?: string;
  attachment_url?: string;
  notes?: string;
  status: 'pending_confirmation' | 'confirmed' | 'rejected';
  registered_by: string;
  registered_at: string;
  confirmed_by?: string;
  confirmed_at?: string;
  from_network: boolean;
  created_at: string;
  updated_at: string;
  invoice?: any;
  registered_by_user?: any;
  confirmed_by_user?: any;
}

export interface CreateCollectionData {
  invoice_id: string;
  amount: number;
  collection_date: string;
  collection_method: 'transfer' | 'check' | 'cash' | 'card' | 'debit_card' | 'credit_card' | 'other';
  reference_number?: string;
  attachment_url?: string;
  notes?: string;
  status?: 'pending_confirmation' | 'confirmed' | 'rejected';
  from_network?: boolean;
}

export interface UpdateCollectionData {
  amount?: number;
  collection_date?: string;
  collection_method?: 'transfer' | 'check' | 'cash' | 'card' | 'debit_card' | 'credit_card' | 'other';
  reference_number?: string;
  attachment_url?: string;
  notes?: string;
}

class CollectionService {
  async getCollections(companyId: string, status?: string, fromNetwork?: boolean): Promise<InvoiceCollection[]> {
    const params: any = {};
    if (status) params.status = status;
    if (fromNetwork !== undefined) params.from_network = fromNetwork;
    
    const response = await apiClient.get(`/companies/${companyId}/collections`, { params });
    return response.data;
  }

  async createCollection(companyId: string, data: CreateCollectionData): Promise<InvoiceCollection> {
    const response = await apiClient.post(`/companies/${companyId}/collections`, data);
    return response.data;
  }

  async updateCollection(companyId: string, collectionId: number, data: UpdateCollectionData): Promise<InvoiceCollection> {
    const response = await apiClient.put(`/companies/${companyId}/collections/${collectionId}`, data);
    return response.data;
  }

  async confirmCollection(companyId: string, collectionId: number): Promise<InvoiceCollection> {
    const response = await apiClient.post(`/companies/${companyId}/collections/${collectionId}/confirm`);
    return response.data;
  }

  async rejectCollection(companyId: string, collectionId: number, notes?: string): Promise<InvoiceCollection> {
    const response = await apiClient.post(`/companies/${companyId}/collections/${collectionId}/reject`, { notes });
    return response.data;
  }
}

export default new CollectionService();
