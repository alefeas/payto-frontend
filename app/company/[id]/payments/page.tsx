"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Plus, Trash2, CreditCard, FileText, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import type { PaymentMethod, PaymentRetention, RetentionType } from "@/types/payment"

// Mock facturas aprobadas listas para pago
const mockPendingInvoices = [
  {
    id: "1",
    number: "FC-001-00000123",
    issuerCompany: "StartupXYZ",
    issueDate: "2024-01-15",
    dueDate: "2024-02-15",
    subtotal: 100000,
    totalTaxes: 21000,
    total: 121000,
    currency: "ARS",
    status: "aprobada",
    bankData: {
      cbu: "0170001540000001234567",
      alias: "STARTUP.XYZ.MP",
      cuit: "30-71234567-8",
      bank: "Banco Santander",
      accountHolder: "StartupXYZ S.A.S."
    }
  },
  {
    id: "2", 
    number: "FC-001-00000124",
    issuerCompany: "Consulting LLC",
    issueDate: "2024-01-20",
    dueDate: "2024-02-20",
    subtotal: 70248,
    totalTaxes: 14752,
    total: 85000,
    currency: "ARS",
    status: "aprobada",
    bankData: {
      cbu: "0720001588000000987654",
      alias: "CONSULTING.LLC.AR",
      cuit: "30-98765432-1",
      bank: "Banco Galicia",
      accountHolder: "Consulting LLC S.R.L."
    }
  }
]

