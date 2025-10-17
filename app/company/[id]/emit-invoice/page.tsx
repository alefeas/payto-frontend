"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Plus, Trash2, Calculator, FileText, Shield, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import type { Currency, InvoiceItem, InvoicePerception, InvoiceConcept } from "@/types/invoice"
import { ClientSelector } from "@/components/invoices/ClientSelector"
import { InvoiceSelector } from "@/components/vouchers/InvoiceSelector"
import { companyService } from "@/services/company.service"
import { invoiceService } from "@/services/invoice.service"
import { voucherService } from "@/services/voucher.service"
import type { Client } from "@/services/client.service"

interface CompanyData {
  id: string
  name: string
  uniqueId: string
  tax_condition: string
  default_sales_point?: number
  defaultVat?: number
  vatPerception?: number
  grossIncomePerception?: number
  socialSecurityPerception?: number
  vatRetention?: number
  incomeTaxRetention?: number
  grossIncomeRetention?: number
  socialSecurityRetention?: number
}

export default function CreateInvoicePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [currentCompany, setCurrentCompany] = useState<CompanyData | null>(null)
  const [connectedCompanies, setConnectedCompanies] = useState<CompanyData[]>([])
  const [savedClients, setSavedClients] = useState<Client[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [cert, setCert] = useState<{ isActive: boolean } | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [associateInvoice, setAssociateInvoice] = useState(false)

  const [formData, setFormData] = useState({
    voucherType: '',
    concept: 'products' as InvoiceConcept,
    relatedInvoiceId: '',
    receiverCompanyId: '',
    clientData: null as { client_id?: string; [key: string]: unknown } | null,
    saveClient: false,
    emissionDate: '',
    dueDate: '',
    paymentDueDate: '',
    currency: 'ARS' as Currency,
    exchangeRate: '1',
    notes: ''
  })

  // Tipos de comprobantes hardcodeados (sincronizados con backend)
  const availableTypes = [
    // FACTURAS
    { code: '001', name: 'Factura A', category: 'invoice' },
    { code: '006', name: 'Factura B', category: 'invoice' },
    { code: '011', name: 'Factura C', category: 'invoice' },
    { code: '051', name: 'Factura M', category: 'invoice' },
    { code: '019', name: 'Factura E (Exportación)', category: 'invoice' },
    
    // NOTAS DE CRÉDITO
    { code: '003', name: 'Nota de Crédito A', category: 'credit_note' },
    { code: '008', name: 'Nota de Crédito B', category: 'credit_note' },
    { code: '013', name: 'Nota de Crédito C', category: 'credit_note' },
    { code: '053', name: 'Nota de Crédito M', category: 'credit_note' },
    { code: '021', name: 'Nota de Crédito E', category: 'credit_note' },
    
    // NOTAS DE DÉBITO
    { code: '002', name: 'Nota de Débito A', category: 'debit_note' },
    { code: '007', name: 'Nota de Débito B', category: 'debit_note' },
    { code: '012', name: 'Nota de Débito C', category: 'debit_note' },
    { code: '052', name: 'Nota de Débito M', category: 'debit_note' },
    { code: '020', name: 'Nota de Débito E', category: 'debit_note' },
    
    // RECIBOS
    { code: '004', name: 'Recibo A', category: 'receipt' },
    { code: '009', name: 'Recibo B', category: 'receipt' },
    { code: '015', name: 'Recibo C', category: 'receipt' },
    { code: '049', name: 'Recibo M', category: 'receipt' },
    
    // FACTURA DE CRÉDITO ELECTRÓNICA MiPyME
    { code: '201', name: 'Factura de Crédito Electrónica MiPyME A', category: 'fce_mipyme' },
    { code: '206', name: 'Factura de Crédito Electrónica MiPyME B', category: 'fce_mipyme' },
    { code: '211', name: 'Factura de Crédito Electrónica MiPyME C', category: 'fce_mipyme' },
    
    { code: '203', name: 'Nota de Crédito FCE MiPyME A', category: 'credit_note' },
    { code: '208', name: 'Nota de Crédito FCE MiPyME B', category: 'credit_note' },
    { code: '213', name: 'Nota de Crédito FCE MiPyME C', category: 'credit_note' },
    
    { code: '207', name: 'Nota de Débito FCE MiPyME A', category: 'debit_note' },
    { code: '212', name: 'Nota de Débito FCE MiPyME B', category: 'debit_note' },
    { code: '217', name: 'Nota de Débito FCE MiPyME C', category: 'debit_note' },
    
    // REMITO ELECTRÓNICO
    { code: '995', name: 'Remito Electrónico', category: 'remito' },
    
    // BIENES USADOS
    { code: '027', name: 'Liquidación Bienes Usados A', category: 'used_goods' },
    { code: '028', name: 'Liquidación Bienes Usados B', category: 'used_goods' },
    { code: '030', name: 'Comprobante Compra Bienes Usados', category: 'used_goods_purchase' }
  ]


  const [items, setItems] = useState<Omit<InvoiceItem, 'id' | 'subtotal' | 'taxAmount'>[]>([])
  const [perceptions, setPerceptions] = useState<Omit<InvoicePerception, 'id' | 'baseAmount' | 'amount'>[]>([])

  const [totals, setTotals] = useState({
    subtotal: 0,
    totalTaxes: 0,
    totalPerceptions: 0,
    total: 0
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  // Load company and clients data
  const loadClientsData = async () => {
    if (!companyId) return
    
    try {
      const { clientService } = await import('@/services/client.service')
      const clients = await clientService.getClients(companyId)
      setSavedClients(clients)
    } catch (error) {
      console.error('Error loading clients:', error)
    }
  }
  
  useEffect(() => {
    // Expose reload function globally
    (window as any).reloadClients = loadClientsData
    
    return () => {
      delete (window as any).reloadClients
    }
  }, [companyId])
  
  useEffect(() => {
    const loadData = async () => {
      if (!companyId) return
      
      try {
        setIsLoadingData(true)
        
        // Load current company
        const company = await companyService.getCompany(companyId)
        console.log('Loaded company:', company)
        console.log('Tax condition:', company.taxCondition)
        setCurrentCompany({
          id: company.id,
          name: company.name,
          uniqueId: company.id,
          tax_condition: company.taxCondition || 'registered_taxpayer',
          default_sales_point: company.defaultSalesPoint || 1,
          defaultVat: company.defaultVat || 21,
          vatPerception: company.vatPerception || 0,
          grossIncomePerception: company.grossIncomePerception || 2.5,
          socialSecurityPerception: company.socialSecurityPerception || 1,
          vatRetention: company.vatRetention || 0,
          incomeTaxRetention: company.incomeTaxRetention || 2,
          grossIncomeRetention: company.grossIncomeRetention || 0.42,
          socialSecurityRetention: company.socialSecurityRetention || 0
        })
        
        // Tipos hardcodeados, no necesitamos cargarlos
        
        // Load connected companies
        try {
          const { networkService } = await import('@/services/network.service')
          const connections = await networkService.getConnections(companyId)
          const connectedCompaniesData = connections.map(conn => ({
            id: conn.connectedCompanyId,
            name: conn.connectedCompanyName,
            uniqueId: conn.connectedCompanyId,
            tax_condition: 'registered_taxpayer' // Default, would need to be fetched
          }))
          setConnectedCompanies(connectedCompaniesData)
        } catch (error) {
          console.error('Error loading connections:', error)
        }
        
        // Load saved clients
        try {
          const { clientService } = await import('@/services/client.service')
          const clients = await clientService.getClients(companyId)
          setSavedClients(clients)
        } catch (error) {
          console.error('Error loading clients:', error)
        }
        
        // Load AFIP certificate status
        try {
          const apiClient = (await import('@/lib/api-client')).default
          const certResponse = await apiClient.get(`/afip/companies/${companyId}/certificate`)
          setCert(certResponse.data.data)
        } catch (error: any) {
          // Si es 404, significa que no hay certificado configurado
          if (error.response?.status === 404) {
            setCert({ isActive: false })
          } else {
            console.error('Error loading certificate:', error)
            setCert({ isActive: false })
          }
        }
        
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Error al cargar datos de la empresa')
      } finally {
        setIsLoadingData(false)
      }
    }
    
    if (isAuthenticated) {
      loadData()
    }
  }, [companyId, isAuthenticated])



  useEffect(() => {
    if (currentCompany && !isInitialized) {
      setItems([{ description: '', quantity: 1, unitPrice: 0, taxRate: currentCompany.defaultVat || 21 }])
      setIsInitialized(true)
    }
  }, [currentCompany, isInitialized])

  const calculateTotals = useCallback(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const totalTaxes = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice
      // Exento (-1) y No Gravado (-2) no pagan IVA
      const taxRate = (item.taxRate && item.taxRate > 0) ? item.taxRate : 0
      const taxAmount = itemSubtotal * taxRate / 100
      return sum + taxAmount
    }, 0)
    
    const totalPerceptions = perceptions.reduce((sum, perception) => {
      let baseAmount
      if (perception.type === 'vat_perception') {
        baseAmount = totalTaxes // Percepción IVA solo sobre el IVA
      } else {
        baseAmount = subtotal + totalTaxes // Otras percepciones sobre subtotal + IVA
      }
      const perceptionAmount = baseAmount * perception.rate / 100
      return sum + perceptionAmount
    }, 0)
    
    setTotals({
      subtotal,
      totalTaxes,
      totalPerceptions,
      total: subtotal + totalTaxes + totalPerceptions
    })
  }, [items, perceptions])

  useEffect(() => {
    calculateTotals()
  }, [items, perceptions, calculateTotals])

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, taxRate: currentCompany?.defaultVat || 21 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof typeof items[0], value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const addPerception = () => {
    // Default to gross income perception with company's configured rate
    setPerceptions([...perceptions, { 
      type: 'gross_income_perception', 
      name: '', 
      rate: currentCompany?.grossIncomePerception || 2.5 
    }])
  }

  const getDefaultPerceptionRate = (type: string): number => {
    switch (type) {
      case 'vat_perception':
        return currentCompany?.vatPerception || 0
      case 'gross_income_perception':
        return currentCompany?.grossIncomePerception || 2.5
      case 'suss_perception':
        return currentCompany?.socialSecurityPerception || 1
      default:
        return 0
    }
  }

  const removePerception = (index: number) => {
    setPerceptions(perceptions.filter((_, i) => i !== index))
  }

  const updatePerception = (index: number, field: keyof typeof perceptions[0], value: string | number) => {
    const newPerceptions = [...perceptions]
    
    // If changing type, update rate to default for that type
    if (field === 'type') {
      const newType = value as string
      newPerceptions[index] = { 
        ...newPerceptions[index], 
        type: newType as any,
        rate: getDefaultPerceptionRate(newType)
      }
    } else {
      newPerceptions[index] = { ...newPerceptions[index], [field]: value }
    }
    
    setPerceptions(newPerceptions)
  }

  const selectedType = availableTypes.find(t => t.code === formData.voucherType)
  const isNoteType = selectedType?.category === 'credit_note' || selectedType?.category === 'debit_note'
  const showClientSelector = !isNoteType || (isNoteType && !associateInvoice)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.voucherType) {
      toast.error('Seleccione el tipo de comprobante')
      return
    }

    if (isNoteType && associateInvoice && !formData.relatedInvoiceId) {
      toast.error('Debe seleccionar la factura a asociar')
      return
    }

    // Solo validar cliente si NO es una nota asociada (el cliente se toma de la factura)
    if (!(isNoteType && associateInvoice) && !formData.clientData?.client_id && !formData.receiverCompanyId) {
      toast.error('Debe seleccionar un cliente')
      return
    }

    if (!formData.emissionDate || !formData.dueDate) {
      toast.error('Complete las fechas requeridas')
      return
    }

    if (items.some(item => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
      toast.error('Complete todos los ítems correctamente')
      return
    }

    if (selectedInvoice && totals.total > selectedInvoice.available_balance) {
      toast.error(`El monto no puede exceder el saldo disponible ($${selectedInvoice.available_balance.toLocaleString('es-AR')})`)
      return
    }

    setIsSubmitting(true)

    const isExistingClient = formData.clientData?.client_id
    
    const payload = (isNoteType && associateInvoice) ? {
      voucher_type: formData.voucherType,
      related_invoice_id: formData.relatedInvoiceId,
      sales_point: currentCompany?.default_sales_point || 1,
      issue_date: formData.emissionDate,
      due_date: formData.dueDate,
      currency: formData.currency,
      exchange_rate: formData.exchangeRate ? parseFloat(formData.exchangeRate) : undefined,
      notes: formData.notes,
      items: items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        tax_rate: item.taxRate || 0
      }))
    } : {
      client_id: isExistingClient ? formData.clientData?.client_id : undefined,
      receiver_company_id: formData.receiverCompanyId || undefined,
      client_data: !isExistingClient && formData.clientData ? formData.clientData : undefined,
      save_client: formData.saveClient,
      invoice_type: formData.voucherType,
      sales_point: currentCompany?.default_sales_point || 1,
      issue_date: formData.emissionDate,
      due_date: formData.dueDate,
      payment_due_date: formData.paymentDueDate || undefined,
      currency: formData.currency,
      exchange_rate: formData.exchangeRate ? parseFloat(formData.exchangeRate) : undefined,
      notes: formData.notes,
      items: items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        tax_rate: item.taxRate || 0
      })),
      perceptions: perceptions.length > 0 ? perceptions.map(p => ({
        type: p.type,
        name: p.name,
        rate: p.rate
      })) : undefined
    }

    try {
      const result = (isNoteType && associateInvoice)
        ? await voucherService.createVoucher(companyId, payload as any)
        : await invoiceService.createInvoice(companyId, payload as any)
      
      // Extraer el voucher/invoice de la respuesta
      const invoice = (isNoteType && associateInvoice) 
        ? (result.voucher || result) 
        : (result.invoice || result)
      
      // Siempre mostrar toast de éxito
      if (invoice?.afip_status === 'approved') {
        toast.success('Comprobante emitido exitosamente', {
          description: `CAE: ${invoice.afip_cae} - Total: ${totals.total.toLocaleString('es-AR', { style: 'currency', currency: formData.currency })}`
        })
      } else if (invoice?.afip_status === 'error') {
        toast.warning('Comprobante creado pero con error en AFIP', {
          description: invoice.afip_error_message || 'Error desconocido'
        })
      } else {
        // Fallback: mostrar éxito genérico si no hay afip_status
        toast.success('Comprobante creado exitosamente', {
          description: `Total: ${totals.total.toLocaleString('es-AR', { style: 'currency', currency: formData.currency })}`
        })
      }
      
      router.push(`/company/${companyId}/invoices`)
    } catch (error: any) {
      toast.error('Error al crear el comprobante', {
        description: error.response?.data?.message || error.message || 'Error desconocido'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) return null
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push(`/company/${companyId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Emitir Comprobante</h1>
            <p className="text-muted-foreground">Facturas, Notas de Crédito/Débito, Recibos</p>
          </div>
        </div>

        {cert && !cert.isActive && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900">Certificado AFIP no configurado</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Las facturas se crearán como borradores y NO serán válidas fiscalmente hasta que configures tu certificado AFIP.
                </p>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => router.push(`/company/${companyId}/verify`)}
                >
                  Configurar Certificado AFIP
                </Button>
              </div>
            </div>
          </div>
        )}

          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos Básicos */}
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
              <CardDescription>Seleccione el tipo de comprobante</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Comprobante *</Label>
                <Select 
                  value={formData.voucherType} 
                  onValueChange={(value) => {
                    setFormData({...formData, voucherType: value, relatedInvoiceId: ''})
                    setAssociateInvoice(false)
                  }}

                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione tipo de comprobante" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTypes.map((type) => (
                      <SelectItem key={type.code} value={type.code}>
                        <div className="flex flex-col">
                          <span className="font-medium">{type.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {type.category === 'invoice' && 'Factura'}
                            {type.category === 'credit_note' && 'Nota de Crédito'}
                            {type.category === 'debit_note' && 'Nota de Débito'}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Concepto */}
              <div className="space-y-2">
                <Label>Concepto *</Label>
                <Select 
                  value={formData.concept} 
                  onValueChange={(value: InvoiceConcept) => 
                    setFormData({...formData, concept: value})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="products">Productos</SelectItem>
                    <SelectItem value="services">Servicios</SelectItem>
                    <SelectItem value="products_services">Productos y Servicios</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isNoteType && (
                <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="associateInvoice"
                      checked={associateInvoice}
                      onChange={(e) => {
                        setAssociateInvoice(e.target.checked)
                        if (!e.target.checked) {
                          setFormData({ ...formData, relatedInvoiceId: '' })
                          setSelectedInvoice(null)
                        }
                      }}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="associateInvoice" className="cursor-pointer">
                      Asociar a una factura existente
                    </Label>
                  </div>
                  <p className="text-xs text-blue-700">
                    Opcional: Asociá esta nota a una factura específica para mejor trazabilidad
                  </p>
                </div>
              )}

              {isNoteType && associateInvoice && (
                <InvoiceSelector
                  companyId={companyId}
                  voucherType={formData.voucherType}
                  onSelect={(invoice) => {
                    setSelectedInvoice(invoice)
                    setFormData({ ...formData, relatedInvoiceId: invoice?.id || '' })
                  }}
                />
              )}

              {showClientSelector && (
                <div className="space-y-2">
                  <Label>Cliente *</Label>
                  <ClientSelector
                    companyId={companyId}
                    connectedCompanies={connectedCompanies}
                    savedClients={savedClients}
                    isLoading={isLoadingData}
                    onSelect={(data) => {
                      if (data.receiver_company_id) {
                        setFormData({
                          ...formData,
                          receiverCompanyId: data.receiver_company_id,
                          clientData: null,
                          saveClient: false
                        })
                      } else if (data.client_id) {
                        setFormData({
                          ...formData,
                          receiverCompanyId: '',
                          clientData: { client_id: data.client_id, ...data.client_data },
                          saveClient: false
                        })
                      } else if (data.client_data) {
                        setFormData({
                          ...formData,
                          receiverCompanyId: '',
                          clientData: data.client_data,
                          saveClient: data.save_client || false
                        })
                      }
                    }}
                  />
                </div>
              )}



              {/* Fechas y Moneda */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-2">
                  <Label htmlFor="emissionDate">Fecha de Emisión *</Label>
                  <DatePicker
                    date={formData.emissionDate ? new Date(formData.emissionDate) : undefined}
                    onSelect={(date) => setFormData({...formData, emissionDate: date ? date.toISOString().split('T')[0] : ''})}
                    placeholder="Seleccionar fecha de emisión"
                    minDate={selectedInvoice ? new Date(selectedInvoice.issue_date) : undefined}
                  />
                  {selectedInvoice && (
                    <p className="text-xs text-muted-foreground">
                      Fecha mínima: {new Date(selectedInvoice.issue_date).toLocaleDateString('es-AR')} (fecha de la factura)
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Fecha de Vencimiento *</Label>
                  <DatePicker
                    date={formData.dueDate ? new Date(formData.dueDate) : undefined}
                    onSelect={(date) => setFormData({...formData, dueDate: date ? date.toISOString().split('T')[0] : ''})}
                    placeholder="Seleccionar fecha de vencimiento"
                    minDate={formData.emissionDate ? new Date(formData.emissionDate) : new Date()}
                  />
                </div>

                {availableTypes.find(t => t.code === formData.voucherType)?.category === 'fce_mipyme' && (
                  <div className="space-y-2">
                    <Label htmlFor="paymentDueDate">Fecha Venc. Pago (FCE) *</Label>
                    <DatePicker
                      date={formData.paymentDueDate ? new Date(formData.paymentDueDate) : undefined}
                      onSelect={(date) => setFormData({...formData, paymentDueDate: date ? date.toISOString().split('T')[0] : ''})}
                      placeholder="Fecha límite de pago"
                      minDate={formData.emissionDate ? new Date(formData.emissionDate) : new Date()}
                    />
                    <p className="text-xs text-muted-foreground">
                      Obligatorio para FCE MiPyME
                    </p>
                  </div>
                )}

                {!selectedInvoice && (
                  <div className="space-y-2">
                    <Label>Moneda y Cotización *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select 
                        value={formData.currency} 
                        onValueChange={(value: Currency) => 
                          setFormData({...formData, currency: value, exchangeRate: value === 'ARS' ? '' : formData.exchangeRate})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ARS">Pesos Argentinos (ARS)</SelectItem>
                          <SelectItem value="USD">Dólares (USD)</SelectItem>
                          <SelectItem value="EUR">Euros (EUR)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Cotización"
                        value={formData.exchangeRate || ''}
                        onChange={(e) => setFormData({...formData, exchangeRate: e.target.value})}
                        disabled={formData.currency === 'ARS'}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ítems */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Ítems de la Factura
                <Button type="button" onClick={addItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Ítem
                </Button>
              </CardTitle>
              <CardDescription>Detalle de productos o servicios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                  <div className="md:col-span-2 space-y-2">
                    <Label>Descripción *</Label>
                    <Input
                      placeholder="Descripción del ítem"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value.slice(0, 200))}
                      maxLength={200}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Cantidad *</Label>
                    <Input
                      type="number"
                      min="1"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Precio Unit. *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>IVA (%)</Label>
                    <Select 
                      value={(item.taxRate ?? currentCompany?.defaultVat ?? 21).toString()} 
                      onValueChange={(value) => updateItem(index, 'taxRate', parseFloat(value))}
                    >
                      <SelectTrigger>
                        <SelectValue>
                          {(item.taxRate ?? currentCompany?.defaultVat ?? 21) === -1 ? 'Exento' : 
                           (item.taxRate ?? currentCompany?.defaultVat ?? 21) === -2 ? 'No Gravado' : 
                           `${item.taxRate ?? currentCompany?.defaultVat ?? 21}%`}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-1">Exento</SelectItem>
                        <SelectItem value="-2">No Gravado</SelectItem>
                        <SelectItem value="0">0%</SelectItem>
                        <SelectItem value="2.5">2.5%</SelectItem>
                        <SelectItem value="5">5%</SelectItem>
                        <SelectItem value="10.5">10.5%</SelectItem>
                        <SelectItem value="21">21%</SelectItem>
                        <SelectItem value="27">27%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Percepciones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Percepciones
                <Button type="button" onClick={addPerception} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Percepción
                </Button>
              </CardTitle>
              <CardDescription>Percepciones aplicables según jurisdicción</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {perceptions.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">No hay percepciones aplicadas</p>
                  <p className="text-xs">Las percepciones se agregan según la jurisdicción</p>
                </div>
              ) : (
                perceptions.map((perception, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label>Tipo de Percepción</Label>
                      <Select 
                        value={perception.type} 
                        onValueChange={(value: typeof perception.type) => updatePerception(index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vat_perception">Percepción IVA</SelectItem>
                          <SelectItem value="gross_income_perception">Percepción IIBB</SelectItem>
                          <SelectItem value="suss_perception">Percepción SUSS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Descripción</Label>
                      <Input
                        placeholder="Ej: Percepción IIBB Buenos Aires"
                        value={perception.name}
                        onChange={(e) => updatePerception(index, 'name', e.target.value.slice(0, 100))}
                        maxLength={100}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Alícuota (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max={perception.type === 'vat_perception' ? 10 : perception.type === 'gross_income_perception' ? 5 : 2}
                        step="0.01"
                        value={perception.rate}
                        onChange={(e) => {
                          const maxRate = perception.type === 'vat_perception' ? 10 : perception.type === 'gross_income_perception' ? 5 : 2
                          const value = Math.min(parseFloat(e.target.value) || 0, maxRate)
                          updatePerception(index, 'rate', value)
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        Límite AFIP: {perception.type === 'vat_perception' ? '0-10%' : perception.type === 'gross_income_perception' ? '0-5%' : '0-2%'}
                      </p>
                    </div>
                    
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removePerception(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Totales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Resumen de Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">
                    {totals.subtotal.toLocaleString('es-AR', { style: 'currency', currency: formData.currency })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Impuestos:</span>
                  <span className="font-medium">
                    {totals.totalTaxes.toLocaleString('es-AR', { style: 'currency', currency: formData.currency })}
                  </span>
                </div>
                {totals.totalPerceptions > 0 && (
                  <div className="flex justify-between">
                    <span>Total Percepciones:</span>
                    <span className="font-medium text-orange-600">
                      {totals.totalPerceptions.toLocaleString('es-AR', { style: 'currency', currency: formData.currency })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>
                    {totals.total.toLocaleString('es-AR', { style: 'currency', currency: formData.currency })}
                  </span>
                </div>
                {selectedInvoice && (
                  <div className="flex justify-between text-sm text-muted-foreground border-t pt-2">
                    <span>Saldo Disponible:</span>
                    <span className={totals.total > selectedInvoice.available_balance ? 'text-red-600 font-bold' : 'text-green-600'}>
                      ${selectedInvoice.available_balance.toLocaleString('es-AR')}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notas y Archivo */}
          <Card>
            <CardHeader>
              <CardTitle>Información Adicional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notas Internas</Label>
                <Textarea
                  id="notes"
                  placeholder="Notas adicionales sobre la factura..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value.slice(0, 500)})}
                  maxLength={500}
                />
              </div>
            </CardContent>
          </Card>

            {/* Acciones */}
            <div className="flex gap-4">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Emitiendo...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Emitir Comprobante
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push(`/company/${companyId}`)}
              >
                Cancelar
              </Button>
            </div>
          </form>
      </div>
    </div>
  )
}