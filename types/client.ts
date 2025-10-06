// Cliente externo NO registrado en PayTo
export interface Client {
  id: string
  companyId: string // Empresa que guardó este cliente
  tipoDocumento: 'CUIT' | 'CUIL' | 'DNI' | 'Pasaporte' | 'CDI'
  numeroDocumento: string
  razonSocial?: string
  nombre?: string
  apellido?: string
  email?: string
  telefono?: string
  domicilio?: string
  condicionIva: 'RI' | 'Monotributo' | 'Exento' | 'CF' | 'Consumidor_Final'
  isCompanyConnection: boolean // Si el cliente se registró después
  connectedCompanyId?: string // ID de la empresa si se registró
  deletedAt?: string
  createdAt: string
  updatedAt: string
}

// Datos para crear/actualizar cliente externo
export interface ClientData {
  tipoDocumento: 'CUIT' | 'CUIL' | 'DNI' | 'Pasaporte' | 'CDI'
  numeroDocumento: string
  razonSocial?: string
  nombre?: string
  apellido?: string
  email?: string
  telefono?: string
  domicilio?: string
  condicionIva: 'RI' | 'Monotributo' | 'Exento' | 'CF' | 'Consumidor_Final'
}
