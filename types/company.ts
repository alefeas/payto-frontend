export interface Company {
  id: number
  name: string
  businessName?: string
  taxId: string
  email: string
  phone?: string
  taxCondition: 'Registered' | 'Simplified'
  province: string
  postalCode: string
  street: string
  streetNumber: string
  floor?: string
  apartment?: string
  logoUrl?: string
  uniqueId: string // Public unique identifier for the company
  inviteCode: string // Private invitation code (admin controlled)
  role: 'Administrator' | 'Financial Director' | 'Accountant' | 'Approver' | 'Operator'
  status: 'active'
  unreadNotifications: number
  createdAt: string
  memberCount: number
  active: boolean
  deletionCode: string
}

export interface CreateCompanyData {
  name: string
  businessName?: string
  taxId: string
  email: string
  phone?: string
  logoUrl?: string
  deletionCode: string
  taxCondition: 'Registered' | 'Simplified'
  lastInvoiceNumber: number
  // Structured address fields
  province: string
  postalCode: string
  street: string
  streetNumber: string
  floor?: string
  apartment?: string
}

export interface Notification {
  id: number
  message: string
  time: string
}

export interface InviteCode {
  code: string
  companyId: number
  role: 'Administrator' | 'Accountant' | 'Member'
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