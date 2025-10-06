// Component-specific types and interfaces

export interface SidebarCompany {
  id: number
  firstName: string
  uniqueId: string
  inviteCode: string
  role: string
  status: string
  unreadNotifications: number
  createdAt: string
  memberCount: number
  taxCondition: 'RI' | 'Monotributo' | 'Exento' | 'CF'
}

export interface ClientSelectorProps {
  connectedCompanies: Array<{ id: string; name: string; uniqueId: string }>
  savedClients?: Array<{ 
    id: string
    razonSocial?: string
    nombre?: string
    apellido?: string
    documentNumber: string
    taxCondition: string 
  }>
  onSelect: (data: {
    receiver_company_id?: string
    client_id?: string
    client_data?: any
    save_client?: boolean
  }) => void
}
