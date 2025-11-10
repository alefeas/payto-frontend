"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Plus, Trash2, FileText, Receipt, Calculator, Loader2, Upload, Info } from "lucide-react"
import { toast } from "sonner"
import { formatDateToLocal, parseDateLocal } from "@/lib/utils"
import { invoiceService } from "@/services/invoice.service"
import { clientService } from "@/services/client.service"
import { supplierService } from "@/services/supplier.service"
import { companyService } from "@/services/company.service"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ClientForm } from "@/components/clients/ClientForm"
import { SupplierForm } from "@/components/suppliers/SupplierForm"
import { EntitySelector } from "@/components/invoices/EntitySelector"
import { InvoiceSelector } from "@/components/vouchers/InvoiceSelector"
import { DatePicker } from "@/components/ui/date-picker"

interface ManualInvoiceFormProps {
  companyId: string
  onReady?: () => void
  onSuccess?: () => void
  onCancel?: () => void
}

interface InvoiceItem {
  description: string
  quantity: number
  unit_price: number
  discount_percentage: number
  tax_rate: number
}

interface Perception {
  type: string
  name: string
  rate: number
  jurisdiction?: string
  base_type: string
}

export function ManualInvoiceForm({ companyId, onReady, onSuccess, onCancel }: ManualInvoiceFormProps) {
  const [mode, setMode] = useState<"issued" | "received">("received")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, unit_price: 0, discount_percentage: 0, tax_rate: 21 }
  ])
  const [perceptions, setPerceptions] = useState<Perception[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [connectedCompanies, setConnectedCompanies] = useState<any[]>([])
  const [loadingClients, setLoadingClients] = useState(false)
  const [loadingSuppliers, setLoadingSuppliers] = useState(false)
  const [receiverType, setReceiverType] = useState<"client" | "company">("client")
  const [currency, setCurrency] = useState("ARS")
  const [invoiceType, setInvoiceType] = useState("")
  const [salesPoint, setSalesPoint] = useState("")
  const [voucherNumber, setVoucherNumber] = useState("")
  const [issueDate, setIssueDate] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [concept, setConcept] = useState("products")
  const [exchangeRate, setExchangeRate] = useState("1")
  const [cae, setCae] = useState("")
  const [caeExpiration, setCaeExpiration] = useState("")
  const [notes, setNotes] = useState("")
  const [selectedClient, setSelectedClient] = useState("")
  const [selectedSupplier, setSelectedSupplier] = useState("")
  const [selectedCompany, setSelectedCompany] = useState("")
  const [serviceDateFrom, setServiceDateFrom] = useState("")
  const [serviceDateTo, setServiceDateTo] = useState("")
  const [currentCompany, setCurrentCompany] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [associateInvoice, setAssociateInvoice] = useState(false)
  const [relatedInvoiceId, setRelatedInvoiceId] = useState("")
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)

  useEffect(() => {
    const initializeData = async () => {
      console.log('[ManualInvoiceForm] Iniciando carga de datos...')
      setIsLoadingData(true)
      
      try {
        console.log('[ManualInvoiceForm] Cargando datos de empresa...')
        await loadCompanyData()
        console.log('[ManualInvoiceForm] Datos de empresa cargados')
        
        console.log('[ManualInvoiceForm] Cargando clientes, proveedores y empresas conectadas...')
        await Promise.all([
          loadClients(),
          loadSuppliers(),
          loadConnectedCompanies()
        ])
        console.log('[ManualInvoiceForm] Todos los datos cargados exitosamente')
        
        setIsLoadingData(false)
        console.log('[ManualInvoiceForm] isLoadingData = false')
        
        console.log('[ManualInvoiceForm] Llamando onReady()')
        onReady?.()
        console.log('[ManualInvoiceForm] onReady() ejecutado')
      } catch (error) {
        console.error('[ManualInvoiceForm] Error durante la inicialización:', error)
        setIsLoadingData(false)
        onReady?.()
      }
    }
    initializeData()
  }, [])

  // Limpiar fechas de servicio cuando el concepto cambie a "products"
  useEffect(() => {
    if (concept === 'products' && !associateInvoice) {
      setServiceDateFrom('')
      setServiceDateTo('')
    }
  }, [concept, associateInvoice])

  useEffect(() => {
    // Resetear selección de factura asociada al cambiar de pestaña
    setAssociateInvoice(false)
    setRelatedInvoiceId('')
    setSelectedInvoice(null)
    
    if (mode === "issued") {
      // Cargar percepciones default solo para emitidas
      if (currentCompany && currentCompany.isPerceptionAgent && currentCompany.autoPerceptions && currentCompany.autoPerceptions.length > 0) {
        const perceptionsToAdd = currentCompany.autoPerceptions.map((p: any) => ({
          type: p.type,
          name: p.name,
          rate: p.rate,
          base_type: p.base_type || 'net',
          jurisdiction: p.jurisdiction
        }))
        setPerceptions(perceptionsToAdd)
      }
    } else {
      // Limpiar percepciones cuando se cambia a recibidas
      setPerceptions([])
    }
  }, [mode, currentCompany])

  const loadCompanyData = async () => {
    try {
      console.log('[loadCompanyData] Iniciando carga para companyId:', companyId)
      const company = await companyService.getCompany(companyId)
      console.log('[loadCompanyData] Empresa cargada:', company?.name)
      setCurrentCompany(company)
    } catch (error) {
      console.error('[loadCompanyData] Error loading company:', error)
      throw error
    }
  }



  const loadClients = async () => {
    try {
      console.log('[loadClients] Iniciando carga de clientes')
      setLoadingClients(true)
      const data = await clientService.getClients(companyId)
      console.log('[loadClients] Clientes cargados:', data?.length)
      setClients(data)
    } catch (error) {
      console.error('[loadClients] Error:', error)
      toast.error("Error al cargar clientes")
    } finally {
      setLoadingClients(false)
    }
  }

  const loadSuppliers = async () => {
    try {
      console.log('[loadSuppliers] Iniciando carga de proveedores')
      setLoadingSuppliers(true)
      const data = await supplierService.getSuppliers(companyId)
      console.log('[loadSuppliers] Proveedores cargados:', data?.length)
      setSuppliers(data)
    } catch (error) {
      console.error('[loadSuppliers] Error:', error)
      toast.error("Error al cargar proveedores")
    } finally {
      setLoadingSuppliers(false)
    }
  }

  const loadConnectedCompanies = async () => {
    try {
      console.log('[loadConnectedCompanies] Iniciando carga de empresas conectadas')
      const { networkService } = await import('@/services/network.service')
      const connections = await networkService.getConnections(companyId)
      console.log('[loadConnectedCompanies] Empresas conectadas cargadas:', connections?.length)
      setConnectedCompanies(connections.map(conn => ({
        id: conn.connectedCompanyId,
        name: conn.connectedCompanyName,
        national_id: conn.connectedCompanyCuit,
        tax_condition: conn.connectedCompanyTaxCondition
      })))
    } catch (error: any) {
      console.error('[loadConnectedCompanies] Error loading connected companies:', error)
      setConnectedCompanies([])
    }
  }

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unit_price: 0, discount_percentage: 0, tax_rate: 21 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const addPerception = () => {
    setPerceptions([...perceptions, { type: "vat_perception", name: "", rate: 0, base_type: "net" }])
  }

  const removePerception = (index: number) => {
    setPerceptions(perceptions.filter((_, i) => i !== index))
  }

  const updatePerception = (index: number, field: keyof Perception, value: any) => {
    const newPerceptions = [...perceptions]
    newPerceptions[index] = { ...newPerceptions[index], [field]: value }
    setPerceptions(newPerceptions)
  }

  const calculateTotals = () => {
    let subtotal = 0
    let totalTaxes = 0

    items.forEach(item => {
      const itemBase = item.quantity * item.unit_price
      const discount = itemBase * (item.discount_percentage / 100)
      const itemSubtotal = itemBase - discount
      // Exento (-1) y No Gravado (-2) tienen IVA = 0
      const taxRate = (item.tax_rate && item.tax_rate > 0) ? item.tax_rate : 0
      const itemTax = itemSubtotal * (taxRate / 100)
      
      subtotal += itemSubtotal
      totalTaxes += itemTax
    })

    let totalPerceptions = 0
    perceptions.forEach(perception => {
      const base = perception.base_type === "net" ? subtotal : 
                   perception.base_type === "vat" ? totalTaxes : 
                   subtotal + totalTaxes
      totalPerceptions += base * (perception.rate / 100)
    })

    return {
      subtotal: subtotal.toFixed(2),
      totalTaxes: totalTaxes.toFixed(2),
      totalPerceptions: totalPerceptions.toFixed(2),
      total: (subtotal + totalTaxes + totalPerceptions).toFixed(2)
    }
  }

  // Removed window reload functions to fix TypeScript compilation

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const missingFields: string[] = []
    if (!invoiceType) missingFields.push("Tipo de comprobante")
    if (!salesPoint) missingFields.push("Punto de venta")
    if (!voucherNumber) missingFields.push("Número de comprobante")
    if (!issueDate) missingFields.push("Fecha de emisión")
    if (!dueDate) missingFields.push("Fecha de vencimiento")
    
    if (missingFields.length > 0) {
      toast.error(`Faltan completar: ${missingFields.join(", ")}`)
      return
    }

    if (!associateInvoice && (concept === "services" || concept === "products_services") && (!serviceDateFrom || !serviceDateTo)) {
      toast.error("Complete las fechas de servicio (desde y hasta)")
      return
    }

    // Solo validar cliente/proveedor si NO hay factura asociada
    if (!associateInvoice || !relatedInvoiceId) {
      if (mode === "issued" && !selectedClient && !selectedCompany) {
        toast.error("Debe seleccionar un cliente o empresa receptora")
        return
      }

      if (mode === "received" && !selectedSupplier && !selectedCompany) {
        toast.error("Debe seleccionar el proveedor o empresa emisora")
        return
      }
    }

    if (items.some(item => !item.description || item.quantity <= 0 || item.unit_price <= 0)) {
      toast.error("Verifique que todos los ítems tengan descripción, cantidad mayor a 0 y precio mayor a 0")
      return
    }

    if (perceptions.some(p => !p.rate || p.rate <= 0)) {
      toast.error("Las percepciones deben tener una alícuota mayor a 0")
      return
    }

    // Validar que el total no sea $0
    const calculatedTotals = calculateTotals()
    if (parseFloat(calculatedTotals.total) <= 0) {
      toast.error("El total del comprobante debe ser mayor a $0")
      return
    }

    // Validar saldo disponible solo para ND/NC
    const isNCND = (invoiceType === '003' || invoiceType === '008' || invoiceType === '013' || invoiceType === '053' || invoiceType === '002' || invoiceType === '007' || invoiceType === '012' || invoiceType === '052');
    if (isNCND && associateInvoice && selectedInvoice && parseFloat(calculatedTotals.total) > selectedInvoice.available_balance) {
      toast.error(`El monto no puede exceder el saldo disponible ($${selectedInvoice.available_balance.toLocaleString('es-AR')})`)
      return
    }

    // Validar límite de fecha (máximo 2 años hacia atrás)
    const twoYearsAgo = new Date()
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
    const issueDateObj = new Date(issueDate)
    if (issueDateObj < twoYearsAgo) {
      toast.error("No se pueden cargar comprobantes con más de 2 años de antigüedad")
      return
    }

    try {
      setIsSubmitting(true)

      const payload: any = {
        invoice_type: invoiceType,
        sales_point: parseInt(salesPoint),
        voucher_number: parseInt(voucherNumber),
        issue_date: issueDate,
        due_date: dueDate || issueDate,
        concept,
        service_date_from: (concept === "services" || concept === "products_services") ? serviceDateFrom : undefined,
        service_date_to: (concept === "services" || concept === "products_services") ? serviceDateTo : undefined,
        currency,
        exchange_rate: parseFloat(exchangeRate) || 1,
        cae: cae || undefined,
        cae_due_date: caeExpiration || undefined,
        notes: notes || undefined,
        related_invoice_id: associateInvoice && relatedInvoiceId ? relatedInvoiceId : undefined,
        items: items.map(item => ({
          description: item.description,
          quantity: parseFloat(item.quantity.toString()),
          unit_price: parseFloat(item.unit_price.toString()),
          discount_percentage: parseFloat(item.discount_percentage.toString()),
          tax_rate: parseFloat(item.tax_rate.toString())
        })),
        perceptions: perceptions.length > 0 ? perceptions.map(p => ({
          type: p.type,
          name: p.name,
          rate: parseFloat(p.rate.toString()),
          base_type: p.base_type
        })) : undefined
      }

      let createdInvoice: any
      if (mode === "issued") {
        // Solo enviar cliente/empresa si NO hay factura asociada (el backend lo hereda)
        if (!associateInvoice || !relatedInvoiceId) {
          if (selectedClient) {
            payload.client_id = selectedClient
          } else if (selectedCompany) {
            payload.receiver_company_id = selectedCompany
          }
        }
        const response = await invoiceService.createManualIssued(companyId, payload)
        createdInvoice = response.invoice
        toast.success("Factura emitida registrada exitosamente")
      } else {
        // Solo enviar proveedor/empresa si NO hay factura asociada (el backend lo hereda)
        if (!associateInvoice || !relatedInvoiceId) {
          if (selectedSupplier) {
            payload.supplier_id = selectedSupplier
          } else if (selectedCompany) {
            payload.issuer_company_id = selectedCompany
          }
        }
        const response = await invoiceService.createManualReceived(companyId, payload)
        createdInvoice = response.invoice
        toast.success("Factura recibida registrada exitosamente")
      }

      // Subir adjunto si existe
      const fileInput = document.getElementById('attachment') as HTMLInputElement
      if (fileInput?.files?.[0] && createdInvoice?.id) {
        try {
          await invoiceService.uploadAttachment(companyId, createdInvoice.id, fileInput.files[0])
          toast.success("PDF original adjuntado correctamente")
        } catch (error) {
          console.error('Error uploading attachment:', error)
          toast.error("Factura creada pero no se pudo adjuntar el PDF")
        }
      }

      onSuccess?.()
    } catch (error: any) {
      setIsSubmitting(false)
      const errorMsg = error.response?.data?.error || error.response?.data?.message || "Error al registrar el comprobante"
      toast.error(errorMsg)
    }
  }

  const totals = calculateTotals()

  const getCurrencySymbol = (curr: string): string => {
    const formats = { ARS: 'ARS $', USD: 'USD $', EUR: 'EUR €' }
    return formats[curr as keyof typeof formats] || 'ARS $'
  }

  if (isLoadingData) {
    console.log('[ManualInvoiceForm] Renderizando null porque isLoadingData =', isLoadingData)
    return null
  }
  
  console.log('[ManualInvoiceForm] Renderizando formulario completo')

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Tabs value={mode} onValueChange={(v) => setMode(v as "issued" | "received")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="received" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Factura Recibida
          </TabsTrigger>
          <TabsTrigger value="issued" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Factura Emitida (Histórica)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-6 mt-6">
          {!associateInvoice && (
            <Card>
              <CardHeader>
                <CardTitle>Datos del Proveedor</CardTitle>
                <CardDescription>Seleccioná el proveedor que emitió la factura</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <EntitySelector
                mode="supplier"
                companyId={companyId}
                savedEntities={suppliers}
                connectedCompanies={connectedCompanies.map(c => ({
                  id: c.id,
                  name: c.name,
                  cuit: c.national_id,
                  taxCondition: c.tax_condition
                }))}
                isLoading={loadingSuppliers}
                onSelect={(data) => {
                  if (data.entity_id) {
                    setSelectedSupplier(data.entity_id)
                    setSelectedCompany('')
                  } else if (data.issuer_company_id) {
                    setSelectedCompany(data.issuer_company_id)
                    setSelectedSupplier('')
                  }
                }}
                onEntityCreated={loadSuppliers}
                />
                {selectedCompany && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Proveedor automático</AlertTitle>
                    <AlertDescription>
                      Se creará automáticamente un proveedor externo con los datos de esta empresa conectada. 
                      Podrás editarlo después en la sección de Proveedores.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="issued" className="space-y-6 mt-6">
          {!associateInvoice && (
            <Card>
              <CardHeader>
                <CardTitle>Datos del Receptor</CardTitle>
                <CardDescription>Seleccioná el cliente o empresa a la que se emitió la factura</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <EntitySelector
                mode="client"
                companyId={companyId}
                connectedCompanies={connectedCompanies.map(c => ({
                  id: c.id,
                  name: c.name,
                  uniqueId: c.national_id,
                  cuit: c.national_id,
                  taxCondition: c.tax_condition
                }))}
                savedEntities={clients}
                isLoading={loadingClients}
                onSelect={(data) => {
                  if (data.receiver_company_id) {
                    setSelectedCompany(data.receiver_company_id)
                    setSelectedClient('')
                  } else if (data.entity_id) {
                    setSelectedClient(data.entity_id)
                    setSelectedCompany('')
                  } else {
                    setSelectedClient('')
                    setSelectedCompany('')
                  }
                }}
                onEntityCreated={loadClients}
                />
                {selectedCompany && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Se creará automáticamente un cliente externo con los datos de esta empresa conectada. 
                      Podrás editarlo después en la sección de Clientes.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Datos del Comprobante */}
      <Card>
        <CardHeader>
          <CardTitle>Datos del Comprobante</CardTitle>
          <CardDescription>Información del comprobante histórico</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={invoiceType} onValueChange={(value) => {
                setInvoiceType(value)
                setAssociateInvoice(false)
                setRelatedInvoiceId('')
                setSelectedInvoice(null)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="001">Factura A</SelectItem>
                  <SelectItem value="006">Factura B</SelectItem>
                  <SelectItem value="011">Factura C</SelectItem>
                  <SelectItem value="051">Factura M</SelectItem>
                  <SelectItem value="003">Nota de Crédito A</SelectItem>
                  <SelectItem value="008">Nota de Crédito B</SelectItem>
                  <SelectItem value="013">Nota de Crédito C</SelectItem>
                  <SelectItem value="053">Nota de Crédito M</SelectItem>
                  <SelectItem value="002">Nota de Débito A</SelectItem>
                  <SelectItem value="007">Nota de Débito B</SelectItem>
                  <SelectItem value="012">Nota de Débito C</SelectItem>
                  <SelectItem value="052">Nota de Débito M</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Punto de Venta *</Label>
              <Input 
                type="number" 
                min="1" 
                max="9999"
                value={salesPoint} 
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4)
                  setSalesPoint(val)
                }} 
                placeholder="Ej: 1" 
                disabled={associateInvoice && !!selectedInvoice && !!selectedInvoice.sales_point}
              />
            </div>
            <div className="space-y-2">
              <Label>Número *</Label>
              <Input 
                type="number" 
                min="1" 
                max="99999999"
                value={voucherNumber} 
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 8)
                  setVoucherNumber(val)
                }} 
                placeholder="Ej: 1" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha de Emisión *</Label>
              <DatePicker
                date={issueDate ? parseDateLocal(issueDate) || undefined : undefined}
                onSelect={(date) => setIssueDate(date ? formatDateToLocal(date) : '')}
                placeholder="Seleccionar fecha"
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha de Vencimiento *</Label>
              <DatePicker
                date={dueDate ? parseDateLocal(dueDate) || undefined : undefined}
                onSelect={(date) => setDueDate(date ? formatDateToLocal(date) : '')}
                placeholder="Seleccionar fecha"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Concepto *</Label>
              <Select value={concept} onValueChange={setConcept} disabled={associateInvoice && !!selectedInvoice}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="products">Productos</SelectItem>
                  <SelectItem value="services">Servicios</SelectItem>
                  <SelectItem value="products_services">Productos y Servicios</SelectItem>
                </SelectContent>
              </Select>
              {associateInvoice && selectedInvoice && (
                <p className="text-xs text-blue-600">
                  Heredado de la factura asociada
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Moneda *</Label>
              <Select value={currency} onValueChange={(v) => { 
                setCurrency(v)
                if (v === "ARS") {
                  setExchangeRate("1")
                } else {
                  setExchangeRate("")
                }
              }} disabled={associateInvoice && !!selectedInvoice}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ARS">ARS - Peso Argentino</SelectItem>
                  <SelectItem value="USD">USD - Dólar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                </SelectContent>
              </Select>
              {associateInvoice && selectedInvoice && (
                <p className="text-xs text-blue-600">
                  Heredado de la factura asociada
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Tipo de Cambio {currency !== "ARS" && "*"}</Label>
              <Input 
                type="number" 
                step="0.01"
                min="0"
                max="9999.9999"
                value={exchangeRate}
                onChange={(e) => {
                  const val = e.target.value
                  if (val.length <= 10) {
                    setExchangeRate(val)
                  }
                }}
                placeholder="1.00" 
                disabled={currency === "ARS" || (associateInvoice && !!selectedInvoice)}
              />
              {associateInvoice && selectedInvoice && (
                <p className="text-xs text-blue-600">
                  Heredado de la factura asociada
                </p>
              )}
            </div>
          </div>

          {(concept === "services" || concept === "products_services") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha Servicio Desde *</Label>
                <DatePicker
                  date={serviceDateFrom ? parseDateLocal(serviceDateFrom) || undefined : undefined}
                  onSelect={(date) => setServiceDateFrom(date ? formatDateToLocal(date) : '')}
                  placeholder="Seleccionar fecha"
                  disabled={associateInvoice && !!selectedInvoice}
                />
                {associateInvoice && selectedInvoice && (
                  <p className="text-xs text-blue-600">
                    Heredado de la factura asociada
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Fecha Servicio Hasta *</Label>
                <DatePicker
                  date={serviceDateTo ? parseDateLocal(serviceDateTo) || undefined : undefined}
                  onSelect={(date) => setServiceDateTo(date ? formatDateToLocal(date) : '')}
                  placeholder="Seleccionar fecha"
                  disabled={associateInvoice && !!selectedInvoice}
                />
                {associateInvoice && selectedInvoice && (
                  <p className="text-xs text-blue-600">
                    Heredado de la factura asociada
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CAE (opcional)</Label>
              <Input 
                value={cae} 
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 14)
                  setCae(val)
                }} 
                placeholder="12345678901234" 
                maxLength={14} 
              />

            </div>
            <div className="space-y-2">
              <Label>Vencimiento CAE</Label>
              <DatePicker
                date={caeExpiration ? parseDateLocal(caeExpiration) || undefined : undefined}
                onSelect={(date) => setCaeExpiration(date ? formatDateToLocal(date) : '')}
                placeholder="Seleccionar fecha"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asociar a Factura (para NC/ND emitidas y recibidas) */}
      {(invoiceType === "003" || invoiceType === "008" || invoiceType === "013" || invoiceType === "053" || invoiceType === "002" || invoiceType === "007" || invoiceType === "012" || invoiceType === "052") && (
        <Card>
          <CardHeader>
            <CardTitle>Asociación a Factura</CardTitle>
            <CardDescription>
              {mode === "issued" 
                ? "Vinculá esta nota a una factura que emitiste previamente"
                : "Vinculá esta nota a una factura que recibiste del proveedor"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="associateInvoice"
                  checked={associateInvoice}
                  onChange={(e) => {
                    setAssociateInvoice(e.target.checked)
                    if (!e.target.checked) {
                      setRelatedInvoiceId('')
                      setSelectedInvoice(null)
                    }
                  }}
                  className="h-4 w-4"
                />
                <Label htmlFor="associateInvoice" className="cursor-pointer font-medium">
                  {mode === "issued" 
                    ? "Asociar a una factura emitida por mi empresa"
                    : "Asociar a una factura recibida del proveedor"}
                </Label>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-blue-700">
                  ✓ Asociá esta nota para mantener trazabilidad y calcular saldos correctamente
                </p>
                <p className="text-xs text-blue-700">
                  ✓ El punto de venta y concepto se heredarán automáticamente
                </p>
                {mode === "issued" && (
                  <p className="text-xs text-blue-700">
                    ✓ Útil para anular facturas mediante NC por el 100% del monto
                  </p>
                )}
              </div>
            </div>

            {associateInvoice && (
              <>
                <InvoiceSelector
                  companyId={companyId}
                  voucherType={invoiceType}
                  mode={mode}
                  onSelect={(invoice) => {
                    setSelectedInvoice(invoice)
                    if (invoice) {
                      setRelatedInvoiceId(invoice.id)
                      if (invoice.sales_point) {
                        setSalesPoint(invoice.sales_point.toString())
                      }
                      setConcept((invoice.concept || 'products') as any)
                      setServiceDateFrom(invoice.service_date_from || '')
                      setServiceDateTo(invoice.service_date_to || '')
                      setCurrency(invoice.currency || 'ARS')
                      setExchangeRate(invoice.exchange_rate?.toString() || '1')
                    } else {
                      setRelatedInvoiceId('')
                    }
                  }}
                />
                {selectedInvoice && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      {mode === "issued" 
                        ? "El cliente se heredará automáticamente de la factura asociada."
                        : "El proveedor se heredará automáticamente de la factura asociada."}
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ítems de la Factura</CardTitle>
              <CardDescription>Detalle de productos o servicios</CardDescription>
            </div>
            <Button type="button" onClick={addItem} size="sm" variant="outline">
              <Plus className="h-4 w-4" />
              Agregar Ítem
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => {
            const itemBase = item.quantity * item.unit_price
            const discount = itemBase * (item.discount_percentage / 100)
            const itemSubtotal = itemBase - discount
            // Exento (-1) y No Gravado (-2) tienen IVA = 0
            const taxRate = (item.tax_rate && item.tax_rate > 0) ? item.tax_rate : 0
            const itemTax = itemSubtotal * (taxRate / 100)
            const itemTotal = itemSubtotal + itemTax
            
            return (
            <div key={index} className="space-y-3 p-4 border border-gray-200 rounded-lg relative">
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
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value.slice(0, 200))}
                    maxLength={200}
                  />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label>Cantidad *</Label>
                    <Input
                      type="number"
                      min="0.01"
                      max="999999.99"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0
                        updateItem(index, "quantity", Math.min(Math.max(val, 0.01), 999999.99))
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Precio Unit. *</Label>
                    <Input
                      type="number"
                      min="0"
                      max="999999999.99"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0
                        updateItem(index, "unit_price", Math.min(Math.max(val, 0), 999999999.99))
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Bonif. (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={item.discount_percentage}
                      onChange={(e) => updateItem(index, "discount_percentage", Math.min(Math.max(parseFloat(e.target.value) || 0, 0), 100))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>IVA *</Label>
                    <Select 
                      value={item.tax_rate.toString()} 
                      onValueChange={(value) => updateItem(index, "tax_rate", parseFloat(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                      {getCurrencySymbol(currency)}{itemTotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-4 text-sm border-t border-gray-200 pt-2">
                <span className="text-muted-foreground">Subtotal: <span className="font-medium text-foreground">{getCurrencySymbol(currency)}{itemSubtotal.toFixed(2)}</span></span>
                <span className="text-muted-foreground">IVA: <span className="font-medium text-foreground">{getCurrencySymbol(currency)}{itemTax.toFixed(2)}</span></span>
                <span className="text-muted-foreground">Total: <span className="font-medium text-foreground">{getCurrencySymbol(currency)}{itemTotal.toFixed(2)}</span></span>
              </div>
            </div>
          )
          })}
        </CardContent>
      </Card>

      {/* Percepciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Percepciones</CardTitle>
              <CardDescription>Percepciones aplicables según jurisdicción</CardDescription>
            </div>
            <Button type="button" onClick={addPerception} size="sm" variant="outline">
              <Plus className="h-4 w-4" />
              Agregar Percepción
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {perceptions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">No hay percepciones aplicadas</p>
              <p className="text-xs">Las percepciones se agregan según la jurisdicción</p>
            </div>
          ) : (
            perceptions.map((perception, index) => {
              const subtotal = items.reduce((sum, item) => {
                const itemBase = item.quantity * item.unit_price
                const discount = itemBase * (item.discount_percentage / 100)
                return sum + (itemBase - discount)
              }, 0)
              const totalTaxes = items.reduce((sum, item) => {
                const itemBase = item.quantity * item.unit_price
                const discount = itemBase * (item.discount_percentage / 100)
                const itemSubtotal = itemBase - discount
                // Exento (-1) y No Gravado (-2) tienen IVA = 0
                const taxRate = (item.tax_rate && item.tax_rate > 0) ? item.tax_rate : 0
                return sum + (itemSubtotal * (taxRate / 100))
              }, 0)
              let base = subtotal
              if (perception.base_type === 'total') {
                base = subtotal + totalTaxes
              } else if (perception.base_type === 'vat') {
                base = totalTaxes
              }
              const perceptionAmount = base * (perception.rate || 0) / 100
              
              return (
              <div key={index} className="space-y-3 p-4 border border-gray-200 rounded-lg relative">
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
                        onValueChange={(value) => updatePerception(index, "type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="vat_perception">Percepción IVA</SelectItem>
                          <SelectItem value="income_tax_perception">Percepción Ganancias</SelectItem>
                          <SelectItem value="internal_taxes_perception">Impuestos Internos</SelectItem>
                          <SelectItem value="gross_income_buenosaires">IIBB Buenos Aires</SelectItem>
                          <SelectItem value="gross_income_caba">IIBB CABA</SelectItem>
                          <SelectItem value="gross_income_catamarca">IIBB Catamarca</SelectItem>
                          <SelectItem value="gross_income_chaco">IIBB Chaco</SelectItem>
                          <SelectItem value="gross_income_chubut">IIBB Chubut</SelectItem>
                          <SelectItem value="gross_income_cordoba">IIBB Córdoba</SelectItem>
                          <SelectItem value="gross_income_corrientes">IIBB Corrientes</SelectItem>
                          <SelectItem value="gross_income_entrerios">IIBB Entre Ríos</SelectItem>
                          <SelectItem value="gross_income_formosa">IIBB Formosa</SelectItem>
                          <SelectItem value="gross_income_jujuy">IIBB Jujuy</SelectItem>
                          <SelectItem value="gross_income_lapampa">IIBB La Pampa</SelectItem>
                          <SelectItem value="gross_income_larioja">IIBB La Rioja</SelectItem>
                          <SelectItem value="gross_income_mendoza">IIBB Mendoza</SelectItem>
                          <SelectItem value="gross_income_misiones">IIBB Misiones</SelectItem>
                          <SelectItem value="gross_income_neuquen">IIBB Neuquén</SelectItem>
                          <SelectItem value="gross_income_rionegro">IIBB Río Negro</SelectItem>
                          <SelectItem value="gross_income_salta">IIBB Salta</SelectItem>
                          <SelectItem value="gross_income_sanjuan">IIBB San Juan</SelectItem>
                          <SelectItem value="gross_income_sanluis">IIBB San Luis</SelectItem>
                          <SelectItem value="gross_income_santacruz">IIBB Santa Cruz</SelectItem>
                          <SelectItem value="gross_income_santafe">IIBB Santa Fe</SelectItem>
                          <SelectItem value="gross_income_santiagodelestero">IIBB Santiago del Estero</SelectItem>
                          <SelectItem value="gross_income_tierradelfuego">IIBB Tierra del Fuego</SelectItem>
                          <SelectItem value="gross_income_tucuman">IIBB Tucumán</SelectItem>
                          <SelectItem value="other_perception">Otra Percepción</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Descripción *</Label>
                      <Input
                        placeholder="Ej: Percepción IIBB Buenos Aires"
                        value={perception.name}
                        onChange={(e) => updatePerception(index, "name", e.target.value.slice(0, 100))}
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
                        value={perception.rate}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0
                          updatePerception(index, "rate", Math.min(val, 100))
                        }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Base de Cálculo *</Label>
                      <Select 
                        value={perception.base_type || 'net'} 
                        onValueChange={(value) => updatePerception(index, "base_type", value)}
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
                        {getCurrencySymbol(currency)}{perceptionAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-4 text-sm border-t border-gray-200 pt-2">
                  <span className="text-muted-foreground">Base: <span className="font-medium text-foreground">{getCurrencySymbol(currency)}{base.toFixed(2)}</span></span>
                  <span className="text-muted-foreground">Alícuota: <span className="font-medium text-foreground">{perception.rate || 0}%</span></span>
                  <span className="text-muted-foreground">Total: <span className="font-medium text-orange-600">{getCurrencySymbol(currency)}{perceptionAmount.toFixed(2)}</span></span>
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
                {getCurrencySymbol(currency)}{totals.subtotal}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Impuestos:</span>
              <span className="font-medium">
                {getCurrencySymbol(currency)}{totals.totalTaxes}
              </span>
            </div>
            {parseFloat(totals.totalPerceptions) > 0 && (
              <div className="flex justify-between">
                <span>Total Percepciones:</span>
                <span className="font-medium text-orange-600">
                  {getCurrencySymbol(currency)}{totals.totalPerceptions}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
              <span>Total:</span>
              <span>
                {getCurrencySymbol(currency)}{totals.total}
              </span>
            </div>
            {selectedInvoice && (invoiceType === '003' || invoiceType === '008' || invoiceType === '013' || invoiceType === '053' || invoiceType === '002' || invoiceType === '007' || invoiceType === '012' || invoiceType === '052') && (
              <div className="flex justify-between text-sm text-muted-foreground border-t border-gray-200 pt-2">
                <span>Saldo Disponible:</span>
                <span className={parseFloat(totals.total) > selectedInvoice.available_balance ? 'text-red-600 font-bold' : 'text-green-600'}>
                  {getCurrencySymbol(currency)}{selectedInvoice.available_balance.toLocaleString('es-AR')}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notas y Adjunto */}
      <Card>
        <CardHeader>
          <CardTitle>Información Adicional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="attachment">Adjuntar PDF Original (opcional)</Label>
            <Input
              id="attachment"
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  if (file.size > 10 * 1024 * 1024) {
                    toast.error("El archivo no puede superar los 10MB")
                    e.target.value = ''
                  }
                }
              }}
            />
            <p className="text-xs text-muted-foreground">Subí el PDF físico que recibiste del proveedor/cliente (máx. 10MB)</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas Internas</Label>
            <Textarea
              id="notes"
              placeholder="Notas adicionales sobre la factura..."
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 500))}
              maxLength={500}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Registrando...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Registrar Factura
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
      </div>


    </form>
  )
}
