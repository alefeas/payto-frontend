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


