"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Plus, Trash2, Calculator, FileText, Search, Loader2, Upload, X, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePicker } from "@/components/ui/date-picker"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { invoiceService } from "@/services/invoice.service"
import { companyService } from "@/services/company.service"
import { supplierService, Supplier } from "@/services/supplier.service"
import type { InvoiceType, Currency, InvoiceItem, InvoicePerception } from "@/types/invoice"
import { formatInvoiceNumber, formatCUIT } from "@/lib/input-formatters"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SupplierForm } from "@/components/suppliers/SupplierForm"

const formatCurrency = (amount: number, currency: string) => {
  const formatted = amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const formats: Record<string, string> = {
    'ARS': `ARS $${formatted}`,
    'USD': `USD $${formatted}`,
    'EUR': `EUR €${formatted}`
  }
  return formats[currency] || `ARS $${formatted}`
}

export default function LoadInvoicePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [formData, setFormData] = useState({
    type: 'A' as InvoiceType,
    invoiceNumber: '',
    supplierId: '',
    emissionDate: '',
    dueDate: '',
    currency: 'ARS' as Currency,
    exchangeRate: '',
    notes: ''
  })

  const [items, setItems] = useState<Omit<InvoiceItem, 'id' | 'subtotal' | 'taxAmount'>[]>([])
  const [perceptions, setPerceptions] = useState<Omit<InvoicePerception, 'id' | 'baseAmount' | 'amount'>[]>([])
  const [companyDefaults, setCompanyDefaults] = useState<any>(null)

  const [totals, setTotals] = useState({
    subtotal: 0,
    totalTaxes: 0,
    totalPerceptions: 0,
    total: 0
  })

  const [validationData, setValidationData] = useState({
    issuerCuit: '',
    invoiceType: 'A' as InvoiceType,
    invoiceNumber: ''
  })
  const [isValidating, setIsValidating] = useState(false)
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [hasAfipCertificate, setHasAfipCertificate] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [showNewSupplierDialog, setShowNewSupplierDialog] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    } else if (isAuthenticated && companyId) {
      loadCompanyDefaults()
    }
  }, [isAuthenticated, authLoading, router, companyId])

  const loadCompanyDefaults = async () => {
    try {
      const [company, suppliersList] = await Promise.all([
        companyService.getCompany(companyId),
        supplierService.getSuppliers(companyId)
      ])
      setCompanyDefaults({
        defaultVat: company.defaultVat || 21,
        vatPerception: company.vatPerception || 0,
        grossIncomePerception: company.grossIncomePerception || 2.5,
        socialSecurityPerception: company.socialSecurityPerception || 1
      })
      setSuppliers(suppliersList)
      setItems([{ description: '', quantity: 1, unitPrice: 0, taxRate: company.defaultVat || 21 }])
    } catch (error) {
      console.error('Error loading company defaults:', error)
      setItems([{ description: '', quantity: 1, unitPrice: 0, taxRate: 21 }])
    }
  }

  useEffect(() => {
    const checkAfipCertificate = async () => {
      if (!companyId) return
      try {
        const response = await fetch(`/api/v1/companies/${companyId}/afip/certificate`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
        if (response.ok) {
          const data = await response.json()
          setHasAfipCertificate(data.certificate?.is_active || false)
        }
      } catch (error) {
        setHasAfipCertificate(false)
      }
    }
    if (isAuthenticated && companyId) {
      checkAfipCertificate()
    }
  }, [isAuthenticated, companyId])

  const calculateTotals = useCallback(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const totalTaxes = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice
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
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, taxRate: companyDefaults?.defaultVat || 21 }])
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
    setPerceptions([...perceptions, { 
      type: 'gross_income_perception', 
      name: 'Percepción IIBB', 
      rate: companyDefaults?.grossIncomePerception || 2.5,
      baseType: 'net'
    }])
  }

  const getDefaultPerceptionRate = (type: string): number => {
    if (!companyDefaults) return 0
    switch (type) {
      case 'vat_perception':
        return companyDefaults.vatPerception || 0
      case 'gross_income_perception':
        return companyDefaults.grossIncomePerception || 2.5
      case 'suss_perception':
        return companyDefaults.socialSecurityPerception || 1
      default:
        return 0
    }
  }

  const removePerception = (index: number) => {
    setPerceptions(perceptions.filter((_, i) => i !== index))
  }

  const updatePerception = (index: number, field: keyof typeof perceptions[0], value: string | number) => {
    const newPerceptions = [...perceptions]
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

  const handleValidateAfip = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!hasAfipCertificate) {
      toast.error('Certificado AFIP no configurado', {
        description: 'Configure el certificado AFIP en Configuración para validar facturas'
      })
      return
    }
    
    if (!validationData.issuerCuit || !validationData.invoiceNumber) {
      toast.error('Complete CUIT y número de factura')
      return
    }

    setIsValidating(true)
    try {
      const result = await invoiceService.validateWithAfip(companyId, {
        issuer_cuit: validationData.issuerCuit,
        invoice_type: validationData.invoiceType,
        invoice_number: validationData.invoiceNumber
      })

      if (result.success && result.invoice) {
        const inv = result.invoice
        setFormData({
          ...formData,
          type: validationData.invoiceType,
          invoiceNumber: validationData.invoiceNumber,
          emissionDate: inv.issue_date,
          currency: inv.currency === 'PES' ? 'ARS' : inv.currency,
          exchangeRate: inv.exchange_rate?.toString() || ''
        })
        
        setTotals({
          subtotal: inv.subtotal,
          totalTaxes: inv.total_taxes,
          totalPerceptions: inv.total_perceptions,
          total: inv.total
        })

        toast.success('✓ Factura validada con AFIP', {
          description: `CAE: ${inv.cae} - Total: $${inv.total.toLocaleString('es-AR')}`
        })
      }
    } catch (error: any) {
      toast.error('Factura no encontrada en AFIP', {
        description: 'Verifique los datos o use carga manual'
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.supplierId || !formData.invoiceNumber || !formData.dueDate || !formData.emissionDate) {
      toast.error('Complete todos los campos requeridos')
      return
    }

    const supplier = suppliers.find(s => s.id.toString() === formData.supplierId)
    if (!supplier) {
      toast.error('Seleccione un proveedor válido')
      return
    }

    if (formData.currency !== 'ARS' && !formData.exchangeRate) {
      toast.error('Ingrese la cotización de la moneda')
      return
    }

    if (items.some(item => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
      toast.error('Complete todos los ítems correctamente')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        supplier_id: formData.supplierId,
        invoice_type: formData.type,
        invoice_number: formData.invoiceNumber,
        issue_date: formData.emissionDate,
        due_date: formData.dueDate,
        currency: formData.currency,
        exchange_rate: formData.currency === 'ARS' ? 1 : parseFloat(formData.exchangeRate),
        notes: formData.notes,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          tax_rate: item.taxRate
        }))
      }

      await invoiceService.createReceivedInvoice(companyId, payload)
      
      toast.success('Factura cargada exitosamente', {
        description: `Total: ${totals.total.toLocaleString('es-AR', { style: 'currency', currency: formData.currency })}`
      })
      
      router.push(`/company/${companyId}/invoices`)
    } catch (error: any) {
      toast.error('Error al cargar factura', {
        description: error.response?.data?.message || 'Intente nuevamente'
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
            <h1 className="text-3xl font-bold">Cargar Factura Recibida</h1>
            <p className="text-muted-foreground">Validar con AFIP o cargar manualmente</p>
          </div>
        </div>

        <Tabs defaultValue="validate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="validate">
              <Search className="h-4 w-4 mr-2" />
              Validar con AFIP
            </TabsTrigger>
            <TabsTrigger value="manual">
              <FileText className="h-4 w-4 mr-2" />
              Carga Manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="validate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Validar Factura con AFIP</CardTitle>
                <CardDescription>
                  Ingrese los datos de la factura para validarla automáticamente con AFIP y obtener todos los datos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleValidateAfip} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="valCuit">CUIT Emisor *</Label>
                      <Input
                        id="valCuit"
                        placeholder="20-12345678-9"
                        value={validationData.issuerCuit}
                        onChange={(e) => setValidationData({...validationData, issuerCuit: formatCUIT(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valType">Tipo *</Label>
                      <Select 
                        value={validationData.invoiceType} 
                        onValueChange={(value: InvoiceType) => setValidationData({...validationData, invoiceType: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">Factura A</SelectItem>
                          <SelectItem value="B">Factura B</SelectItem>
                          <SelectItem value="C">Factura C</SelectItem>
                          <SelectItem value="E">Factura E</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valNumber">Número *</Label>
                      <Input
                        id="valNumber"
                        placeholder="0001-00001234"
                        value={validationData.invoiceNumber}
                        onChange={(e) => setValidationData({...validationData, invoiceNumber: formatInvoiceNumber(e.target.value)})}
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={isValidating} className="w-full">
                    {isValidating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Validando con AFIP...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Validar Factura
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {totals.total > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Datos Obtenidos de AFIP
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-medium">
                        {formatCurrency(totals.subtotal, formData.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Impuestos:</span>
                      <span className="font-medium">
                        {formatCurrency(totals.totalTaxes, formData.currency)}
                      </span>
                    </div>
                    {totals.totalPerceptions > 0 && (
                      <div className="flex justify-between">
                        <span>Total Percepciones:</span>
                        <span className="font-medium text-orange-600">
                          {formatCurrency(totals.totalPerceptions, formData.currency)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>
                        {formatCurrency(totals.total, formData.currency)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos de la Empresa Emisora</CardTitle>
              <CardDescription>Información de la empresa que emitió la factura</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Factura *</Label>
                  <Select value={formData.type} onValueChange={(value: InvoiceType) => 
                    setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Factura A</SelectItem>
                      <SelectItem value="B">Factura B</SelectItem>
                      <SelectItem value="C">Factura C</SelectItem>
                      <SelectItem value="E">Factura E</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Número de Factura *</Label>
                  <Input
                    id="invoiceNumber"
                    placeholder="0001-00001234"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({...formData, invoiceNumber: formatInvoiceNumber(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Proveedor *</Label>
                {suppliers.length === 0 ? (
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center justify-center border border-dashed rounded-md p-3 bg-muted/50">
                      <p className="text-sm text-muted-foreground">No hay proveedores registrados</p>
                    </div>
                    <Button type="button" onClick={() => setShowNewSupplierDialog(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Crear Proveedor
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Select 
                      value={formData.supplierId} 
                      onValueChange={(value) => setFormData({...formData, supplierId: value})}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Seleccionar proveedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map(s => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.businessName || `${s.firstName} ${s.lastName}`.trim()} - {s.documentNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" onClick={() => setShowNewSupplierDialog(true)}>
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha de Emisión *</Label>
                  <DatePicker
                    date={formData.emissionDate ? new Date(formData.emissionDate) : undefined}
                    onSelect={(date) => setFormData({...formData, emissionDate: date ? date.toISOString().split('T')[0] : ''})}
                    placeholder="Seleccionar fecha"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha de Vencimiento *</Label>
                  <DatePicker
                    date={formData.dueDate ? new Date(formData.dueDate) : undefined}
                    onSelect={(date) => setFormData({...formData, dueDate: date ? date.toISOString().split('T')[0] : ''})}
                    placeholder="Seleccionar fecha"
                    minDate={formData.emissionDate ? new Date(formData.emissionDate) : undefined}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Moneda y Cotización *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select value={formData.currency} onValueChange={(value: Currency) => 
                    setFormData({...formData, currency: value, exchangeRate: value === 'ARS' ? '' : formData.exchangeRate})}>
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
                    value={formData.exchangeRate}
                    onChange={(e) => setFormData({...formData, exchangeRate: e.target.value})}
                    disabled={formData.currency === 'ARS'}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Ítems de la Factura
                <Button type="button" onClick={addItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Ítem
                </Button>
              </CardTitle>
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
                      value={(item.taxRate ?? companyDefaults?.defaultVat ?? 21).toString()} 
                      onValueChange={(value) => updateItem(index, 'taxRate', parseFloat(value))}
                    >
                      <SelectTrigger>
                        <SelectValue>
                          {(item.taxRate ?? companyDefaults?.defaultVat ?? 21) === -1 ? 'Exento' : 
                           (item.taxRate ?? companyDefaults?.defaultVat ?? 21) === -2 ? 'No Gravado' : 
                           `${item.taxRate ?? companyDefaults?.defaultVat ?? 21}%`}
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
              <CardDescription>Percepciones aplicadas en la factura</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {perceptions.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">No hay percepciones aplicadas</p>
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
                        placeholder="Nombre de la percepción"
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
                          const maxRate = perception.type === 'vat_perception' ? 10 : perception.type === 'gross_income_perception' ? 5 : 2;
                          const value = Math.min(parseFloat(e.target.value) || 0, maxRate);
                          updatePerception(index, 'rate', value);
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información Adicional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  placeholder="Notas adicionales sobre la factura..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value.slice(0, 500)})}
                  maxLength={500}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachment">Adjuntar PDF Original</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="attachment"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  {attachmentFile && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setAttachmentFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {attachmentFile && (
                  <p className="text-sm text-muted-foreground">
                    Archivo seleccionado: {attachmentFile.name}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Adjunte el PDF original de la factura recibida del proveedor (máx. 10MB)
                </p>
              </div>
            </CardContent>
          </Card>

              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Cargar Factura
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
          </TabsContent>
        </Tabs>
      </div>

      {/* New Supplier Dialog */}
      <Dialog open={showNewSupplierDialog} onOpenChange={setShowNewSupplierDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Proveedor</DialogTitle>
            <DialogDescription>
              Usa el mismo formulario que en Mis Proveedores
            </DialogDescription>
          </DialogHeader>
          <SupplierForm 
            companyId={companyId} 
            onClose={() => setShowNewSupplierDialog(false)} 
            onSuccess={async () => {
              const updated = await supplierService.getSuppliers(companyId)
              setSuppliers(updated)
              if (updated.length > 0) {
                const newest = updated[updated.length - 1]
                setFormData({...formData, supplierId: newest.id.toString()})
              }
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}