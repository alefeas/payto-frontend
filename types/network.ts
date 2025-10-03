export type ConnectionStatus = 
  | 'connected'        // Relación establecida
  | 'pending_sent'     // Solicitud enviada
  | 'pending_received' // Solicitud recibida
  | 'blocked'          // Empresa bloqueada

export interface CompanyConnection {
  id: string
  companyId: string
  connectedCompanyId: string
  connectedCompanyName: string
  connectedCompanyUniqueId: string
  status: ConnectionStatus
  requestedAt: string
  connectedAt?: string
  requestedBy: string
  totalInvoicesSent: number
  totalInvoicesReceived: number
  totalAmountSent: number
  totalAmountReceived: number
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
}