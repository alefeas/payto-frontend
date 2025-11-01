import apiClient from '@/lib/api-client'

export interface TaxpayerData {
  cuit: string
  person_type: 'physical' | 'legal' | 'unknown'
  tax_condition: string
  name: string | null
  business_name: string | null
  address: string | null
  province: string | null
  city: string | null
  postal_code: string | null
  activities: Array<{
    code: string | null
    description: string | null
  }>
  taxes: Array<{
    code: string | null
    description: string | null
  }>
}

export interface PadronResponse {
  success: boolean
  data: TaxpayerData
  mock_mode: boolean
  message: string
}

export interface SyncTaxConditionResponse {
  success: boolean
  tax_condition: string
  mock_mode: boolean
  message: string
}

export const afipPadronService = {
  async getOwnFiscalData(companyId: string): Promise<PadronResponse> {
    const response = await apiClient.get(`/companies/${companyId}/afip/fiscal-data`)
    return response.data
  },

  async syncTaxCondition(companyId: string): Promise<SyncTaxConditionResponse> {
    const response = await apiClient.post(`/companies/${companyId}/afip/sync-tax-condition`)
    return response.data
  },

  async searchByCuit(companyId: string, cuit: string): Promise<PadronResponse> {
    const response = await apiClient.post(`/companies/${companyId}/afip/search-cuit`, { cuit })
    return response.data
  }
}
