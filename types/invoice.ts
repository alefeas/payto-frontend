export type InvoiceType = 'A' | 'B' | 'C' | 'E'

export type InvoiceStatus = 
  | 'pending_approval' 
  | 'issued'
  | 'approved' 
  | 'rejected' 
  | 'paid' 
  | 'overdue' 
  | 'cancelled'

export type Currency = 'ARS' | 'USD' | 'EUR'

export type InvoiceConcept = 'products' | 'services' | 'products_services'

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  discountPercentage?: number
  subtotal: number
  taxRate?: number // -1: Exento, -2: No Gravado, 0+: Alícuota normal
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
  type: 'vat_perception' | 'gross_income_perception' | 'suss_perception'
  name: string
  rate: number
  baseAmount: number
  amount: number
}

export interface Invoice {
  id: string
  number: string
  type: InvoiceType
  salesPoint: number
  voucherNumber: number
  afipVoucherType: string
  concept: InvoiceConcept
  issuerCompanyId: string
  receiverCompanyId?: string
  clientId?: string
  issueDate: string
  dueDate: string
  currency: Currency
  exchangeRate: number
  items: InvoiceItem[]
  taxes: InvoiceTax[]
  perceptions: InvoicePerception[]
  subtotal: number
  totalTaxes: number
  totalPerceptions: number
  total: number
  status: InvoiceStatus
  pdfUrl?: string // Generated automatically
  afipTxtUrl?: string // TXT for AFIP/ARCA
  notes?: string
  approvalsRequired: number
  approvalsReceived: number
  approvalDate?: string
  // AFIP integration
  afipCae?: string
  afipCaeDueDate?: string
  afipStatus?: 'pending' | 'processing' | 'approved' | 'rejected' | 'error'
  afipErrorMessage?: string
  afipSentAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateInvoiceData {
  type: InvoiceType
  concept: InvoiceConcept
  receiverCompanyId?: string
  clientId?: string
  clientData?: {
    documentType: string
    documentNumber: string
    businessName?: string
    firstName?: string
    lastName?: string
    email?: string
    taxCondition: string
  }
  saveClient?: boolean
  dueDate: string
  currency: Currency
  items: Omit<InvoiceItem, 'id' | 'subtotal' | 'taxAmount'>[]
  notes?: string
  // PDF and TXT files are generated automatically by the system
}
