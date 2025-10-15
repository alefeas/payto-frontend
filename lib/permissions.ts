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
  ],
  
  approver: [
    'members.view',
    'bank_accounts.view',
    'invoices.view',
    'invoices.approve',
    'payments.view',
    'payments.approve',
  ],
  
  operator: [
    'members.view',
    'bank_accounts.view',
    'invoices.view',
    'payments.view',
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
