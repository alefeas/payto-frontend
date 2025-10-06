// External client NOT registered in PayTo
export interface Client {
  id: string
  companyId: string // Company that saved this client
  documentType: 'CUIT' | 'CUIL' | 'DNI' | 'Pasaporte' | 'CDI'
  documentNumber: string
  businessName?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  address?: string
  taxCondition: 'RI' | 'Monotributo' | 'Exento' | 'CF' | 'Consumidor_Final'
  isCompanyConnection: boolean // If the client registered later
  connectedCompanyId?: string // Company ID if registered
  deletedAt?: string
  createdAt: string
  updatedAt: string
}

// Data to create/update external client
export interface ClientData {
  documentType: 'CUIT' | 'CUIL' | 'DNI' | 'Pasaporte' | 'CDI'
  documentNumber: string
  businessName?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  address?: string
  taxCondition: 'RI' | 'Monotributo' | 'Exento' | 'CF' | 'Consumidor_Final'
}
