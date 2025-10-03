"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Plus, Trash2, Upload, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import type { InvoiceType, Currency, InvoiceItem, InvoicePerception } from "@/types/invoice"

const mockCompanies = [
  { id: "1", name: "TechCorp SA", uniqueId: "TC8X9K2L" },
  { id: "2", name: "StartupXYZ", uniqueId: "SU4P7M9N" },
  { id: "3", name: "Consulting LLC", uniqueId: "CL1Q3R8T" },
]

export default function CreateInvoicePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [formData, setFormData] = useState({
    type: 'A' as InvoiceType,
    receiverCompanyId: '',
    dueDate: '',
    currency: 'ARS' as Currency,
    notes: ''
  })
  const [pdfFile, setPdfFile] = useState<File | null>(null)

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
      const taxAmount = itemSubtotal * (item.taxRate || 0) / 100
      return sum + taxAmount
    }, 0)
    
    const totalPerceptions = perceptions.reduce((sum, perception) => {
      const baseAmount = subtotal + totalTaxes
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
    setPerceptions([...perceptions, { type: 'percepcion_iibb', name: 'Percepción IIBB', rate: 3 }])
  }

  const removePerception = (index: number) => {
    setPerceptions(perceptions.filter((_, i) => i !== index))
  }

  const updatePerception = (index: number, field: keyof typeof perceptions[0], value: string | number) => {
    const newPerceptions = [...perceptions]
    newPerceptions[index] = { ...newPerceptions[index], [field]: value }
    setPerceptions(newPerceptions)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.receiverCompanyId || !formData.dueDate) {
      toast.error('Complete todos los campos requeridos')
      return
    }

    if (!pdfFile) {
      toast.error('Debe adjuntar el archivo PDF de la factura')
      return
    }

    if (items.some(item => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
      toast.error('Complete todos los ítems correctamente')
      return
    }

    toast.success('Factura creada y enviada exitosamente', {
      description: `Total: ${totals.total.toLocaleString('es-AR', { style: 'currency', currency: formData.currency })}`
    })
    
    // Notificación adicional sobre el envío
    setTimeout(() => {
      toast.info('Cliente notificado por email', {
        description: 'Se envió la factura automáticamente'
      })
    }, 1500)
    
    router.push(`/company/${companyId}`)
  }

  if (authLoading) return null
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/company/${companyId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Cargar Factura</h1>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receiver">Empresa Receptora *</Label>
                  <Select value={formData.receiverCompanyId} onValueChange={(value) => 
                    setFormData({...formData, receiverCompanyId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCompanies.map(company => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda *</Label>
                  <Select value={formData.currency} onValueChange={(value: Currency) => 
                    setFormData({...formData, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ARS">Pesos Argentinos (ARS)</SelectItem>
                      <SelectItem value="USD">Dólares (USD)</SelectItem>
                      <SelectItem value="EUR">Euros (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Fecha de Vencimiento *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                />
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
                        <SelectItem value="0">0%</SelectItem>
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
                          <SelectItem value="percepcion_iva">Percepción IVA</SelectItem>
                          <SelectItem value="percepcion_iibb">Percepción IIBB</SelectItem>
                          <SelectItem value="percepcion_suss">Percepción SUSS</SelectItem>
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
              
              <div className="space-y-2">
                <Label htmlFor="pdf">Archivo PDF de la Factura *</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="pdf" 
                    type="file" 
                    accept=".pdf" 
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
                {pdfFile && (
                  <p className="text-sm text-muted-foreground">
                    Archivo: {pdfFile.name}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  El PDF es necesario para que el cliente pueda verificar los datos de la factura
                </p>
              </div>
              
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  <strong>⚠️ Importante:</strong> El PDF de la factura es obligatorio para permitir al cliente verificar todos los datos antes del pago.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notificación de Envío */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-blue-100 rounded-full mt-0.5">
                <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">
                  📧 Envío Automático
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Al crear la factura, se enviará automáticamente por email al cliente y se generará una notificación en el sistema.
                </p>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-4">
            <Button type="submit" className="flex-1">
              Crear y Enviar Factura
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