export default function PaymentsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [paymentMode, setPaymentMode] = useState<'single' | 'multiple'>('single')
  const [paymentData, setPaymentData] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    method: 'transferencia' as PaymentMethod,
    reference: '',
    notes: ''
  })

  const [retentions, setRetentions] = useState<Omit<PaymentRetention, 'id' | 'baseAmount' | 'amount'>[]>([])

  const [totals, setTotals] = useState({
    originalAmount: 0,
    totalRetentions: 0,
    netAmount: 0
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  // Función para calcular la base correcta según tipo de retención
  const getRetentionBase = (type: RetentionType, invoices: typeof mockPendingInvoices) => {
    const totalSubtotal = invoices.reduce((sum, inv) => sum + inv.subtotal, 0)
    const totalTaxes = invoices.reduce((sum, inv) => sum + inv.totalTaxes, 0)
    
    switch(type) {
      case 'retencion_ganancias':
      case 'retencion_iibb':
      case 'retencion_suss':
        return totalSubtotal // Base: subtotal (sin IVA)
      case 'retencion_iva':
        return totalTaxes // Base: solo el IVA
      default:
        return totalSubtotal
    }
  }

  const calculateTotals = useCallback(() => {
    if (selectedInvoices.length === 0) return

    const selectedInvoiceData = mockPendingInvoices.filter(inv => selectedInvoices.includes(inv.id))
    const originalAmount = selectedInvoiceData.reduce((sum, inv) => sum + inv.total, 0)
    
    const totalRetentions = retentions.reduce((sum, retention) => {
      const baseAmount = getRetentionBase(retention.type, selectedInvoiceData)
      const retentionAmount = baseAmount * retention.rate / 100
      return sum + retentionAmount
    }, 0)

    setTotals({
      originalAmount,
      totalRetentions,
      netAmount: originalAmount - totalRetentions
    })
  }, [selectedInvoices, retentions])

  useEffect(() => {
    if (selectedInvoices.length > 0) {
      calculateTotals()
    }
  }, [selectedInvoices, retentions, calculateTotals])

  const addRetention = () => {
    setRetentions([...retentions, { 
      type: 'retencion_ganancias', 
      name: 'Retención Ganancias', 
      rate: 2,
      certificateNumber: ''
    }])
  }

  const removeRetention = (index: number) => {
    setRetentions(retentions.filter((_, i) => i !== index))
  }

  const updateRetention = (index: number, field: keyof typeof retentions[0], value: string | number) => {
    const newRetentions = [...retentions]
    newRetentions[index] = { ...newRetentions[index], [field]: value }
    setRetentions(newRetentions)
  }

  const toggleInvoiceSelection = (invoiceId: string) => {
    if (paymentMode === 'single') {
      setSelectedInvoices([invoiceId])
    } else {
      setSelectedInvoices(prev => 
        prev.includes(invoiceId) 
          ? prev.filter(id => id !== invoiceId)
          : [...prev, invoiceId]
      )
    }
  }

  const handleModeChange = (mode: 'single' | 'multiple') => {
    setPaymentMode(mode)
    setSelectedInvoices([])
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado al portapapeles`)
  }

  const generateHomeBankingFile = () => {
    const selectedInvoiceData = mockPendingInvoices.filter(inv => selectedInvoices.includes(inv.id))
    
    let fileContent = "TIPO;CBU;IMPORTE;REFERENCIA;CONCEPTO\n"
    
    selectedInvoiceData.forEach(invoice => {
      const netAmount = invoice.total - (invoice.total * retentions.reduce((sum, ret) => sum + ret.rate, 0) / 100)
      fileContent += `TRF;${invoice.bankData.cbu};${netAmount};${invoice.number};Pago factura ${invoice.number}\n`
    })
    
    const blob = new Blob([fileContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pagos_${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Archivo generado para home banking')
  }

  const openBankLink = (bankName: string, cbu: string, amount: number) => {
    const urls: Record<string, string> = {
      'Banco Santander': `https://www2.santander.com.ar/obp_new/transferencias?cbu=${cbu}&importe=${amount}`,
      'Banco Galicia': `https://onlinebanking.galicia.com.ar/transferencias?destino=${cbu}&monto=${amount}`,
    }
    
    const url = urls[bankName]
    if (url) {
      window.open(url, '_blank')
      toast.success(`Abriendo ${bankName}`)
    } else {
      toast.error('Banco no soportado para apertura directa')
    }
  }

  const validatePayment = () => {
    // Validaciones básicas
    if (selectedInvoices.length === 0) {
      toast.error('Seleccione al menos una factura para pagar')
      return false
    }

    if (!paymentData.paymentDate) {
      toast.error('Ingrese la fecha de pago')
      return false
    }

    // Validar fecha de pago
    const paymentDate = new Date(paymentData.paymentDate)
    const today = new Date()
    const maxPastDate = new Date()
    maxPastDate.setMonth(today.getMonth() - 6) // No más de 6 meses atrás

    if (paymentDate > today) {
      toast.error('La fecha de pago no puede ser futura')
      return false
    }

    if (paymentDate < maxPastDate) {
      toast.error('La fecha de pago no puede ser mayor a 6 meses atrás')
      return false
    }

    // Validar referencia según método de pago
    if (['transferencia', 'cheque'].includes(paymentData.method) && !paymentData.reference.trim()) {
      const methodName = paymentData.method === 'transferencia' ? 'transferencias' : 'cheques'
      toast.error(`Número de referencia obligatorio para ${methodName}`)
      return false
    }

    // Validar certificados de retención obligatorios
    const invalidRetentions = retentions.filter(ret => 
      ['retencion_ganancias', 'retencion_iibb', 'retencion_suss'].includes(ret.type) && 
      !ret.certificateNumber?.trim()
    )
    
    if (invalidRetentions.length > 0) {
      toast.error('Certificados obligatorios para retenciones de Ganancias, IIBB y SUSS')
      return false
    }

    // Validar alícuotas de retención
    const invalidRates = retentions.filter(ret => ret.rate <= 0 || ret.rate > 100)
    if (invalidRates.length > 0) {
      toast.error('Las alícuotas deben estar entre 0.01% y 100%')
      return false
    }

    // Validar que el monto neto sea positivo
    if (totals.netAmount <= 0) {
      toast.error('El monto neto a pagar debe ser mayor a cero')
      return false
    }

    return true
  }

  const mockNotifyProvider = () => {
    // Simular notificación al proveedor
    const selectedInvoiceData = mockPendingInvoices.filter(inv => selectedInvoices.includes(inv.id))
    
    // Mock de email enviado
    const emailData = {
      to: selectedInvoiceData.map(inv => `${inv.issuerCompany.toLowerCase().replace(/\s+/g, '')}@empresa.com`),
      subject: `Pago recibido - ${selectedInvoiceData.length === 1 ? selectedInvoiceData[0].number : `${selectedInvoiceData.length} facturas`}`,
      content: {
        invoices: selectedInvoiceData.map(inv => inv.number),
        paymentAmount: totals.netAmount,
        paymentDate: paymentData.paymentDate,
        retentions: retentions.length,
        reference: paymentData.reference
      }
    }
    
    console.log('📧 Email enviado al proveedor:', emailData)
    
    return {
      emailSent: true,
      notificationCreated: true,
      receiptGenerated: true
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validatePayment()) {
      return
    }

    // Notificar al proveedor
    mockNotifyProvider()
    
    // Éxito
    const invoiceCount = selectedInvoices.length
    const description = invoiceCount === 1 
      ? `Monto neto: $${totals.netAmount.toLocaleString()}`
      : `${invoiceCount} facturas - Monto neto: $${totals.netAmount.toLocaleString()}`

    toast.success('Pago registrado exitosamente', { description })
    
    // Notificación adicional sobre el envío
    setTimeout(() => {
      toast.info('Proveedor notificado por email', {
        description: 'Se envió comprobante de pago automáticamente'
      })
    }, 1000)
    
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
            <h1 className="text-3xl font-bold">Pagar Facturas</h1>
            <p className="text-muted-foreground">Registrar pagos con retenciones</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selección de Factura */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Facturas Pendientes de Pago
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant={paymentMode === 'single' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleModeChange('single')}
                  >
                    Pago Individual
                  </Button>
                  <Button 
                    type="button"
                    variant={paymentMode === 'multiple' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleModeChange('multiple')}
                  >
                    Pago Múltiple
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                {paymentMode === 'single' 
                  ? 'Seleccione una factura para pagar'
                  : 'Seleccione múltiples facturas para pago consolidado'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockPendingInvoices.map((invoice) => (
                <div 
                  key={invoice.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedInvoices.includes(invoice.id)
                      ? 'border-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => toggleInvoiceSelection(invoice.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {paymentMode === 'multiple' && (
                        <input 
                          type="checkbox" 
                          checked={selectedInvoices.includes(invoice.id)}
                          onChange={() => toggleInvoiceSelection(invoice.id)}
                          className="rounded"
                        />
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="font-medium">{invoice.number}</span>
                          <Badge variant="secondary">{invoice.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {invoice.issuerCompany} • Vence: {new Date(invoice.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        ${invoice.total.toLocaleString()} {invoice.currency}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Emitida: {new Date(invoice.issueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {selectedInvoices.length > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">
                    {selectedInvoices.length === 1 
                      ? '1 factura seleccionada'
                      : `${selectedInvoices.length} facturas seleccionadas`
                    }
                  </p>
                  <p className="text-xs text-blue-600">
                    Total: ${mockPendingInvoices
                      .filter(inv => selectedInvoices.includes(inv.id))
                      .reduce((sum, inv) => sum + inv.total, 0)
                      .toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedInvoices.length > 0 && (
            <>
              {/* Facilidades de Pago - PRIMERO */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Facilidades de Pago
                  </CardTitle>
                  <CardDescription>Herramientas para realizar el pago en su banco</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Datos Bancarios */}
                  {selectedInvoices.length === 1 && (() => {
                    const invoice = mockPendingInvoices.find(inv => selectedInvoices.includes(inv.id))
                    if (!invoice) return null
                    
                    return (
                      <div className="space-y-4">
                        <h4 className="font-medium">Datos Bancarios - {invoice.issuerCompany}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">CBU:</span>
                              <div className="flex items-center gap-2">
                                <code className="text-sm bg-white px-2 py-1 rounded">{invoice.bankData.cbu}</code>
                                <Button 
                                  type="button" 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => copyToClipboard(invoice.bankData.cbu, 'CBU')}
                                >
                                  Copiar
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Alias:</span>
                              <div className="flex items-center gap-2">
                                <code className="text-sm bg-white px-2 py-1 rounded">{invoice.bankData.alias}</code>
                                <Button 
                                  type="button" 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => copyToClipboard(invoice.bankData.alias, 'Alias')}
                                >
                                  Copiar
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">CUIT:</span>
                              <div className="flex items-center gap-2">
                                <code className="text-sm bg-white px-2 py-1 rounded">{invoice.bankData.cuit}</code>
                                <Button 
                                  type="button" 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => copyToClipboard(invoice.bankData.cuit, 'CUIT')}
                                >
                                  Copiar
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm font-medium">Titular:</span>
                              <p className="text-sm text-muted-foreground">{invoice.bankData.accountHolder}</p>
                            </div>
                            
                            <div>
                              <span className="text-sm font-medium">Banco:</span>
                              <p className="text-sm text-muted-foreground">{invoice.bankData.bank}</p>
                            </div>
                            
                            <div>
                              <span className="text-sm font-medium">Monto a transferir:</span>
                              <p className="text-lg font-bold text-green-600">
                                ${totals.netAmount.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Acciones Rápidas */}
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyToClipboard(totals.netAmount.toString(), 'Monto')}
                          >
                            Copiar Monto
                          </Button>
                          
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => openBankLink(invoice.bankData.bank, invoice.bankData.cbu, totals.netAmount)}
                          >
                            Abrir {invoice.bankData.bank}
                          </Button>
                          
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={generateHomeBankingFile}
                          >
                            Descargar para Home Banking
                          </Button>
                        </div>
                      </div>
                    )
                  })()}
                  
                  {/* Pago Múltiple */}
                  {selectedInvoices.length > 1 && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Pago Múltiple - {selectedInvoices.length} facturas</h4>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800 mb-3">
                          Para pagos múltiples, recomendamos usar el archivo de home banking:
                        </p>
                        <Button 
                          type="button" 
                          onClick={generateHomeBankingFile}
                          className="w-full"
                        >
                          Generar Archivo para Home Banking
                        </Button>
                        <p className="text-xs text-blue-600 mt-2">
                          El archivo contiene todas las transferencias listas para importar en su banco
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>📋 Siguiente paso:</strong> Una vez realizado el pago en su banco, complete los datos abajo para registrarlo en el sistema.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Registro del Pago - SEGUNDO */}
              <Card>
                <CardHeader>
                  <CardTitle>Registrar Pago Realizado</CardTitle>
                  <CardDescription>Complete estos datos después de realizar el pago en su banco</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="paymentDate">Fecha de Pago *</Label>
                      <Input
                        id="paymentDate"
                        type="date"
                        value={paymentData.paymentDate}
                        onChange={(e) => setPaymentData({...paymentData, paymentDate: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="method">Método de Pago *</Label>
                      <Select value={paymentData.method} onValueChange={(value: PaymentMethod) => 
                        setPaymentData({...paymentData, method: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                          <SelectItem value="efectivo">Efectivo</SelectItem>
                          <SelectItem value="tarjeta">Tarjeta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reference">
                      Referencia/Comprobante
                      {['transferencia', 'cheque'].includes(paymentData.method) && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                    <Input
                      id="reference"
                      placeholder={['transferencia', 'cheque'].includes(paymentData.method) 
                        ? "Obligatorio - Número de transferencia, cheque, etc."
                        : "Número de transferencia, cheque, etc."
                      }
                      value={paymentData.reference}
                      onChange={(e) => setPaymentData({...paymentData, reference: e.target.value})}
                      className={['transferencia', 'cheque'].includes(paymentData.method) && !paymentData.reference.trim()
                        ? "border-red-300 focus:border-red-500"
                        : ""
                      }
                    />
                    {['transferencia', 'cheque'].includes(paymentData.method) && (
                      <p className="text-xs text-muted-foreground">
                        Campo obligatorio para {paymentData.method === 'transferencia' ? 'transferencias' : 'cheques'}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Retenciones */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Retenciones Aplicables
                    <Button type="button" onClick={addRetention} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Retención
                    </Button>
                  </CardTitle>
                  <CardDescription>Retenciones que aplica su empresa al pagar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {retentions.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <p className="text-sm">No hay retenciones aplicadas</p>
                      <p className="text-xs">Agregue retenciones según corresponda</p>
                    </div>
                  ) : (
                    retentions.map((retention, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                        <div className="space-y-2">
                          <Label>Tipo de Retención</Label>
                          <Select 
                            value={retention.type} 
                            onValueChange={(value: RetentionType) => updateRetention(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="retencion_iva">Retención IVA</SelectItem>
                              <SelectItem value="retencion_ganancias">Retención Ganancias</SelectItem>
                              <SelectItem value="retencion_iibb">Retención IIBB</SelectItem>
                              <SelectItem value="retencion_suss">Retención SUSS</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Descripción</Label>
                          <Input
                            placeholder="Nombre de la retención"
                            value={retention.name}
                            onChange={(e) => updateRetention(index, 'name', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Alícuota (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={retention.rate}
                            onChange={(e) => updateRetention(index, 'rate', parseFloat(e.target.value) || 0)}
                          />
                          <p className="text-xs text-muted-foreground">
                            {retention.type === 'retencion_iva' 
                              ? 'Se aplica sobre el IVA'
                              : 'Se aplica sobre el subtotal (sin IVA)'
                            }
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>
                            N° Certificado
                            {['retencion_ganancias', 'retencion_iibb', 'retencion_suss'].includes(retention.type) && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </Label>
                          <Input
                            placeholder={['retencion_ganancias', 'retencion_iibb', 'retencion_suss'].includes(retention.type) 
                              ? "Obligatorio" 
                              : "Opcional"
                            }
                            value={retention.certificateNumber}
                            onChange={(e) => updateRetention(index, 'certificateNumber', e.target.value)}
                            className={['retencion_ganancias', 'retencion_iibb', 'retencion_suss'].includes(retention.type) && !retention.certificateNumber?.trim()
                              ? "border-red-300 focus:border-red-500"
                              : ""
                            }
                          />
                        </div>
                        
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeRetention(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Resumen de Pago */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Resumen del Pago
                    {selectedInvoices.length > 1 && (
                      <Badge variant="secondary">
                        {selectedInvoices.length} facturas
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedInvoices.length > 1 && (
                      <div className="space-y-2 pb-3 border-b">
                        <p className="text-sm font-medium">Detalle por factura:</p>
                        {mockPendingInvoices
                          .filter(inv => selectedInvoices.includes(inv.id))
                          .map(invoice => (
                            <div key={invoice.id} className="flex justify-between text-sm">
                              <span>{invoice.number}</span>
                              <span>${invoice.total.toLocaleString()}</span>
                            </div>
                          ))
                        }
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Monto Original:</span>
                      <span className="font-medium">
                        ${totals.originalAmount.toLocaleString()}
                      </span>
                    </div>
                    {totals.totalRetentions > 0 && (
                      <>
                        <div className="space-y-2 pb-2 border-b">
                          <p className="text-sm font-medium">Detalle de retenciones:</p>
                          {retentions.map((retention, index) => {
                            const selectedInvoiceData = mockPendingInvoices.filter(inv => selectedInvoices.includes(inv.id))
                            const baseAmount = getRetentionBase(retention.type, selectedInvoiceData)
                            const retentionAmount = baseAmount * retention.rate / 100
                            
                            return (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{retention.name} ({retention.rate}%):</span>
                                <span className="text-red-600">-${retentionAmount.toLocaleString()}</span>
                              </div>
                            )
                          })}
                        </div>
                        <div className="flex justify-between">
                          <span>Total Retenciones:</span>
                          <span className="font-medium text-red-600">
                            -${totals.totalRetentions.toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Monto Neto a Pagar:</span>
                      <span className="text-green-600">
                        ${totals.netAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>



              {/* Notas */}
              <Card>
                <CardHeader>
                  <CardTitle>Notas del Pago</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="notes">Observaciones</Label>
                      <Textarea
                        id="notes"
                        placeholder="Notas adicionales sobre el pago..."
                        value={paymentData.notes}
                        onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                      />
                    </div>
                    
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-800">
                        <strong>⚠️ Importante:</strong> Las retenciones deben estar respaldadas por certificados válidos según normativa AFIP.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Acciones */}
              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Registrar Pago
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push(`/company/${companyId}`)}
                >
                  Cancelar
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}