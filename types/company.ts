export interface Company {
  id: number
  name: string
  description?: string
  uniqueId: string // ID único para identificar la empresa (público)
  inviteCode: string // Código de invitación (privado, controlado por admin)
  role: 'Administrador' | 'Contador' | 'Miembro'
  status: 'active'
  unreadNotifications: number
  createdAt: string
  memberCount: number
}

export interface CreateCompanyData {
  name: string
  description?: string
}

export interface Notification {
  id: number
  message: string
  time: string
}

export interface InviteCode {
  code: string
  companyId: number
  role: 'Administrador' | 'Contador' | 'Miembro'
  createdBy: string
  expiresAt?: string
}