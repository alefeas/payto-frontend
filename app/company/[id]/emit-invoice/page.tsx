"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Plus, Trash2, Calculator, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import type { InvoiceType, Currency, InvoiceItem, InvoicePerception, InvoiceConcept } from "@/types/invoice"
import { ClientSelector } from "@/components/invoices/ClientSelector"

const mockCompanies = [
  { id: "1", name: "TechCorp SA", uniqueId: "TC8X9K2L", taxConditionAfip: "RI" as const },
  { id: "2", name: "Emprendimientos Juan Pérez", uniqueId: "SU4P7M9N", taxConditionAfip: "Monotributo" as const },
  { id: "3", name: "Cooperativa de Trabajo Unidos", uniqueId: "CL1Q3R8T", taxConditionAfip: "Exento" as const },
  { id: "4", name: "María López", uniqueId: "ML5K2P8W", taxConditionAfip: "CF" as const },
]

const mockSavedClients = [
  { id: "1", businessName: "Distribuidora El Sol SRL", documentNumber: "20-12345678-9", taxCondition: "RI" },
  { id: "2", businessName: "Servicios Técnicos Martínez", documentNumber: "27-98765432-1", taxCondition: "Monotributo" },
  { id: "3", firstName: "Laura", lastName: "González", documentNumber: "35.123.456", taxCondition: "CF" },
  { id: "4", businessName: "Comercial Norte SA", documentNumber: "30-55667788-9", taxCondition: "RI" },
]

