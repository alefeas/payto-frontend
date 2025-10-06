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
    manualReceiver: false,
    manualReceiverData: {
      businessName: '',
      cuit: ''
    },
    emissionDate: '',
    dueDate: '',
    currency: 'ARS' as Currency,
    exchangeRate: '',
    notes: '',
    // Consumer data for invoice B and C
    consumerData: {
      firstName: '',
      lastName: '',
      dni: '',
      isConsumerFinal: true
    },
    // Company data for invoice C
    companyData: {
      businessName: '',
      cuit: ''
    }
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
      if (perception.type === 'percepcion_iva') {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.dueDate || !formData.emissionDate) {
      toast.error('Complete las fechas requeridas')
      return
    }

    // Validación de campos según tipo de factura
    if (formData.type === 'A' || formData.type === 'E') {
      if (!formData.manualReceiver && !formData.receiverCompanyId) {
        toast.error('Seleccione la empresa receptora')
        return
      }
      if (formData.manualReceiver && (!formData.manualReceiverData?.businessName || !formData.manualReceiverData?.cuit)) {
        toast.error('Complete los datos de la empresa receptora')
        return
      }
    } else if (formData.type === 'B') {
      if (!formData.consumerData.firstName || !formData.consumerData.lastName || !formData.consumerData.dni) {
        toast.error('Complete todos los datos del consumidor final')
        return
      }
    } else if (formData.type === 'C') {
      if (formData.consumerData.isConsumerFinal) {
        if (!formData.consumerData.firstName || !formData.consumerData.lastName || !formData.consumerData.dni) {
          toast.error('Complete todos los datos del consumidor final')
          return
        }
      } else {
        if (!formData.manualReceiver && !formData.receiverCompanyId) {
          toast.error('Seleccione una empresa')
          return
        }
        if (formData.manualReceiver && (!formData.manualReceiverData?.businessName || !formData.manualReceiverData?.cuit)) {
          toast.error('Complete los datos de la empresa')
          return
        }
      }
    }

    // Validación de cotización para monedas extranjeras
    if (formData.currency !== 'ARS' && !formData.exchangeRate) {
      toast.error('Ingrese la cotización de la moneda')
      return
    }
    
    try {
      // La validación de si el tipo de factura es válido para la condición fiscal
      // se realiza en el backend. Si no es válido, el backend devolverá un error
      // que mostraremos al usuario.
      const response = await fetch(`/api/companies/${companyId}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const result = await response.json();
      
      toast.success('Factura creada exitosamente', {
        description: `Total: ${totals.total.toLocaleString('es-AR', { style: 'currency', currency: formData.currency })}`
      });
      
      // Notificación sobre generación automática
      setTimeout(() => {
        toast.success('PDF y TXT generados automáticamente', {
          description: 'Archivos listos para descarga y envío a AFIP/ARCA'
        });
      }, 1000);
      
      // Notificación sobre envío
      setTimeout(() => {
        toast.info('Cliente notificado automáticamente', {
          description: 'Factura enviada por email con PDF adjunto'
        });
      }, 2000);
      
      // Notificación sobre AFIP
      setTimeout(() => {
        toast.info('Archivo TXT listo para ARCA', {
          description: 'Descarga el TXT desde la sección de facturas'
        });
      }, 3000);
      
      router.push(`/company/${companyId}`);
    } catch (error) {
      toast.error('Error al crear la factura', {
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    }



    if (items.some(item => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
      toast.error('Complete todos los ítems correctamente')
      return
    }

    toast.success('Factura creada exitosamente', {
      description: `Total: ${totals.total.toLocaleString('es-AR', { style: 'currency', currency: formData.currency })}`
    })
    
    // Notificación sobre generación automática
    setTimeout(() => {
      toast.success('PDF y TXT generados automáticamente', {
        description: 'Archivos listos para descarga y envío a AFIP/ARCA'
      })
    }, 1000)
    
    // Notificación sobre envío
    setTimeout(() => {
      toast.info('Cliente notificado automáticamente', {
        description: 'Factura enviada por email con PDF adjunto'
      })
    }, 2000)
    
    // Notificación sobre AFIP
    setTimeout(() => {
      toast.info('Archivo TXT listo para ARCA', {
        description: 'Descarga el TXT desde la sección de facturas'
      })
    }, 3000)
    
    router.push(`/company/${companyId}`)
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
                  {/* La validación del tipo de factura según la condición fiscal
                      se debe manejar en el backend para garantizar la seguridad.
                      El frontend puede mostrar advertencias pero no debe ser la única
                      capa de validación. */}
                </Select>
              </div>

              {/* Datos del receptor según tipo de factura */}
              {(formData.type === 'A' || formData.type === 'E') && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Empresa Receptora *</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={!formData.manualReceiver ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFormData({...formData, manualReceiver: false, receiverCompanyId: '', manualReceiverData: {businessName: '', cuit: ''}})}
                      >
                        Seleccionar Empresa
                      </Button>
                      <Button
                        type="button"
                        variant={formData.manualReceiver ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFormData({...formData, manualReceiver: true, receiverCompanyId: ''})}
                      >
                        Datos Manuales
                      </Button>
                    </div>
                  </div>
                  
                  {!formData.manualReceiver ? (
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
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="manualBusinessName">Razón Social *</Label>
                        <Input
                          id="manualBusinessName"
                          placeholder="Nombre de la empresa"
                          value={formData.manualReceiverData?.businessName || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            manualReceiverData: {...formData.manualReceiverData, businessName: e.target.value}
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="manualCuit">CUIT *</Label>
                        <Input
                          id="manualCuit"
                          placeholder="30-12345678-9"
                          value={formData.manualReceiverData?.cuit || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            manualReceiverData: {...formData.manualReceiverData, cuit: e.target.value}
                          })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {formData.type === 'B' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre *</Label>
                    <Input
                      id="firstName"
                      value={formData.consumerData.firstName}
                      onChange={(e) => setFormData({
                        ...formData,
                        consumerData: {...formData.consumerData, firstName: e.target.value}
                      })}
                      placeholder="Nombre del consumidor"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido *</Label>
                    <Input
                      id="lastName"
                      value={formData.consumerData.lastName}
                      onChange={(e) => setFormData({
                        ...formData,
                        consumerData: {...formData.consumerData, lastName: e.target.value}
                      })}
                      placeholder="Apellido del consumidor"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dni">DNI *</Label>
                    <Input
                      id="dni"
                      value={formData.consumerData.dni}
                      onChange={(e) => setFormData({
                        ...formData,
                        consumerData: {...formData.consumerData, dni: e.target.value}
                      })}
                      placeholder="DNI del consumidor"
                    />
                  </div>
                </div>
              )}

              {formData.type === 'C' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientType">Tipo de Cliente *</Label>
                    <Select 
                      value={formData.consumerData.isConsumerFinal ? "consumer" : "company"}
                      onValueChange={(value) => setFormData({
                        ...formData,
                        consumerData: {...formData.consumerData, isConsumerFinal: value === "consumer"}
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo de cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consumer">Consumidor Final</SelectItem>
                        <SelectItem value="company">Empresa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.consumerData.isConsumerFinal ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nombre *</Label>
                        <Input
                          id="firstName"
                          value={formData.consumerData.firstName}
                          onChange={(e) => setFormData({
                            ...formData,
                            consumerData: {...formData.consumerData, firstName: e.target.value}
                          })}
                          placeholder="Nombre del consumidor"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Apellido *</Label>
                        <Input
                          id="lastName"
                          value={formData.consumerData.lastName}
                          onChange={(e) => setFormData({
                            ...formData,
                            consumerData: {...formData.consumerData, lastName: e.target.value}
                          })}
                          placeholder="Apellido del consumidor"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dni">DNI *</Label>
                        <Input
                          id="dni"
                          value={formData.consumerData.dni}
                          onChange={(e) => setFormData({
                            ...formData,
                            consumerData: {...formData.consumerData, dni: e.target.value}
                          })}
                          placeholder="DNI del consumidor"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Empresa *</Label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={!formData.manualReceiver ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFormData({...formData, manualReceiver: false, receiverCompanyId: '', manualReceiverData: {businessName: '', cuit: ''}})}
                          >
                            Seleccionar Empresa
                          </Button>
                          <Button
                            type="button"
                            variant={formData.manualReceiver ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFormData({...formData, manualReceiver: true, receiverCompanyId: ''})}
                          >
                            Datos Manuales
                          </Button>
                        </div>
                      </div>
                      
                      {!formData.manualReceiver ? (
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
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="manualBusinessName">Razón Social *</Label>
                            <Input
                              id="manualBusinessName"
                              placeholder="Nombre de la empresa"
                              value={formData.manualReceiverData?.businessName || ''}
                              onChange={(e) => setFormData({
                                ...formData,
                                manualReceiverData: {...formData.manualReceiverData, businessName: e.target.value}
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="manualCuit">CUIT *</Label>
                            <Input
                              id="manualCuit"
                              placeholder="30-12345678-9"
                              value={formData.manualReceiverData?.cuit || ''}
                              onChange={(e) => setFormData({
                                ...formData,
                                manualReceiverData: {...formData.manualReceiverData, cuit: e.target.value}
                              })}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

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