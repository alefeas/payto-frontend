import { CompanyRole } from '@/types'

export const roleTranslations: Record<CompanyRole, string> = {
  owner: 'Propietario',
  administrator: 'Administrador',
  financial_director: 'Director Financiero',
  accountant: 'Contador',
  approver: 'Aprobador',
  operator: 'Operador'
}

export const roleDescriptions: Record<CompanyRole, string> = {
  owner: 'Control absoluto de la empresa, único con permisos para transferir propiedad',
  administrator: 'Control total, gestión de miembros y configuración',
  financial_director: 'Todas las operaciones financieras y aprobaciones',
  accountant: 'Crear facturas, procesar pagos y ver estadísticas',
  approver: 'Aprobar y rechazar facturas de proveedores',
  operator: 'Visualización y tareas básicas de carga'
}

export function translateRole(role: CompanyRole): string {
  return roleTranslations[role] || role
}

export function getRoleDescription(role: CompanyRole): string {
  return roleDescriptions[role] || ''
}
