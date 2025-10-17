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
    try {
      const response = await apiClient.get(`/companies/${companyId}/afip/certificate`)
      return response.data.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  async generateCSR(companyId: string): Promise<{ csr: string; private_key: string }> {
    try {
      const response = await apiClient.post(`/companies/${companyId}/afip/certificate/generate-csr`)
      return response.data
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK') {
        throw new Error('No se puede conectar al servidor. Verifica que Laravel esté corriendo en http://localhost:8000')
      }
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Error al generar CSR'
      throw new Error(errorMsg)
    }
  },

  async uploadCertificate(companyId: string, certificate: string, password?: string, environment?: 'testing' | 'production'): Promise<AfipCertificate> {
    const formData = new FormData()
    const certBlob = new Blob([certificate], { type: 'application/x-pem-file' })
    formData.append('certificate', certBlob, 'certificate.pem')
    if (password) formData.append('password', password)
    formData.append('environment', environment || 'testing')
    
    const response = await apiClient.post(`/companies/${companyId}/afip/certificate/upload`, formData)
    return response.data.data
  },

  async uploadManualCertificate(
    companyId: string,
    certificate: string,
    privateKey: string,
    password?: string,
    environment?: 'testing' | 'production'
  ): Promise<AfipCertificate> {
    const formData = new FormData()
    const certBlob = new Blob([certificate], { type: 'application/x-pem-file' })
    const keyBlob = new Blob([privateKey], { type: 'application/x-pem-file' })
    formData.append('certificate', certBlob, 'certificate.pem')
    formData.append('private_key', keyBlob, 'private_key.pem')
    if (password) formData.append('password', password)
    formData.append('environment', environment || 'testing')
    
    const response = await apiClient.post(`/companies/${companyId}/afip/certificate/upload-manual`, formData)
    return response.data.data
  },

  async testConnection(companyId: string): Promise<{ success: boolean; message: string; expires_in_days?: number }> {
    const response = await apiClient.post(`/companies/${companyId}/afip/certificate/test`)
    return response.data
  },

  async deleteCertificate(companyId: string): Promise<void> {
    await apiClient.delete(`/companies/${companyId}/afip/certificate`)
  }
}
