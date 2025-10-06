export interface Company {
  id: number
  name: string
  businessName?: string
  taxId: string
  email: string
  phone?: string
  taxCondition: 'Registered' | 'Simplified'
  taxConditionAfip: 'RI' | 'Monotributo' | 'Exento' | 'CF'
  grossIncomeTax?: string
  activityStartDate?: string
  defaultSalesPoint: number
  canIssueInvoices: boolean
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
  // AFIP fields
  taxConditionAfip: 'RI' | 'Monotributo' | 'Exento' | 'CF'
  defaultSalesPoint: number
  grossIncomeTax?: string
  activityStartDate?: string
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

export type CompanyRole = 'Administrador' | 'Director Financiero' | 'Contador' | 'Aprobador' | 'Operador'

export interface CompanyMember {
  id: string
  name: string
  email: string
  role: CompanyRole
  joinedAt: string
  lastActive: string
  avatar?: string
}

export interface CompanySettings {
  name: string
  businessName: string
  taxId: string
  email: string
  phone: string
  address: string
  logoUrl: string
  province: string
  postalCode: string
  street: string
  streetNumber: string
  floor: string
  apartment: string
  taxRegime: string
  currency: string
  invoicePrefix: string
  nextInvoiceNumber: number
  paymentTerms: number
  defaultIVA: number
  defaultIIBB: number
  defaultGanancias: number
  defaultIIBBRet: number
  defaultSUSS: number
  emailNotifications: boolean
  paymentReminders: boolean
  invoiceApprovals: boolean
  requireTwoFactor: boolean
  sessionTimeout: number
  inviteCode: string
  autoGenerateInvites: boolean
  active: boolean
}
