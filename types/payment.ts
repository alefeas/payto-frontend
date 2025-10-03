export type PaymentMethod = 'transferencia' | 'cheque' | 'efectivo' | 'tarjeta'

export type RetentionType = 
  | 'retencion_iva' 
  | 'retencion_ganancias' 
  | 'retencion_iibb' 
  | 'retencion_suss'

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
  invoiceId: string
  paymentDate: string
  method: PaymentMethod
  originalAmount: number
  retentions: PaymentRetention[]
  totalRetentions: number
  netAmount: number
  reference?: string
  notes?: string
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