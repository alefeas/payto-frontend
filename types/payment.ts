export type PaymentMethod = 'transferencia' | 'cheque' | 'efectivo' | 'tarjeta'

export type RetentionType = 
  | 'retencion_iva' 
  | 'retencion_ganancias' 
  | 'retencion_iibb' 
  | 'retencion_suss'

export type PaymentStatus = 
  | 'declared'     // Cliente declara que pagó
  | 'confirmed'    // Proveedor confirmó recepción  
  | 'rejected'     // Proveedor rechazó el pago
  | 'partial'      // Pago parcial o con diferencias

export interface PaymentRetention {
  id: string
  type: RetentionType
  name: string
  rate: number
  baseAmount: number
  amount: number
  certificateNumber?: string
}

export interface Payment {
  id: string
  invoiceIds: string[]
  payerCompanyId: string
  payerCompanyName: string
  paymentDate: string
  method: PaymentMethod
  originalAmount: number
  retentions: PaymentRetention[]
  totalRetentions: number
  netAmount: number
  reference?: string
  notes?: string
  status: PaymentStatus
  rejectionReason?: string
  confirmedAt?: string
  confirmedBy?: string
  createdAt: string
}

export interface CreatePaymentData {
  invoiceId: string
  paymentDate: string
  method: PaymentMethod
  retentions: Omit<PaymentRetention, 'id' | 'baseAmount' | 'amount'>[]
  reference?: string
  notes?: string
}