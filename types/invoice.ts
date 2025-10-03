export type InvoiceType = 'A' | 'B' | 'C' | 'E' | 'otro'

export type InvoiceStatus = 
  | 'pendiente_aprobacion' 
  | 'aprobada' 
  | 'rechazada' 
  | 'pagada' 
  | 'vencida' 
  | 'cancelada'

export type Currency = 'ARS' | 'USD' | 'EUR'

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  subtotal: number
  taxRate?: number
  taxAmount?: number
}

export interface InvoiceTax {
  id: string
  name: string
  rate: number
  baseAmount: number
  amount: number
}

export interface InvoicePerception {
  id: string
  type: 'percepcion_iva' | 'percepcion_iibb' | 'percepcion_suss'
  name: string
  rate: number
  baseAmount: number
  amount: number
}

export interface Invoice {
  id: string
  number: string
  type: InvoiceType
  issuerCompanyId: string
  receiverCompanyId: string
  issueDate: string
  dueDate: string
  currency: Currency
  items: InvoiceItem[]
  taxes: InvoiceTax[]
  perceptions: InvoicePerception[]
  subtotal: number
  totalTaxes: number
  totalPerceptions: number
  total: number
  status: InvoiceStatus
  pdfUrl?: string
  notes?: string
  approvalsRequired: number
  approvalsReceived: number
  approvalDate?: string
  createdAt: string
  updatedAt: string
}

export interface CreateInvoiceData {
  type: InvoiceType
  receiverCompanyId: string
  dueDate: string
  currency: Currency
  items: Omit<InvoiceItem, 'id' | 'subtotal' | 'taxAmount'>[]
  notes?: string
  pdfFile?: File
}