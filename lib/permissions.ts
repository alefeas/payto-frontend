import { CompanyRole } from '@/types'

export type Permission = 
  // Company management
  | 'company.update'
  | 'company.delete'
  | 'company.regenerate_invite'
  | 'company.view_settings'
  
  // Member management
  | 'members.view'
  | 'members.manage'
  | 'members.change_role'
  | 'members.remove'
  
  // Bank accounts
  | 'bank_accounts.view'
  | 'bank_accounts.create'
  | 'bank_accounts.update'
  | 'bank_accounts.delete'
  
  // Invoices
  | 'invoices.view'
  | 'invoices.create'
  | 'invoices.update'
  | 'invoices.delete'
  | 'invoices.approve'
  
  // Payments
  | 'payments.view'
  | 'payments.create'
  | 'payments.update'
  | 'payments.delete'
  | 'payments.approve'
  
  // Audit logs
  | 'audit.view'
  
  // IVA Book (NEW)
  | 'iva_book.view'
  | 'iva_book.export'
  
  // Contacts (NEW)
  | 'contacts.view'
  | 'contacts.create'
  | 'contacts.update'
  | 'contacts.delete'
  
  // Analytics (NEW)
  | 'analytics.view'

const rolePermissions: Record<CompanyRole, Permission[]> = {
  owner: [
    // All permissions
    'company.update',
    'company.delete',
    'company.regenerate_invite',
    'company.view_settings',
    'members.view',
    'members.manage',
    'members.change_role',
    'members.remove',
    'bank_accounts.view',
    'bank_accounts.create',
    'bank_accounts.update',
    'bank_accounts.delete',
    'invoices.view',
    'invoices.create',
    'invoices.update',
    'invoices.delete',
    'invoices.approve',
    'payments.view',
    'payments.create',
    'payments.update',
    'payments.delete',
    'payments.approve',
    'audit.view',
    'iva_book.view',
    'iva_book.export',
    'contacts.view',
    'contacts.create',
    'contacts.update',
    'contacts.delete',
    'analytics.view',
  ],
  
  administrator: [
    'company.update',
    'company.regenerate_invite',
    'company.view_settings',
    'members.view',
    'members.manage',
    'members.change_role',
    'members.remove',
    'bank_accounts.view',
    'bank_accounts.create',
    'bank_accounts.update',
    'bank_accounts.delete',
    'invoices.view',
    'invoices.create',
    'invoices.update',
    'invoices.delete',
    'invoices.approve',
    'payments.view',
    'payments.create',
    'payments.update',
    'payments.delete',
    'payments.approve',
    'audit.view',
    'iva_book.view',
    'iva_book.export',
    'contacts.view',
    'contacts.create',
    'contacts.update',
    'contacts.delete',
    'analytics.view',
  ],
  
  financial_director: [
    'members.view',
    'bank_accounts.view',
    'bank_accounts.create',
    'bank_accounts.update',
    'invoices.view',
    'invoices.create',
    'invoices.update',
    'invoices.approve',
    'payments.view',
    'payments.create',
    'payments.update',
    'payments.approve',
    'audit.view',
    'iva_book.view',
    'iva_book.export',
    'contacts.view',
    'contacts.create',
    'contacts.update',
    'contacts.delete',
    'analytics.view',
  ],
  
  accountant: [
    'members.view',
    'bank_accounts.view',
    'invoices.view',
    'invoices.create',
    'invoices.update',
    'invoices.approve',
    'payments.view',
    'payments.create',
    'payments.update',
    'payments.approve',
    'iva_book.view',
    'iva_book.export',
    'contacts.view',
    'contacts.create',
    'contacts.update',
    'analytics.view',
  ],
  
  approver: [
    'members.view',
    'bank_accounts.view',
    'invoices.view',
    'invoices.approve',
    'payments.view',
    'payments.approve',
    'contacts.view',
    'analytics.view',
  ],
  
  operator: [
    'members.view',
    'bank_accounts.view',
    'invoices.view',
    'payments.view',
    'contacts.view',
    'analytics.view',
  ],
}

export function hasPermission(role: CompanyRole | undefined, permission: Permission): boolean {
  if (!role) return false
  return rolePermissions[role]?.includes(permission) ?? false
}

export function hasAnyPermission(role: CompanyRole | undefined, permissions: Permission[]): boolean {
  if (!role) return false
  return permissions.some(permission => hasPermission(role, permission))
}

export function hasAllPermissions(role: CompanyRole | undefined, permissions: Permission[]): boolean {
  if (!role) return false
  return permissions.every(permission => hasPermission(role, permission))
}