export default function CreateInvoicePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  // Obtener empresa actual
  const currentCompany = mockCompanies.find(c => c.uniqueId === companyId)

  // Determinar tipos de factura permitidos según condición IVA
  const getAllowedInvoiceTypes = () => {
    if (!currentCompany) return []
    
    switch (currentCompany.taxConditionAfip) {
      case 'RI':
        return ['A', 'B', 'C', 'E'] // RI puede emitir todas
      case 'Monotributo':
        return ['C'] // Monotributo solo C
      case 'Exento':
        return ['C', 'E'] // Exento: C local, E exportación
      case 'CF':
        return [] // Consumidor Final no puede emitir
      default:
        return []
    }
  }

  const allowedTypes = getAllowedInvoiceTypes()

  const [formData, setFormData] = useState({
    type: 'A' as InvoiceType,
    concept: 'products' as InvoiceConcept,
    receiverCompanyId: '',
    clientData: null as any,
    saveClient: false,
    emissionDate: '',
    dueDate: '',
    currency: 'ARS' as Currency,
    exchangeRate: '',
    notes: ''
  })


  const [items, setItems] = useState<Omit<InvoiceItem, 'id' | 'subtotal' | 'taxAmount'>[]>([
    { description: '', quantity: 1, unitPrice: 0, taxRate: 21 }
  ])

  const [perceptions, setPerceptions] = useState<Omit<InvoicePerception, 'id' | 'baseAmount' | 'amount'>[]>([])

  const [totals, setTotals] = useState({
    subtotal: 0,
    totalTaxes: 0,
    totalPerceptions: 0,
    total: 0
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

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
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, taxRate: 21 }])
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
    setPerceptions([...perceptions, { type: 'gross_income_perception', name: 'Percepción IIBB', rate: 3 }])
  }

  const removePerception = (index: number) => {
    setPerceptions(perceptions.filter((_, i) => i !== index))
  }

  const updatePerception = (index: number, field: keyof typeof perceptions[0], value: string | number) => {
    const newPerceptions = [...perceptions]
    newPerceptions[index] = { ...newPerceptions[index], [field]: value }
    setPerceptions(newPerceptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.emissionDate || !formData.dueDate) {
      toast.error('Complete las fechas requeridas')
      return
    }

    if (!formData.receiverCompanyId && !formData.clientData) {
      toast.error('Debe seleccionar un cliente')
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

    const payload = {
      type: formData.type,
      concept: formData.concept,
      receiver_company_id: formData.receiverCompanyId || undefined,
      client_data: formData.clientData || undefined,
      save_client: formData.saveClient,
      issue_date: formData.emissionDate,
      due_date: formData.dueDate,
      currency: formData.currency,
      exchange_rate: formData.exchangeRate || undefined,
      items: items,
      perceptions: perceptions,
      notes: formData.notes
    }

    try {
      const response = await fetch(`/api/companies/${companyId}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      toast.success('Factura creada exitosamente', {
        description: `Total: ${totals.total.toLocaleString('es-AR', { style: 'currency', currency: formData.currency })}`
      })
      
      setTimeout(() => {
        toast.success('PDF y TXT generados automáticamente')
      }, 1000)
      
      router.push(`/company/${companyId}`)
    } catch (error) {
      toast.error('Error al crear la factura', {
        description: error instanceof Error ? error.message : 'Error desconocido'
      })
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
            <h1 className="text-3xl font-bold">Emitir Factura</h1>
            <p className="text-muted-foreground">Crear nueva factura para la empresa</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos Básicos */}
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
              <CardDescription>Datos básicos de la factura</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tipo de Factura */}
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Factura *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: InvoiceType) => setFormData({...formData, type: value})}
                  disabled={allowedTypes.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedTypes.includes('A') && <SelectItem value="A">Factura A - IVA discriminado (RI a RI)</SelectItem>}
                    {allowedTypes.includes('B') && <SelectItem value="B">Factura B - IVA incluido (RI a no-RI)</SelectItem>}
                    {allowedTypes.includes('C') && <SelectItem value="C">Factura C - Sin IVA</SelectItem>}
                    {allowedTypes.includes('E') && <SelectItem value="E">Factura E - Exportación</SelectItem>}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {currentCompany?.taxConditionAfip === 'RI' && 'Responsable Inscripto: Puede emitir A, B, C, E'}
                  {currentCompany?.taxConditionAfip === 'Monotributo' && 'Monotributo: Solo puede emitir facturas tipo C'}
                  {currentCompany?.taxConditionAfip === 'Exento' && 'Exento: Puede emitir C (local) y E (exportación)'}
                  {currentCompany?.taxConditionAfip === 'CF' && '⚠️ Consumidor Final no puede emitir facturas'}
                </p>
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

              {/* Cliente */}
              <div className="space-y-2">
                <Label>Cliente *</Label>
                <ClientSelector
                  connectedCompanies={mockCompanies}
                  savedClients={mockSavedClients}
                  onSelect={(data) => {
                    if (data.receiver_company_id) {
                      setFormData({
                        ...formData,
                        receiverCompanyId: data.receiver_company_id,
                        clientData: null,
                        saveClient: false
                      })
                    } else if (data.client_id) {
                      // Cliente guardado seleccionado
                      setFormData({
                        ...formData,
                        receiverCompanyId: '',
                        clientData: { client_id: data.client_id },
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



              {/* Fechas y Moneda */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-2">
                  <Label htmlFor="emissionDate">Fecha de Emisión *</Label>
                  <Input
                    id="emissionDate"
                    type="date"
                    value={formData.emissionDate}
                    onChange={(e) => setFormData({...formData, emissionDate: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Fecha de Vencimiento *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    min={formData.emissionDate || new Date().toISOString().split('T')[0]}
                  />
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
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
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
                      value={item.taxRate?.toString() || '21'} 
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
                        placeholder="Nombre de la percepción"
                        value={perception.name}
                        onChange={(e) => updatePerception(index, 'name', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Alícuota (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={perception.rate}
                        onChange={(e) => updatePerception(index, 'rate', parseFloat(e.target.value) || 0)}
                      />
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
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
              

              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      🤖 Generación Automática
                    </p>
                    <ul className="text-xs text-blue-700 mt-1 space-y-1">
                      <li>• PDF oficial y TXT para AFIP/ARCA</li>
                      <li>• Envío automático por email</li>
                      <li>• Numeración correlativa</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Proceso Automático */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-green-100 rounded-full mt-0.5">
                <Download className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">
                  ✅ Descarga de Archivos
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Los archivos TXT se pueden descargar individual o masivamente desde "Ver Facturas"
                </p>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-4">
            <Button type="submit" className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Emitir Factura
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