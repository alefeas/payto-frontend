export interface Company {
  id: number
  nombre: string
  razonSocial?: string
  cuitCuil: string
  email: string
  telefono?: string
  direccion?: string
  logoUrl?: string
  uniqueId: string // ID único para identificar la empresa (público)
  inviteCode: string // Código de invitación (privado, controlado por admin)
  role: 'Administrador' | 'Director Financiero' | 'Contador' | 'Aprobador' | 'Operador'
  status: 'active'
  unreadNotifications: number
  createdAt: string
  memberCount: number
  activa: boolean
  codigoEliminador: string
}

export interface CreateCompanyData {
  nombre: string
  razonSocial?: string
  cuitCuil: string
  email: string
  telefono?: string
  direccion?: string
  logoUrl?: string
  codigoEliminador: string
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

export interface Activity {
  id: number
  type: 'invoice_created' | 'member_joined' | 'payment_pending' | 'payment_received' | 'company_created'
  message: string
  companyName: string
  timestamp: string
}