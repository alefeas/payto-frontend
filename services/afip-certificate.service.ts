import apiClient from '@/lib/api-client'

export interface AfipCertificate {
  id: string
  isActive: boolean
  validFrom: string | null
  validUntil: string | null
  isExpired: boolean
  isExpiringSoon: boolean
  environment: 'testing' | 'production'
  hasValidToken: boolean
  isSelfSigned: boolean
}

export const afipCertificateService = {
  async getCertificate(companyId: string): Promise<AfipCertificate | null> {
    const response = await apiClient.get(`/companies/${companyId}/afip/certificate`)
    return response.data.data
  },

  async generateCSR(companyId: string): Promise<{ csr: string; certificateId: string }> {
    const response = await apiClient.post(`/companies/${companyId}/afip/certificate/generate-csr`)
    return response.data.data
  },

  async uploadCertificate(companyId: string, certificate: string, password?: string, environment?: 'testing' | 'production'): Promise<AfipCertificate> {
    const response = await apiClient.post(`/companies/${companyId}/afip/certificate/upload`, {
      certificate,
      password,
      environment: environment || 'testing'
    })
    return response.data.data
  },

  async uploadManualCertificate(
    companyId: string,
    certificate: string,
    privateKey: string,
    password?: string,
    environment?: 'testing' | 'production'
  ): Promise<AfipCertificate> {
    const response = await apiClient.post(`/companies/${companyId}/afip/certificate/upload-manual`, {
      certificate,
      private_key: privateKey,
      password,
      environment: environment || 'testing'
    })
    return response.data.data
  },

  async testConnection(companyId: string): Promise<{ success: boolean; message: string; expires_in_days?: number }> {
    const response = await apiClient.post(`/companies/${companyId}/afip/certificate/test`)
    return response.data.data
  },

  async deleteCertificate(companyId: string): Promise<void> {
    await apiClient.delete(`/companies/${companyId}/afip/certificate`)
  }
}
