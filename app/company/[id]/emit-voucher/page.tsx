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
import { VoucherTypeSelector } from "@/components/vouchers/VoucherTypeSelector"
import { InvoiceSelector } from "@/components/vouchers/InvoiceSelector"
import { companyService } from "@/services/company.service"
import { voucherService } from "@/services/voucher.service"
import type { Currency, InvoiceItem } from "@/types/invoice"

interface CompanyData {
  id: string
  name: string
  tax_condition: string
  default_sales_point?: number
  defaultVat?: number
}

interface VoucherType {
  code: string
  name: string
  category: string
  requiresAssociation: boolean
}

interface Invoice {
  id: string
  invoice_number: string
  invoice_type: string
  client_name: string
  total_amount: number
  available_balance: number
  issue_date: string
}

export default function EmitVoucherPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [currentCompany, setCurrentCompany] = useState<CompanyData | null>(null)
  const [availableTypes, setAvailableTypes] = useState<VoucherType[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [cert, setCert] = useState<{ isActive: boolean } | null>(null)

  const [formData, setFormData] = useState({
    voucherType: '',
    relatedInvoiceId: '',
    emissionDate: '',
    currency: 'ARS' as Currency,
    exchangeRate: '',
    notes: ''
  })

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [items, setItems] = useState<Omit<InvoiceItem, 'id' | 'subtotal' | 'taxAmount'>[]>([])
  const [totals, setTotals] = useState({ subtotal: 0, totalTaxes: 0, total: 0 })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    const loadData = async () => {
      if (!companyId) return
      
      try {
        setIsLoadingData(true)
        
        const company = await companyService.getCompany(companyId)
        setCurrentCompany({
          id: company.id,
          name: company.name,
          tax_condition: company.taxCondition || 'registered_taxpayer',
          default_sales_point: company.defaultSalesPoint || 1,
          defaultVat: company.defaultVat || 21
        })
        
        const types = await voucherService.getAvailableTypes(companyId)
        setAvailableTypes(types)
        
        try {
          const apiClient = (await import('@/lib/api-client')).default
          const certResponse = await apiClient.get(`/afip/companies/${companyId}/certificate`)
          setCert(certResponse.data.data)
        } catch (error: any) {
          setCert({ isActive: error.response?.status !== 404 ? false : false })
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
    if (currentCompany && items.length === 0) {
      setItems([{ description: '', quantity: 1, unitPrice: 0, taxRate: currentCompany.defaultVat || 21 }])
    }
  }, [currentCompany, items.length])

  const calculateTotals = useCallback(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const totalTaxes = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice
      const taxRate = (item.taxRate && item.taxRate > 0) ? item.taxRate : 0
      return sum + (itemSubtotal * taxRate / 100)
    }, 0)
    
    setTotals({ subtotal, totalTaxes, total: subtotal + totalTaxes })
  }, [items])

  useEffect(() => {
    calculateTotals()
  }, [items, calculateTotals])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.voucherType) {
      toast.error('Seleccione el tipo de comprobante')
      return
    }

    if (!formData.relatedInvoiceId) {
      toast.error('Seleccione la factura a asociar')
      return
    }

    if (!formData.emissionDate) {
      toast.error('Ingrese la fecha de emisión')
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

    const payload = {
      voucher_type: formData.voucherType,
      related_invoice_id: formData.relatedInvoiceId,
      sales_point: currentCompany?.default_sales_point || 1,
      issue_date: formData.emissionDate,
      currency: formData.currency,
      exchange_rate: formData.exchangeRate ? parseFloat(formData.exchangeRate) : undefined,
      notes: formData.notes,
      items: items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        tax_rate: item.taxRate || 0
      }))
    }

    try {
      const result = await voucherService.createVoucher(companyId, payload)
      
      if (result.afip_status === 'approved') {
        toast.success('Comprobante emitido exitosamente', {
          description: `CAE: ${result.afip_cae} - Total: ${totals.total.toLocaleString('es-AR', { style: 'currency', currency: formData.currency })}`
        })
      } else if (result.afip_status === 'error') {
        toast.warning('Comprobante creado pero con error en AFIP', {
          description: result.afip_error_message || 'Error desconocido'
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

  if (authLoading || !isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push(`/company/${companyId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Emitir Comprobante</h1>
            <p className="text-muted-foreground">Crear Nota de Crédito o Débito</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Comprobante</CardTitle>
              <CardDescription>Seleccione el tipo y la factura a asociar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <VoucherTypeSelector
                availableTypes={availableTypes}
                selectedType={formData.voucherType}
                onSelect={(type) => setFormData({ ...formData, voucherType: type, relatedInvoiceId: '' })}
                disabled={isLoadingData}
              />

              {formData.voucherType && (
                <InvoiceSelector
                  companyId={companyId}
                  voucherType={formData.voucherType}
                  onSelect={(invoice) => {
                    setSelectedInvoice(invoice)
                    setFormData({ ...formData, relatedInvoiceId: invoice?.id || '' })
                  }}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-2">
                  <Label>Fecha de Emisión *</Label>
                  <DatePicker
                    date={formData.emissionDate ? new Date(formData.emissionDate) : undefined}
                    onSelect={(date) => setFormData({ ...formData, emissionDate: date ? date.toISOString().split('T')[0] : '' })}
                    placeholder="Seleccionar fecha"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Moneda *</Label>
                  <Select value={formData.currency} onValueChange={(value: Currency) => 
                    setFormData({ ...formData, currency: value, exchangeRate: value === 'ARS' ? '' : formData.exchangeRate })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ARS">Pesos (ARS)</SelectItem>
                      <SelectItem value="USD">Dólares (USD)</SelectItem>
                      <SelectItem value="EUR">Euros (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Ítems del Comprobante
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
                      value={(item.taxRate ?? 21).toString()} 
                      onValueChange={(value) => updateItem(index, 'taxRate', parseFloat(value))}
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

          <Card>
            <CardHeader>
              <CardTitle>Información Adicional</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Notas Internas</Label>
                <Textarea
                  placeholder="Notas adicionales..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value.slice(0, 500) })}
                  maxLength={500}
                />
              </div>
            </CardContent>
          </Card>

          {!cert?.isActive ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">⚠️ Certificado AFIP Requerido</p>
                  <p className="text-xs text-red-600 mt-2">
                    Ve a Configuración → AFIP/ARCA para subir tu certificado digital.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">ℹ️ Autorización con AFIP</p>
                  <p className="text-xs text-blue-700 mt-2">
                    El comprobante se autoriza automáticamente con AFIP y obtiene CAE oficial
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" className="flex-1" disabled={isSubmitting || !cert?.isActive}>
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
            <Button type="button" variant="outline" onClick={() => router.push(`/company/${companyId}`)}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
