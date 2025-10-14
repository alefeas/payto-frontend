import apiClient from '@/lib/api-client'
import type { CompanyConnection, ConnectionRequest, NetworkStats } from '@/types/network'

export const networkService = {
  async getConnections(companyId: string): Promise<CompanyConnection[]> {
    const response = await apiClient.get(`/companies/${companyId}/network`)
    return response.data
  },

  async getPendingRequests(companyId: string): Promise<ConnectionRequest[]> {
    const response = await apiClient.get(`/companies/${companyId}/network/requests`)
    return response.data
  },

  async getSentRequests(companyId: string): Promise<ConnectionRequest[]> {
    const response = await apiClient.get(`/companies/${companyId}/network/sent`)
    return response.data
  },

  async getStats(companyId: string): Promise<NetworkStats> {
    const response = await apiClient.get(`/companies/${companyId}/network/stats`)
    return response.data
  },

  async sendConnectionRequest(companyId: string, data: { company_unique_id: string; message?: string }) {
    const response = await apiClient.post(`/companies/${companyId}/network/connect`, data)
    return response.data
  },

  async acceptRequest(companyId: string, connectionId: string) {
    const response = await apiClient.post(`/companies/${companyId}/network/requests/${connectionId}/accept`)
    return response.data
  },

  async rejectRequest(companyId: string, connectionId: string) {
    const response = await apiClient.post(`/companies/${companyId}/network/requests/${connectionId}/reject`)
    return response.data
  },
}
