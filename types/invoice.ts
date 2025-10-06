export type InvoiceType = 'A' | 'B' | 'C' | 'E'

export type InvoiceStatus = 
  | 'pendiente_aprobacion' 
  | 'emitida'
  | 'aprobada' 
  | 'rechazada' 
  | 'pagada' 
  | 'vencida' 
  | 'cancelada'

export type Currency = 'ARS' | 'USD' | 'EUR'

export type InvoiceConcepto = 'productos' | 'servicios' | 'productos_servicios'

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
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
  puntoVenta: number
  numeroComprobante: number
  afipTipoComprobante: string
  concepto: InvoiceConcepto
  issuerCompanyId: string
  receiverCompanyId?: string
  clientId?: string
  issueDate: string
  dueDate: string
  currency: Currency
  monedaCotizacion: number
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
  concepto: InvoiceConcepto
  receiverCompanyId?: string
  clientId?: string
  clientData?: {
    tipoDocumento: string
    numeroDocumento: string
    razonSocial?: string
    nombre?: string
    apellido?: string
    email?: string
    condicionIva: string
  }
  saveClient?: boolean
  dueDate: string
  currency: Currency
  items: Omit<InvoiceItem, 'id' | 'subtotal' | 'taxAmount'>[]
  notes?: string
  // PDF and TXT files are generated automatically by the system
}