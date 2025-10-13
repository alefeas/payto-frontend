import apiClient from '@/lib/api-client'

export type MemberRole = 'owner' | 'administrator' | 'financial_director' | 'accountant' | 'approver' | 'operator'

export interface CompanyMemberData {
  id: string
  userId: string
  name: string
  email: string
  role: MemberRole
  isActive: boolean
  joinedAt: string
  lastActive: string
}

export const companyMemberService = {
  async getMembers(companyId: string): Promise<CompanyMemberData[]> {
    const response = await apiClient.get(`/companies/${companyId}/members`)
    return response.data.data
  },

  async updateMemberRole(companyId: string, memberId: string, role: MemberRole, confirmationCode?: string): Promise<CompanyMemberData> {
    const response = await apiClient.put(`/companies/${companyId}/members/${memberId}/role`, { 
      role,
      confirmation_code: confirmationCode 
    })
    return response.data.data
  },

  async removeMember(companyId: string, memberId: string): Promise<void> {
    await apiClient.delete(`/companies/${companyId}/members/${memberId}`)
  }
}
