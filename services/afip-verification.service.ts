import apiClient from '@/lib/api-client'

export interface AfipCompanyData {
  cuit: string
  businessName: string
  fiscalAddress: string
  taxCondition: string
  status: string
  personType: string
  registrationDate: string
}

export interface VerificationStatus {
  verification_status: 'unverified' | 'verified'
  verified_at: string | null
  has_certificate: boolean
}

export const afipVerificationService = {
  async validateCuit(cuit: string, companyId: string): Promise<{ valid: boolean; data?: AfipCompanyData; message?: string; requires_verification?: boolean }> {
    const response = await apiClient.post('/afip/validate-cuit', { cuit, company_id: companyId })
    return response.data
  },

  async verifyCertificate(companyId: string, certificate: File, privateKey: File): Promise<any> {
    const formData = new FormData()
    formData.append('certificate', certificate)
    formData.append('private_key', privateKey)

    const response = await apiClient.post(
      `/afip/companies/${companyId}/verify-certificate`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },

  async getVerificationStatus(companyId: string): Promise<VerificationStatus> {
    const response = await apiClient.get(`/afip/companies/${companyId}/verification-status`)
    return response.data
  },
}
