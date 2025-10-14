// Estado de conexión entre dos empresas registradas en PayTo
export type ConnectionStatus = 
  | 'connected'        // Relación establecida (ambas aceptaron)
  | 'pending_sent'     // Solicitud enviada (esperando respuesta)
  | 'pending_received' // Solicitud recibida (debe aceptar/rechazar)
  | 'blocked'          // Empresa bloqueada (no pueden facturarse)

// Conexión entre dos empresas registradas en PayTo
export interface CompanyConnection {
  id: string
  companyId: string // Tu empresa
  connectedCompanyId: string // Empresa conectada
  connectedCompanyName: string // Nombre de la empresa conectada
  connectedCompanyUniqueId: string // ID público de la empresa conectada
  status: ConnectionStatus
  requestedAt: string
  connectedAt?: string // Fecha cuando se aceptó la conexión
  requestedBy: string // Usuario que envió la solicitud
  message?: string // Mensaje opcional al enviar solicitud
  // Estadísticas (calculadas, no en DB)
  totalInvoicesSent?: number
  totalInvoicesReceived?: number
  totalAmountSent?: number
  totalAmountReceived?: number
  lastTransactionDate?: string
}

export interface ConnectionRequest {
  id: string
  fromCompanyId: string
  fromCompanyName: string
  fromCompanyUniqueId: string
  toCompanyId: string
  toCompanyName: string
  message?: string
  requestedAt: string
  requestedBy: string
}

export interface NetworkStats {
  totalConnections: number
  pendingReceived: number
  pendingSent: number
}