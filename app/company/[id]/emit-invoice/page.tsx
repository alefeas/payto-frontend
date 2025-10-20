"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Plus, Trash2, Calculator, FileText, Shield, Loader2, Download } from "lucide-react"

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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  isPerceptionAgent?: boolean
  autoPerceptions?: any[]
  isRetentionAgent?: boolean
  autoRetentions?: any[]
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
  const [isLoadingSalesPoints, setIsLoadingSalesPoints] = useState(true)
  const [isSyncingSalesPoints, setIsSyncingSalesPoints] = useState(false)
  const [cert, setCert] = useState<{ isActive: boolean } | null>(null)
  const [isLoadingCert, setIsLoadingCert] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [associateInvoice, setAssociateInvoice] = useState(false)
  const [salesPoints, setSalesPoints] = useState<{id: string, point_number: number, name: string | null}[]>([])

  const [formData, setFormData] = useState({
    voucherType: '',
    concept: 'products' as InvoiceConcept,
    relatedInvoiceId: '',
    receiverCompanyId: '',
    clientData: null as { client_id?: string; [key: string]: unknown } | null,
    saveClient: false,
    salesPoint: 0,
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
  const [nextVoucherNumber, setNextVoucherNumber] = useState<string>('')
  const [isLoadingNumber, setIsLoadingNumber] = useState(false)
  const [showAddSalesPointDialog, setShowAddSalesPointDialog] = useState(false)
  const [salesPointFormData, setSalesPointFormData] = useState({ point_number: '', name: '' })
  const [addingSalesPoint, setAddingSalesPoint] = useState(false)

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
        console.log('isPerceptionAgent:', company.isPerceptionAgent)
        console.log('autoPerceptions:', company.autoPerceptions)
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
          socialSecurityRetention: company.socialSecurityRetention || 0,
          isPerceptionAgent: company.isPerceptionAgent || false,
          autoPerceptions: company.autoPerceptions || [],
          isRetentionAgent: company.isRetentionAgent || false,
          autoRetentions: company.autoRetentions || []
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
        } catch (error: any) {
          // Silently fail if user doesn't have permission
          if (error.response?.status !== 403) {
            console.error('Error loading connections:', error)
          }
          setConnectedCompanies([])
        }
        
        // Load saved clients
        try {
          const { clientService } = await import('@/services/client.service')
          const clients = await clientService.getClients(companyId)
          setSavedClients(clients)
        } catch (error) {
          console.error('Error loading clients:', error)
        }
        
        // Load sales points
        setIsLoadingSalesPoints(true)
        try {
          const apiClient = (await import('@/lib/api-client')).default
          const spResponse = await apiClient.get(`/companies/${companyId}/sales-points`)
          const points = spResponse.data.data || []
          setSalesPoints(points)
          
          // Set default sales point
          if (points.length > 0) {
            const defaultPoint = points.find((p: any) => p.point_number === company.defaultSalesPoint) || points[0]
            setFormData(prev => ({ ...prev, salesPoint: defaultPoint.point_number }))
          } else if (company.defaultSalesPoint) {
            setFormData(prev => ({ ...prev, salesPoint: company.defaultSalesPoint }))
          }
        } catch (error) {
          console.error('Error loading sales points:', error)
          // Fallback to company default
          if (company.defaultSalesPoint) {
            setFormData(prev => ({ ...prev, salesPoint: company.defaultSalesPoint }))
          }
        } finally {
          setIsLoadingSalesPoints(false)
        }
        
        // Load AFIP certificate status
        setIsLoadingCert(true)
        try {
          const apiClient = (await import('@/lib/api-client')).default
          const certResponse = await apiClient.get(`/companies/${companyId}/afip/certificate`)
          setCert(certResponse.data.data)
        } catch (error: any) {
          if (error.response?.status === 404) {
            setCert({ isActive: false })
          } else {
            console.error('Error loading certificate:', error)
            setCert({ isActive: false })
          }
        } finally {
          setIsLoadingCert(false)
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
      console.log('Initializing with company:', currentCompany)
      setItems([{ description: '', quantity: 1, unitPrice: 0, discountPercentage: 0, taxRate: currentCompany.defaultVat || 21 }])
      
      // Load auto-perceptions if company is perception agent with smooth animation
      if (currentCompany.isPerceptionAgent && currentCompany.autoPerceptions && currentCompany.autoPerceptions.length > 0) {
        console.log('Loading auto-perceptions:', currentCompany.autoPerceptions)
        // Add perceptions one by one with delay for smooth animation
        const perceptionsToAdd = currentCompany.autoPerceptions.map((p: any) => ({
          type: p.type,
          name: p.name,
          rate: p.rate,
          baseType: p.base_type || 'net',
          jurisdiction: p.jurisdiction
        }))
        
        perceptionsToAdd.forEach((perception, index) => {
          setTimeout(() => {
            setPerceptions(prev => [...prev, perception])
          }, index * 100) // 100ms delay between each perception
        })
      } else {
        console.log('No auto-perceptions to load')
      }
      
      setIsInitialized(true)
    }
  }, [currentCompany, isInitialized])

  const calculateTotals = useCallback(() => {
    const subtotal = items.reduce((sum, item) => {
      const itemBase = item.quantity * item.unitPrice
      const discount = (item.discountPercentage || 0) / 100
      return sum + (itemBase * (1 - discount))
    }, 0)
    const totalTaxes = items.reduce((sum, item) => {
      const itemBase = item.quantity * item.unitPrice
      const discount = (item.discountPercentage || 0) / 100
      const itemSubtotal = itemBase * (1 - discount)
      // Exento (-1) y No Gravado (-2) no pagan IVA
      const taxRate = (item.taxRate && item.taxRate > 0) ? item.taxRate : 0
      const taxAmount = itemSubtotal * taxRate / 100
      return sum + taxAmount
    }, 0)
    
    const totalPerceptions = perceptions.reduce((sum, perception) => {
      // Calculate base according to baseType
      let base = subtotal // default: net (without IVA)
      if (perception.baseType === 'total') {
        base = subtotal + totalTaxes // total with IVA
      } else if (perception.baseType === 'vat') {
        base = totalTaxes // only IVA
      }
      const perceptionAmount = base * (perception.rate || 0) / 100
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

  // Consultar próximo número cuando cambia tipo de factura o punto de venta
  useEffect(() => {
    const loadNextNumber = async () => {
      if (!formData.voucherType || !formData.salesPoint) return
      
      setIsLoadingNumber(true)
      try {
        const data = await invoiceService.getNextNumber(
          companyId,
          formData.salesPoint,
          formData.voucherType
        )
        setNextVoucherNumber(data.formatted_number)
      } catch (error) {
        console.error('Error loading next number:', error)
        setNextVoucherNumber('0001-00000001')
      } finally {
        setIsLoadingNumber(false)
      }
    }

    loadNextNumber()
  }, [formData.voucherType, formData.salesPoint, companyId])

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, discountPercentage: 0, taxRate: currentCompany?.defaultVat || 21 }])
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

  const getTaxRateLabel = (rate: number | undefined): string => {
    const actualRate = rate !== undefined ? rate : (currentCompany?.defaultVat ?? 21)
    const numRate = Number(actualRate)
    if (numRate === -1) return 'Exento'
    if (numRate === -2) return 'No Gravado'
    return `${actualRate}%`
  }

  const calculateItemTotal = (item: typeof items[0]) => {
    const base = item.quantity * item.unitPrice
    const discount = (item.discountPercentage || 0) / 100
    const subtotal = base * (1 - discount)
    const taxRate = (item.taxRate && item.taxRate > 0) ? item.taxRate : 0
    const tax = subtotal * taxRate / 100
    return { subtotal, total: subtotal + tax }
  }

  const addPerception = () => {
    setPerceptions([...perceptions, { 
      type: 'iibb_bsas', 
      name: '', 
      rate: 2.5,
      jurisdiction: 'Buenos Aires',
      baseType: 'net'
    }])
  }

  const getDefaultPerceptionRate = (type: string): number => {
    if (type.startsWith('iibb_')) return 3
    if (type === 'iva') return 10
    if (type === 'ganancias') return 2
    return 0
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

    if (perceptions.some(p => !p.name || !p.name.trim())) {
      toast.error('Complete el nombre/descripción de todas las percepciones')
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
      sales_point: formData.salesPoint,
      issue_date: formData.emissionDate,
      due_date: formData.dueDate,
      currency: formData.currency,
      exchange_rate: formData.exchangeRate ? parseFloat(formData.exchangeRate) : undefined,
      notes: formData.notes,
      items: items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount_percentage: item.discountPercentage || 0,
        tax_rate: (item.taxRate && item.taxRate > 0) ? item.taxRate : 0
      }))
    } : {
      client_id: isExistingClient ? formData.clientData?.client_id : undefined,
      receiver_company_id: formData.receiverCompanyId || undefined,
      client_data: !isExistingClient && formData.clientData ? formData.clientData : undefined,
      save_client: formData.saveClient,
      invoice_type: formData.voucherType,
      sales_point: formData.salesPoint,
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
        discount_percentage: item.discountPercentage || 0,
        tax_rate: (item.taxRate && item.taxRate > 0) ? item.taxRate : 0
      })),
      perceptions: perceptions.length > 0 ? perceptions.map(p => ({
        type: p.type,
        name: p.name,
        rate: p.rate,
        base_type: p.baseType || 'net'
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
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Error desconocido'
      toast.error('Error al crear el comprobante', {
        description: errorMessage
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

        {isLoadingCert ? (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              <p className="text-sm text-blue-700">Verificando certificado AFIP...</p>
            </div>
          </div>
        ) : cert && !cert.isActive && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">Certificado AFIP requerido</h3>
                <p className="text-sm text-red-700 mt-1">
                  No puedes emitir facturas electrónicas sin un certificado AFIP activo. Configura tu certificado para comenzar a facturar.
                </p>
                <Button 
                  type="button"
                  variant="default" 
                  size="sm" 
                  className="mt-2 bg-red-600 hover:bg-red-700"
                  onClick={() => router.push(`/company/${companyId}/verify`)}
                >
                  Configurar Certificado AFIP Ahora
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
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 flex-1">
                  <Label className="h-4 flex items-center">Tipo de Comprobante *</Label>
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

                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <Label className="h-4 flex items-center">Punto de Venta *</Label>
                    <div className="flex gap-1">
                      <Button 
                        type="button" 
                        size="icon" 
                        variant="ghost"
                        className="h-4 w-4 p-0 shrink-0"
                        onClick={async () => {
                          setIsSyncingSalesPoints(true)
                          try {
                            const apiClient = (await import('@/lib/api-client')).default
                            const response = await apiClient.post(`/companies/${companyId}/sales-points/sync-from-afip`)
                            toast.success(`Sincronizados: ${response.data.created} nuevos, ${response.data.synced} actualizados`)
                            const spResponse = await apiClient.get(`/companies/${companyId}/sales-points`)
                            setSalesPoints(spResponse.data.data || [])
                          } catch (error: any) {
                            toast.error(error.response?.data?.error || 'Error al sincronizar con AFIP')
                          } finally {
                            setIsSyncingSalesPoints(false)
                          }
                        }}
                        disabled={isLoadingSalesPoints || isSyncingSalesPoints}
                        title="Sincronizar con AFIP"
                      >
                        {isSyncingSalesPoints ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                      </Button>
                      <Button 
                        type="button" 
                        size="icon" 
                        variant="ghost"
                        className="h-4 w-4 p-0 shrink-0"
                        onClick={() => setShowAddSalesPointDialog(true)}
                        disabled={isLoadingSalesPoints}
                        title="Agregar punto de venta"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {isLoadingSalesPoints ? (
                    <div className="flex items-center h-10 px-3 border rounded-md bg-muted">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">Cargando...</span>
                    </div>
                  ) : (
                    <>
                      <Select 
                        value={formData.salesPoint.toString()} 
                        onValueChange={(value) => setFormData({...formData, salesPoint: parseInt(value)})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione punto de venta" />
                        </SelectTrigger>
                        <SelectContent>
                          {salesPoints.length > 0 ? (
                            salesPoints.map((sp) => (
                              <SelectItem key={sp.id} value={sp.point_number.toString()}>
                                {sp.point_number.toString().padStart(4, '0')}{sp.name ? ` - ${sp.name}` : ''}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value={currentCompany?.default_sales_point?.toString() || '1'}>
                              {(currentCompany?.default_sales_point || 1).toString().padStart(4, '0')}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {salesPoints.length === 0 && (
                        <p className="text-xs text-amber-600">
                          No hay puntos de venta. Sincronizá desde AFIP o agregá uno manualmente.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Número de Comprobante (readonly) */}
              <div className="space-y-2 transition-all duration-300 ease-in-out" style={{ 
                opacity: nextVoucherNumber ? 1 : 0,
                maxHeight: nextVoucherNumber ? '200px' : '0px',
                overflow: 'hidden'
              }}>
                <Label>Número de Comprobante</Label>
                <div className="relative">
                  <Input
                    value={nextVoucherNumber}
                    readOnly
                    disabled
                    className="bg-gray-100 dark:bg-gray-800 font-mono"
                  />
                  {isLoadingNumber && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Próximo número disponible según AFIP
                </p>
              </div>

              {/* Concepto y Moneda */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                {!selectedInvoice && (
                  <div className="space-y-2">
                    <Label>Moneda *</Label>
                    <div className="flex gap-2">
                      <Select 
                        value={formData.currency} 
                        onValueChange={(value: Currency) => 
                          setFormData({...formData, currency: value, exchangeRate: value === 'ARS' ? '1' : formData.exchangeRate})}
                      >
                        <SelectTrigger className="flex-1 h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ARS">ARS</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
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
                        className="flex-1 h-10"
                      />
                    </div>
                  </div>
                )}
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
                    maxDate={new Date()}
                  />
                  <p className="text-xs text-muted-foreground">
                    {selectedInvoice 
                      ? `Fecha mínima: ${new Date(selectedInvoice.issue_date).toLocaleDateString('es-AR')} (fecha de la factura)`
                      : 'No se permiten fechas futuras según normativa AFIP'
                    }
                  </p>
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
              {items.map((item, index) => {
                const itemTotals = calculateItemTotal(item)
                return (
                <div key={index} className="space-y-3 p-4 border rounded-lg relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="absolute top-2 right-2 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-30"
                    title="Eliminar ítem"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  
                  <div className="grid grid-cols-1 gap-4 pr-10">
                    <div className="space-y-2">
                      <Label>Descripción *</Label>
                      <Input
                        placeholder="Descripción del ítem"
                        value={item.description ?? ''}
                        onChange={(e) => updateItem(index, 'description', e.target.value.slice(0, 200))}
                        maxLength={200}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="space-y-2">
                        <Label>Cantidad *</Label>
                        <Input
                          type="number"
                          min="1"
                          step="0.01"
                          value={item.quantity ?? 1}
                          onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Precio Unit. *</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice ?? 0}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Bonif. (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={item.discountPercentage ?? 0}
                          onChange={(e) => {
                            const value = Math.min(Math.max(parseFloat(e.target.value) || 0, 0), 100)
                            updateItem(index, 'discountPercentage', value)
                          }}
                          onBlur={(e) => {
                            const value = Math.min(Math.max(parseFloat(e.target.value) || 0, 0), 100)
                            updateItem(index, 'discountPercentage', value)
                          }}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>IVA *</Label>
                        <Select 
                          value={(item.taxRate ?? currentCompany?.defaultVat ?? 21).toString()} 
                          onValueChange={(value) => updateItem(index, 'taxRate', parseFloat(value))}
                        >
                          <SelectTrigger>
                            <SelectValue>
                              {getTaxRateLabel(item.taxRate)}
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
                      
                      <div className="space-y-2">
                        <Label className="text-xs">Total</Label>
                        <div className="h-10 flex items-center justify-end px-3 bg-muted rounded-md font-medium">
                          ${itemTotals.total.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-4 text-sm border-t pt-2">
                    <span className="text-muted-foreground">Subtotal: <span className="font-medium text-foreground">${itemTotals.subtotal.toFixed(2)}</span></span>
                    <span className="text-muted-foreground">IVA: <span className="font-medium text-foreground">${(itemTotals.total - itemTotals.subtotal).toFixed(2)}</span></span>
                    <span className="text-muted-foreground">Total: <span className="font-medium text-foreground">${itemTotals.total.toFixed(2)}</span></span>
                  </div>
                </div>
              )
              })}
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
                perceptions.map((perception, index) => {
                  // Calculate perception amount
                  let base = totals.subtotal
                  if (perception.baseType === 'total') {
                    base = totals.subtotal + totals.totalTaxes
                  } else if (perception.baseType === 'vat') {
                    base = totals.totalTaxes
                  }
                  const perceptionAmount = base * (perception.rate || 0) / 100
                  
                  return (
                  <div key={index} className="space-y-3 p-4 border rounded-lg relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removePerception(index)}
                      className="absolute top-2 right-2 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Eliminar percepción"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                        <div className="space-y-2">
                          <Label>Tipo de Percepción *</Label>
                          <Select 
                            value={perception.type} 
                            onValueChange={(value: typeof perception.type) => updatePerception(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                              <SelectItem value="iva">Percepción IVA</SelectItem>
                              <SelectItem value="ganancias">Percepción Ganancias</SelectItem>
                              <SelectItem value="impuestos_internos">Impuestos Internos</SelectItem>
                              <SelectItem value="iibb_bsas">IIBB Buenos Aires</SelectItem>
                              <SelectItem value="iibb_caba">IIBB CABA</SelectItem>
                              <SelectItem value="iibb_catamarca">IIBB Catamarca</SelectItem>
                              <SelectItem value="iibb_chaco">IIBB Chaco</SelectItem>
                              <SelectItem value="iibb_chubut">IIBB Chubut</SelectItem>
                              <SelectItem value="iibb_cordoba">IIBB Córdoba</SelectItem>
                              <SelectItem value="iibb_corrientes">IIBB Corrientes</SelectItem>
                              <SelectItem value="iibb_entrerios">IIBB Entre Ríos</SelectItem>
                              <SelectItem value="iibb_formosa">IIBB Formosa</SelectItem>
                              <SelectItem value="iibb_jujuy">IIBB Jujuy</SelectItem>
                              <SelectItem value="iibb_lapampa">IIBB La Pampa</SelectItem>
                              <SelectItem value="iibb_larioja">IIBB La Rioja</SelectItem>
                              <SelectItem value="iibb_mendoza">IIBB Mendoza</SelectItem>
                              <SelectItem value="iibb_misiones">IIBB Misiones</SelectItem>
                              <SelectItem value="iibb_neuquen">IIBB Neuquén</SelectItem>
                              <SelectItem value="iibb_rionegro">IIBB Río Negro</SelectItem>
                              <SelectItem value="iibb_salta">IIBB Salta</SelectItem>
                              <SelectItem value="iibb_sanjuan">IIBB San Juan</SelectItem>
                              <SelectItem value="iibb_sanluis">IIBB San Luis</SelectItem>
                              <SelectItem value="iibb_santacruz">IIBB Santa Cruz</SelectItem>
                              <SelectItem value="iibb_santafe">IIBB Santa Fe</SelectItem>
                              <SelectItem value="iibb_sgo_estero">IIBB Santiago del Estero</SelectItem>
                              <SelectItem value="iibb_tdf">IIBB Tierra del Fuego</SelectItem>
                              <SelectItem value="iibb_tucuman">IIBB Tucumán</SelectItem>
                              <SelectItem value="custom">Otra Percepción</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Descripción *</Label>
                          <Input
                            placeholder="Ej: Percepción IIBB Buenos Aires"
                            value={perception.name ?? ''}
                            onChange={(e) => updatePerception(index, 'name', e.target.value.slice(0, 100))}
                            maxLength={100}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Alícuota (%) *</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            placeholder="Ej: 3.5"
                            value={perception.rate ?? ''}
                            onChange={(e) => updatePerception(index, 'rate', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Base de Cálculo *</Label>
                          <Select 
                            value={perception.baseType || 'net'} 
                            onValueChange={(value: 'net' | 'total' | 'vat') => updatePerception(index, 'baseType', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="net">Neto sin IVA</SelectItem>
                              <SelectItem value="total">Total con IVA</SelectItem>
                              <SelectItem value="vat">Solo IVA</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-xs">Monto</Label>
                          <div className="h-10 flex items-center justify-end px-3 bg-muted rounded-md font-medium">
                            ${perceptionAmount.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-4 text-sm border-t pt-2">
                      <span className="text-muted-foreground">Base: <span className="font-medium text-foreground">${base.toFixed(2)}</span></span>
                      <span className="text-muted-foreground">Alícuota: <span className="font-medium text-foreground">{perception.rate || 0}%</span></span>
                      <span className="text-muted-foreground">Total: <span className="font-medium text-orange-600">${perceptionAmount.toFixed(2)}</span></span>
                    </div>
                  </div>
                  )
                })
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
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isSubmitting || (cert && !cert.isActive)}
              >
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

          {/* Add Sales Point Dialog */}
          <Dialog open={showAddSalesPointDialog} onOpenChange={setShowAddSalesPointDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Punto de Venta</DialogTitle>
                <DialogDescription>Configura un nuevo punto de venta para emitir facturas</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Número de Punto de Venta *</Label>
                  <Input 
                    type="text" 
                    placeholder="1" 
                    value={salesPointFormData.point_number} 
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                      setSalesPointFormData({...salesPointFormData, point_number: value})
                    }} 
                    maxLength={4}
                  />
                  <p className="text-xs text-muted-foreground">Número entre 1 y 9999 (máx. 4 dígitos)</p>
                </div>
                <div className="space-y-2">
                  <Label>Nombre (opcional)</Label>
                  <Input 
                    placeholder="Sucursal Centro" 
                    value={salesPointFormData.name} 
                    onChange={(e) => setSalesPointFormData({...salesPointFormData, name: e.target.value.slice(0, 100)})} 
                    maxLength={100}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setShowAddSalesPointDialog(false); setSalesPointFormData({ point_number: '', name: '' }); }} disabled={addingSalesPoint}>Cancelar</Button>
                <Button onClick={async () => {
                  if (!salesPointFormData.point_number) {
                    toast.error('Ingresa el número de punto de venta')
                    return
                  }
                  setAddingSalesPoint(true)
                  try {
                    const apiClient = (await import('@/lib/api-client')).default
                    const response = await apiClient.post(`/companies/${companyId}/sales-points`, {
                      point_number: parseInt(salesPointFormData.point_number),
                      name: salesPointFormData.name || null
                    })
                    const newSalesPoint = response.data.data
                    setSalesPoints([...salesPoints, newSalesPoint])
                    setFormData({...formData, salesPoint: newSalesPoint.point_number})
                    toast.success('Punto de venta agregado')
                    setShowAddSalesPointDialog(false)
                    setSalesPointFormData({ point_number: '', name: '' })
                  } catch (error: any) {
                    toast.error(error.response?.data?.error || 'Error al agregar punto de venta')
                  } finally {
                    setAddingSalesPoint(false)
                  }
                }} disabled={addingSalesPoint}>{addingSalesPoint ? 'Agregando...' : 'Agregar'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
      </div>
    </div>
  )
}