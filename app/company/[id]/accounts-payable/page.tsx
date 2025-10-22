"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, TrendingUp, TrendingDown, AlertCircle, Calendar, DollarSign, FileText, Download, Plus, Filter, Search, Trash2 } from "lucide-react"
import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { accountsPayableService } from "@/services/accounts-payable.service"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

export default function AccountsPayablePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [dashboard, setDashboard] = useState<any>(null)
  const [invoices, setInvoices] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showTxtDialog, setShowTxtDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('invoices')
  const [paymentDialogTab, setPaymentDialogTab] = useState('payment')
  const [paymentForm, setPaymentForm] = useState({
    invoice_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'transfer',
    reference_number: '',
    notes: '',
  })
  const [retentions, setRetentions] = useState<Array<{type: string, name: string, rate: number, baseType: string}>>([])
  const [filters, setFilters] = useState({
    payment_status: '',
    search: '',
    overdue: false,
    from_date: '',
    to_date: '',
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    } else if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated, authLoading])
  
  useEffect(() => {
    if (isAuthenticated && companyId) {
      loadInvoices()
    }
  }, [filters.search, filters.from_date, filters.to_date, isAuthenticated, companyId])
  
  const loadInvoices = async () => {
    try {
      const invoicesData = await accountsPayableService.getInvoices(companyId, {})
      setInvoices(invoicesData.data || [])
    } catch (error: any) {
      console.error('Error loading invoices:', error)
      toast.error('Error al cargar facturas')
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      
      const [dashboardData, paymentsData] = await Promise.all([
        accountsPayableService.getDashboard(companyId),
        accountsPayableService.getPayments(companyId),
      ])
      
      console.log('Dashboard data:', dashboardData)
      console.log('Payments data:', paymentsData)
      
      setDashboard(dashboardData)
      setPayments(paymentsData.data || [])
      
      await loadInvoices()
    } catch (error: any) {
      console.error('Error loading accounts payable data:', error)
      toast.error(error.response?.data?.error || error.message || 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const handlePayInvoices = async (invoiceIds: string[]) => {
    if (invoiceIds.length === 0) return
    
    const selectedInvoiceData = invoices.filter(inv => invoiceIds.includes(inv.id))
    const totalAmount = selectedInvoiceData.reduce((sum, inv) => sum + (inv.pending_amount || inv.total), 0)
    
    setPaymentForm({
      ...paymentForm,
      invoice_id: invoiceIds.length === 1 ? invoiceIds[0] : '',
      amount: totalAmount.toString(),
    })
    
    try {
      const response = await accountsPayableService.getDefaultRetentions(companyId)
      if (response.is_retention_agent && response.auto_retentions?.length > 0) {
        setRetentions(response.auto_retentions.map((r: any) => ({
          type: r.type || 'other',
          name: r.name || '',
          rate: r.rate || 0,
          baseType: r.base_type || r.baseType || 'net'
        })))
      } else {
        setRetentions([])
      }
    } catch (error) {
      console.error('Error loading default retentions:', error)
      setRetentions([])
    }
    
    setShowPaymentDialog(true)
  }

  const handleSubmitPayment = async () => {
    // Validar retenciones
    for (const ret of retentions) {
      if (!ret.type || !ret.name || !ret.name.trim() || ret.rate <= 0) {
        toast.error('Todas las retenciones deben tener tipo, descripción y alícuota mayor a 0')
        return
      }
    }
    
    setSubmitting(true)
    try {
      // Pago múltiple: registrar pago para cada factura seleccionada
      if (selectedInvoices.length > 1) {
        const selectedInvoiceData = invoices.filter(inv => selectedInvoices.includes(inv.id))
        for (const invoice of selectedInvoiceData) {
          const invoiceAmount = invoice.pending_amount || invoice.total
          const retentionsWithAmounts = retentions.map(ret => {
            const base = ret.baseType === 'total' ? invoiceAmount : invoiceAmount
            return { type: ret.type, name: ret.name, rate: ret.rate, base_amount: base, amount: base * ret.rate / 100 }
          })
          
          await accountsPayableService.registerPayment(companyId, {
            invoice_id: invoice.id,
            amount: invoiceAmount,
            payment_date: paymentForm.payment_date,
            payment_method: paymentForm.payment_method,
            reference_number: paymentForm.reference_number,
            notes: paymentForm.notes,
            retentions: retentionsWithAmounts,
          })
        }
        toast.success(`${selectedInvoices.length} pagos registrados exitosamente`)
      } else {
        // Pago individual
        const amount = parseFloat(paymentForm.amount)
        const retentionsWithAmounts = retentions.map(ret => {
          const base = ret.baseType === 'total' ? amount : amount
          return { type: ret.type, name: ret.name, rate: ret.rate, base_amount: base, amount: base * ret.rate / 100 }
        })
        
        await accountsPayableService.registerPayment(companyId, {
          ...paymentForm,
          amount,
          retentions: retentionsWithAmounts,
        })
        toast.success('Pago registrado exitosamente')
      }
      
      setShowPaymentDialog(false)
      setSelectedInvoices([])
      
      // Recargar datos sin recargar página
      setRefreshing(true)
      await loadInvoices()
      const paymentsData = await accountsPayableService.getPayments(companyId)
      setPayments(paymentsData.data || [])
      setRefreshing(false)
    } catch (error: any) {
      console.error('Payment error:', error)
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Error al registrar pago')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGenerateTxt = async () => {
    if (selectedInvoices.length === 0) {
      toast.error('Selecciona al menos una factura')
      return
    }
    
    // Validar que todas las facturas tengan datos bancarios
    const selectedInvoiceData = invoices.filter(inv => selectedInvoices.includes(inv.id))
    const withoutBankData = selectedInvoiceData.filter(inv => !inv.has_bank_data)
    
    if (withoutBankData.length > 0) {
      toast.error(`${withoutBankData.length} factura(s) sin datos bancarios del proveedor`, {
        description: 'Complete los datos bancarios en Mis Proveedores'
      })
      return
    }
    
    try {
      const blob = await accountsPayableService.generatePaymentTxt(companyId, selectedInvoices)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pagos_${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Archivo TXT generado')
      setShowTxtDialog(false)
      setSelectedInvoices([])
    } catch (error) {
      toast.error('Error al generar archivo TXT')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount)
  }

  const getRetentionLabel = (type: string) => {
    const labels: Record<string, string> = {
      'vat_retention': 'Retención IVA',
      'income_tax_retention': 'Retención Ganancias',
      'suss_retention': 'Retención SUSS',
      'gross_income_buenosaires': 'IIBB Buenos Aires',
      'gross_income_caba': 'IIBB CABA',
      'gross_income_catamarca': 'IIBB Catamarca',
      'gross_income_chaco': 'IIBB Chaco',
      'gross_income_chubut': 'IIBB Chubut',
      'gross_income_cordoba': 'IIBB Córdoba',
      'gross_income_corrientes': 'IIBB Corrientes',
      'gross_income_entrerios': 'IIBB Entre Ríos',
      'gross_income_formosa': 'IIBB Formosa',
      'gross_income_jujuy': 'IIBB Jujuy',
      'gross_income_lapampa': 'IIBB La Pampa',
      'gross_income_larioja': 'IIBB La Rioja',
      'gross_income_mendoza': 'IIBB Mendoza',
      'gross_income_misiones': 'IIBB Misiones',
      'gross_income_neuquen': 'IIBB Neuquén',
      'gross_income_rionegro': 'IIBB Río Negro',
      'gross_income_salta': 'IIBB Salta',
      'gross_income_sanjuan': 'IIBB San Juan',
      'gross_income_sanluis': 'IIBB San Luis',
      'gross_income_santacruz': 'IIBB Santa Cruz',
      'gross_income_santafe': 'IIBB Santa Fe',
      'gross_income_santiagodelestero': 'IIBB Santiago del Estero',
      'gross_income_tierradelfuego': 'IIBB Tierra del Fuego',
      'gross_income_tucuman': 'IIBB Tucumán',
      'other': 'Otra Retención'
    }
    return labels[type] || type
  }

  const getFilteredInvoices = () => {
    return invoices.filter(inv => {
      // Filtrar por fecha solo si hay filtros activos
      if (filters.from_date || filters.to_date) {
        const issueDate = new Date(inv.issue_date)
        if (filters.from_date && issueDate < new Date(filters.from_date)) return false
        if (filters.to_date && issueDate > new Date(filters.to_date)) return false
      }
      // Filtrar por CUIT
      if (filters.search) {
        const cuit = inv.supplier?.document_number || inv.issuerCompany?.national_id || ''
        if (!cuit.includes(filters.search)) return false
      }
      return true
    })
  }

  const getFilteredSummary = () => {
    const filtered = getFilteredInvoices()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Calcular totales del periodo filtrado
    const totalPending = filtered.reduce((sum, inv) => sum + (parseFloat(inv.pending_amount) || 0), 0)
    const totalPayable = filtered.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0)
    const totalPaid = filtered.reduce((sum, inv) => {
      const total = parseFloat(inv.total) || 0
      const pending = parseFloat(inv.pending_amount) || 0
      return sum + (total - pending)
    }, 0)
    
    // Calcular vencidas de las facturas filtradas
    const overdue = filtered.filter(inv => {
      const dueDate = new Date(inv.due_date)
      dueDate.setHours(0, 0, 0, 0)
      return dueDate < today && inv.pending_amount > 0
    })
    
    return {
      total_payable: totalPayable,
      total_paid: totalPaid,
      total_pending: totalPending,
      overdue_count: overdue.length,
      overdue_amount: overdue.reduce((sum, inv) => sum + (parseFloat(inv.pending_amount) || 0), 0)
    }
  }

  const getInvoiceStatusBadges = (invoice: any) => {
    const badges = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(invoice.due_date)
    dueDate.setHours(0, 0, 0, 0)
    const isOverdue = dueDate < today && invoice.payment_status !== 'paid'
    
    // Estado de vencimiento
    if (isOverdue) {
      badges.push(<Badge key="overdue" className="bg-red-500 text-white font-semibold">Vencida</Badge>)
    }
    
    // Estado de pago
    if (invoice.payment_status === 'paid') {
      badges.push(<Badge key="payment" className="bg-green-100 text-green-800">Pagada</Badge>)
    } else if (invoice.payment_status === 'partial') {
      badges.push(<Badge key="payment" className="bg-yellow-100 text-yellow-800">Pago Parcial</Badge>)
    } else {
      badges.push(<Badge key="payment" className="bg-gray-100 text-gray-800">Pendiente Pago</Badge>)
    }
    
    return <div className="flex gap-1 flex-wrap">{badges}</div>
  }

  if (authLoading || loading) return null
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/company/${companyId}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Cuentas por Pagar</h1>
              <p className="text-muted-foreground">Gestión de facturas de proveedores y pagos</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowTxtDialog(true)}
              disabled={selectedInvoices.length === 0 || invoices.filter(inv => selectedInvoices.includes(inv.id)).some(inv => !inv.has_bank_data)}
            >
              <Download className="h-4 w-4 mr-2" />
              Generar TXT Homebanking {selectedInvoices.length > 0 && `(${selectedInvoices.length})`}
            </Button>
            <Button 
              onClick={() => {
                if (selectedInvoices.length > 0) {
                  handlePayInvoices(selectedInvoices)
                }
              }}
              disabled={selectedInvoices.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Registrar Pago {selectedInvoices.length > 0 && `(${selectedInvoices.length})`}
            </Button>
          </div>
        </div>

        {/* Dashboard Cards */}
        {dashboard && (() => {
          const summary = getFilteredSummary()
          return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendiente de Pago</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(summary.total_pending)}</div>
                  <p className="text-xs text-muted-foreground">
                    {filters.from_date || filters.to_date ? 'Del periodo filtrado' : 'Total pendiente'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Facturas Vencidas</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{summary.overdue_count}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(summary.overdue_amount)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Próximos Vencimientos</CardTitle>
                  <Calendar className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{dashboard.summary.upcoming_count}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(dashboard.summary.upcoming_amount)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pagado</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.total_paid)}</div>
                  <p className="text-xs text-muted-foreground">
                    {filters.from_date || filters.to_date ? 'Del periodo filtrado' : 'Total histórico'}
                  </p>
                </CardContent>
              </Card>
            </div>
          )
        })()}

        {/* Filtros Globales */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                type="date"
                value={filters.from_date}
                onChange={(e) => setFilters({...filters, from_date: e.target.value})}
                className="w-40"
                placeholder="Desde"
              />
              <Input
                type="date"
                value={filters.to_date}
                onChange={(e) => setFilters({...filters, to_date: e.target.value})}
                className="w-40"
                placeholder="Hasta"
              />
              <Input
                placeholder="Buscar por CUIT (XX-XXXXXXXX-X)..."
                value={filters.search}
                onChange={(e) => {
                  let value = e.target.value.replace(/[^0-9]/g, '')
                  if (value.length > 11) value = value.slice(0, 11)
                  if (value.length > 2) value = value.slice(0, 2) + '-' + value.slice(2)
                  if (value.length > 11) value = value.slice(0, 11) + '-' + value.slice(11)
                  setFilters({...filters, search: value})
                }}
                maxLength={13}
                className="flex-1"
              />
              {(filters.from_date || filters.to_date || filters.search) && (
                <Button variant="outline" onClick={() => setFilters({...filters, from_date: '', to_date: '', search: ''})}>
                  Limpiar Filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="invoices">Facturas Pendientes</TabsTrigger>
            <TabsTrigger value="upcoming">Próximas a Vencer</TabsTrigger>
            <TabsTrigger value="overdue">Vencidas</TabsTrigger>
            <TabsTrigger value="payments">Pagos Realizados</TabsTrigger>
            <TabsTrigger value="suppliers">Por Proveedor</TabsTrigger>
          </TabsList>

          {/* Facturas por Pagar */}
          <TabsContent value="invoices" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Facturas Pendientes</CardTitle>
                    {selectedInvoices.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedInvoices.length} factura{selectedInvoices.length !== 1 ? 's' : ''} seleccionada{selectedInvoices.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  {getFilteredInvoices().length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const filtered = getFilteredInvoices()
                        if (selectedInvoices.length === filtered.length) {
                          setSelectedInvoices([])
                        } else {
                          setSelectedInvoices(filtered.map(inv => inv.id))
                        }
                      }}
                    >
                      {selectedInvoices.length === getFilteredInvoices().length ? 'Deseleccionar Todas' : 'Seleccionar Todas'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Cargando facturas...</p>
                    </div>
                  ) : invoices.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No hay facturas pendientes</p>
                      <p className="text-xs mt-2">Total facturas cargadas: {invoices.length}</p>
                    </div>
                  ) : (
                    getFilteredInvoices().map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer" onClick={() => {
                      if (selectedInvoices.includes(invoice.id)) {
                        setSelectedInvoices(selectedInvoices.filter(id => id !== invoice.id))
                      } else {
                        setSelectedInvoices([...selectedInvoices, invoice.id])
                      }
                    }}>
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={selectedInvoices.includes(invoice.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedInvoices([...selectedInvoices, invoice.id])
                            } else {
                              setSelectedInvoices(selectedInvoices.filter(id => id !== invoice.id))
                            }
                          }}
                        />
                        <div>
                          <div className="font-medium">{invoice.supplier?.business_name || (invoice.supplier?.first_name && invoice.supplier?.last_name ? `${invoice.supplier.first_name} ${invoice.supplier.last_name}` : null) || invoice.issuerCompany?.business_name || invoice.issuerCompany?.name || 'Proveedor'}</div>
                          <div className="text-sm text-muted-foreground">
                            {invoice.type || 'FC'} {String(invoice.sales_point || 0).padStart(4, '0')}-{String(invoice.voucher_number || 0).padStart(8, '0')}
                          </div>
                          {invoice.supplier && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {invoice.has_bank_data ? (
                                <span className="text-green-600">✓ Datos bancarios</span>
                              ) : (
                                <span className="text-orange-600">⚠ Sin datos bancarios</span>
                              )}
                              {invoice.supplier.bank_cbu && ` • CBU: ${invoice.supplier.bank_cbu.slice(0, 6)}...`}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(invoice.pending_amount || invoice.total)}</div>
                          <div className="text-sm text-muted-foreground">
                            Vence: {new Date(invoice.due_date).toLocaleDateString('es-AR')}
                          </div>
                        </div>
                        {getInvoiceStatusBadges(invoice)}
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/company/${companyId}/invoices/${invoice.id}`)
                          }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {invoice.status === 'approved' && (
                            <Button size="sm" onClick={(e) => {
                              e.stopPropagation()
                              setSelectedInvoices([invoice.id])
                              handlePayInvoices([invoice.id])
                            }}>
                              Pagar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Próximas a Vencer */}
          <TabsContent value="upcoming" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-yellow-600">Próximas a Vencer (30 días)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {!dashboard?.upcoming_invoices || dashboard.upcoming_invoices.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No hay facturas próximas a vencer</p>
                    </div>
                  ) : (
                    dashboard.upcoming_invoices.map((invoice: any) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                      <div>
                        <div className="font-medium">{invoice.supplier}</div>
                        <div className="text-sm text-muted-foreground">
                          {invoice.voucher_number} • Vence en {invoice.days_until_due} días
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-yellow-600">{formatCurrency(invoice.pending_amount)}</div>
                        <Button size="sm" variant="outline" onClick={() => {
                          const fullInvoice = invoices.find(inv => inv.id === invoice.id)
                          if (fullInvoice) {
                            setSelectedInvoices([fullInvoice.id])
                            handlePayInvoices([fullInvoice.id])
                          }
                        }}>
                          Pagar
                        </Button>
                      </div>
                    </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pagos Realizados */}
          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Pagos</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {payments.length} pago{payments.length !== 1 ? 's' : ''} registrado{payments.length !== 1 ? 's' : ''}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {refreshing ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Cargando pagos...</p>
                    </div>
                  ) : payments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No hay pagos registrados</p>
                      <p className="text-xs mt-2">Los pagos aparecerán aquí una vez que registres pagos de facturas</p>
                    </div>
                  ) : (
                    payments
                      .filter((payment) => {
                        if (!filters.from_date && !filters.to_date) return true
                        const paymentDate = new Date(payment.payment_date)
                        if (filters.from_date && paymentDate < new Date(filters.from_date)) return false
                        if (filters.to_date && paymentDate > new Date(filters.to_date)) return false
                        return true
                      })
                      .map((payment) => {
                        const methodLabels: Record<string, string> = {
                          transfer: 'Transferencia',
                          check: 'Cheque',
                          cash: 'Efectivo',
                          debit_card: 'Débito',
                          credit_card: 'Crédito',
                          card: 'Tarjeta',
                          other: 'Otro'
                        }
                        const totalRetentions = Array.isArray(payment.retentions) ? payment.retentions.reduce((sum: number, r: any) => sum + (parseFloat(r.amount) || 0), 0) : 0
                        const netAmount = (parseFloat(payment.amount) || 0) - totalRetentions
                        
                        return (
                    <div key={payment.id} className="p-4 border rounded-lg bg-blue-50/50 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-lg">{payment.invoice?.supplier?.business_name || (payment.invoice?.supplier?.first_name && payment.invoice?.supplier?.last_name ? `${payment.invoice.supplier.first_name} ${payment.invoice.supplier.last_name}` : null) || payment.invoice?.issuerCompany?.business_name || payment.invoice?.issuerCompany?.name || 'Proveedor'}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Factura: {payment.invoice?.type || 'FC'} {String(payment.invoice?.sales_point || 0).padStart(4, '0')}-{String(payment.invoice?.voucher_number || payment.voucher_number || 0).padStart(8, '0')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-blue-600">{formatCurrency(parseFloat(payment.amount) || 0)}</div>
                          <Badge className="bg-blue-600 text-white mt-1">Pagado</Badge>
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground pt-2 border-t">
                        <div>
                          <span className="font-medium">Fecha:</span> {new Date(payment.payment_date).toLocaleDateString('es-AR')}
                        </div>
                        <div>
                          <span className="font-medium">Método:</span> {methodLabels[payment.payment_method] || payment.payment_method}
                        </div>
                        {payment.reference_number && (
                          <div>
                            <span className="font-medium">Ref:</span> {payment.reference_number}
                          </div>
                        )}
                      </div>
                      {totalRetentions > 0 && (
                        <div className="mt-2 pt-2 border-t">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Retenciones aplicadas:</span>
                            <span className="font-medium text-orange-600">{formatCurrency(totalRetentions)}</span>
                          </div>
                          <div className="flex justify-between text-sm font-semibold">
                            <span>Neto pagado:</span>
                            <span className="text-green-600">{formatCurrency(netAmount)}</span>
                          </div>
                          {Array.isArray(payment.retentions) && payment.retentions.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {payment.retentions.map((ret: any, idx: number) => (
                                <div key={idx} className="text-xs text-muted-foreground flex justify-between">
                                  <span>• {ret.name || getRetentionLabel(ret.type)}</span>
                                  <span>{formatCurrency(parseFloat(ret.amount) || 0)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {payment.notes && (
                        <div className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                          <span className="font-medium">Notas:</span> {payment.notes}
                        </div>
                      )}
                    </div>
                        )
                      })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Facturas Vencidas */}
          <TabsContent value="overdue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Facturas Vencidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {!dashboard?.overdue_invoices || dashboard.overdue_invoices.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No hay facturas vencidas</p>
                    </div>
                  ) : (
                    dashboard.overdue_invoices
                      .filter((invoice: any) => {
                        if (!filters.from_date && !filters.to_date) return true
                        const issueDate = new Date(invoice.issue_date || invoice.due_date)
                        if (filters.from_date && issueDate < new Date(filters.from_date)) return false
                        if (filters.to_date && issueDate > new Date(filters.to_date)) return false
                        return true
                      })
                      .map((invoice: any) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                      <div>
                        <div className="font-medium">{invoice.supplier}</div>
                        <div className="text-sm text-muted-foreground">
                          {invoice.voucher_number} • Vencida hace {invoice.days_overdue} días
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-red-600">{formatCurrency(invoice.pending_amount)}</div>
                        <Button size="sm" variant="destructive" onClick={() => {
                          const fullInvoice = invoices.find(inv => inv.id === invoice.id)
                          if (fullInvoice) {
                            setSelectedInvoices([fullInvoice.id])
                            handlePayInvoices([fullInvoice.id])
                          }
                        }}>
                          Pagar Urgente
                        </Button>
                      </div>
                    </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Por Proveedor */}
          <TabsContent value="suppliers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resumen por Proveedor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {!dashboard?.by_supplier || dashboard.by_supplier.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No hay datos por proveedor</p>
                    </div>
                  ) : (
                    dashboard.by_supplier
                      .filter((supplier: any) => {
                        if (!filters.search) return true
                        const supplierInvoices = invoices.filter(inv => 
                          (inv.supplier_id || inv.issuer_company_id) === supplier.supplier_id
                        )
                        if (supplierInvoices.length === 0) return false
                        const cuit = supplierInvoices[0]?.supplier?.document_number || supplierInvoices[0]?.issuerCompany?.national_id || ''
                        return cuit.includes(filters.search)
                      })
                      .map((supplier: any) => {
                        const firstInvoice = invoices.find(inv => 
                          (inv.supplier_id || inv.issuer_company_id) === supplier.supplier_id
                        )
                        const cuit = firstInvoice?.supplier?.document_number || firstInvoice?.issuerCompany?.national_id || ''
                        return (
                    <div key={supplier.supplier_id} className="p-4 border border-violet-200 bg-violet-50 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                            <div className="font-semibold text-gray-900">{supplier.supplier_name}</div>
                          </div>
                          {cuit && (
                            <div className="text-sm text-gray-500 ml-4">{cuit}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 mb-1">Pendiente</div>
                          <div className="font-bold text-lg text-violet-600">{formatCurrency(supplier.total_pending)}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-violet-200">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium text-gray-900">{supplier.invoice_count}</span> factura{supplier.invoice_count !== 1 ? 's' : ''}
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-violet-500 hover:bg-violet-600 text-white"
                          onClick={() => {
                            setActiveTab('invoices')
                            setFilters({...filters, search: cuit})
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Facturas
                        </Button>
                      </div>
                    </div>
                        )
                      })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Pago de Factura{selectedInvoices.length > 1 ? 's' : ''}</DialogTitle>
            </DialogHeader>
            
            <Tabs value={paymentDialogTab} onValueChange={setPaymentDialogTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="payment">Pago</TabsTrigger>
                <TabsTrigger value="details">Detalles</TabsTrigger>
              </TabsList>

              <TabsContent value="payment" className="space-y-4 mt-4">
                <form className="space-y-4">
                  {/* Resumen de Facturas */}
                  <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                    {selectedInvoices.length === 1 ? (
                      (() => {
                        const invoice = invoices.find(inv => inv.id === selectedInvoices[0])
                        const supplierName = invoice?.supplier?.business_name || 
                                           (invoice?.supplier?.first_name && invoice?.supplier?.last_name 
                                             ? `${invoice.supplier.first_name} ${invoice.supplier.last_name}` 
                                             : null) ||
                                           invoice?.issuerCompany?.business_name ||
                                           invoice?.issuerCompany?.name ||
                                           'Sin nombre'
                        return (
                          <>
                            <div className="flex justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">Factura</p>
                                <p className="font-semibold">
                                  {invoice?.type} {String(invoice?.sales_point || 0).padStart(4, '0')}-{String(invoice?.voucher_number || 0).padStart(8, '0')}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">Proveedor</p>
                                <p className="font-semibold">{supplierName}</p>
                              </div>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-sm">
                              <span>Total Factura:</span>
                              <span className="font-semibold">{formatCurrency(invoice?.pending_amount || invoice?.total || 0)}</span>
                            </div>
                          </>
                        )
                      })()
                    ) : (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Facturas Seleccionadas ({selectedInvoices.length})</p>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {invoices.filter(inv => selectedInvoices.includes(inv.id)).map((invoice) => (
                              <div key={invoice.id} className="flex justify-between text-xs p-2 bg-background rounded">
                                <span>{invoice.type} {String(invoice.sales_point || 0).padStart(4, '0')}-{String(invoice.voucher_number || 0).padStart(8, '0')}</span>
                                <span className="font-medium">{formatCurrency(invoice.pending_amount || invoice.total)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-sm">
                          <span>Total a Pagar:</span>
                          <span className="font-semibold">{formatCurrency(parseFloat(paymentForm.amount) || 0)}</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha de Pago *</Label>
                      <Input
                        type="date"
                        value={paymentForm.payment_date}
                        onChange={(e) => setPaymentForm({...paymentForm, payment_date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Método de Pago *</Label>
                      <Select value={paymentForm.payment_method} onValueChange={(value) => setPaymentForm({...paymentForm, payment_method: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="transfer">Transferencia</SelectItem>
                          <SelectItem value="check">Cheque</SelectItem>
                          <SelectItem value="cash">Efectivo</SelectItem>
                          <SelectItem value="debit_card">Tarjeta de Débito</SelectItem>
                          <SelectItem value="credit_card">Tarjeta de Crédito</SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Número de Referencia</Label>
                    <Input
                      value={paymentForm.reference_number}
                      onChange={(e) => setPaymentForm({...paymentForm, reference_number: e.target.value})}
                      placeholder="Opcional"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Notas</Label>
                    <Textarea
                      value={paymentForm.notes}
                      onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                      placeholder="Opcional"
                      rows={2}
                    />
                  </div>
                  {/* Retenciones */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Retenciones</Label>
                      <Button 
                        type="button" 
                        onClick={() => setRetentions([...retentions, { type: 'other', name: '', rate: 0, baseType: 'net' }])} 
                        size="sm" 
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar
                      </Button>
                    </div>
                    
                    {retentions.length === 0 ? (
                      <div className="text-center py-4 text-sm text-muted-foreground bg-muted/30 rounded-lg">
                        Sin retenciones
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {retentions.map((ret, idx) => {
                          const amount = parseFloat(paymentForm.amount) || 0
                          const base = ret.baseType === 'total' ? amount : amount
                          const retAmount = base * (ret.rate || 0) / 100
                          
                          return (
                            <div key={idx} className="border rounded-lg p-3 bg-muted/30">
                              <div className="space-y-2">
                                <div className="grid grid-cols-12 gap-2 items-end">
                                  <div className="col-span-5">
                                    <Label className="text-xs mb-1 block">Tipo *</Label>
                                    <Select value={ret.type || ''} onValueChange={(value) => {
                                      const newRetentions = [...retentions]
                                      newRetentions[idx] = { ...ret, type: value }
                                      setRetentions(newRetentions)
                                    }}>
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Tipo">{ret.type ? getRetentionLabel(ret.type) : 'Tipo'}</SelectValue>
                                      </SelectTrigger>
                                      <SelectContent className="max-h-[280px]">
                                        <SelectItem value="vat_retention">Retención IVA</SelectItem>
                                        <SelectItem value="income_tax_retention">Retención Ganancias</SelectItem>
                                        <SelectItem value="suss_retention">Retención SUSS</SelectItem>
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
                                        <SelectItem value="other">Otra Retención</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="col-span-2">
                                    <Label className="text-xs mb-1 block">Alícuota % *</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      max="100"
                                      value={ret.rate}
                                      onChange={(e) => {
                                        const value = parseFloat(e.target.value) || 0
                                        const newRetentions = [...retentions]
                                        newRetentions[idx] = { ...ret, rate: Math.min(Math.max(value, 0), 100) }
                                        setRetentions(newRetentions)
                                      }}
                                      className="h-8 text-xs"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <Label className="text-xs mb-1 block">Base *</Label>
                                    <Select value={ret.baseType || 'net'} onValueChange={(value) => {
                                      const newRetentions = [...retentions]
                                      newRetentions[idx] = { ...ret, baseType: value }
                                      setRetentions(newRetentions)
                                    }}>
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="net">Neto</SelectItem>
                                        <SelectItem value="total">Total</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="col-span-2">
                                    <Label className="text-xs mb-1 block">Monto</Label>
                                    <div className="text-sm font-semibold text-orange-600">${retAmount.toFixed(2)}</div>
                                  </div>
                                  <div className="col-span-1 flex justify-end">
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => setRetentions(retentions.filter((_, i) => i !== idx))}
                                      className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-xs mb-1 block">Descripción *</Label>
                                  <Input
                                    value={ret.name}
                                    onChange={(e) => {
                                      const newRetentions = [...retentions]
                                      newRetentions[idx] = { ...ret, name: e.target.value }
                                      setRetentions(newRetentions)
                                    }}
                                    className="h-8 text-xs"
                                    placeholder="Descripción"
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  
                  {/* Resumen Final */}
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span className="font-semibold">{formatCurrency(parseFloat(paymentForm.amount) || 0)}</span>
                    </div>
                    {retentions.length > 0 && (
                      <div className="flex justify-between text-sm text-orange-600">
                        <span>Retenciones:</span>
                        <span className="font-semibold">-{formatCurrency(retentions.reduce((sum, r) => {
                          const amount = parseFloat(paymentForm.amount) || 0
                          const base = r.baseType === 'total' ? amount : amount
                          return sum + (base * (r.rate || 0) / 100)
                        }, 0))}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-bold">Neto a Pagar:</span>
                      <span className="text-xl font-bold text-green-600">{formatCurrency(parseFloat(paymentForm.amount) - retentions.reduce((sum, r) => {
                        const amount = parseFloat(paymentForm.amount) || 0
                        const base = r.baseType === 'total' ? amount : amount
                        return sum + (base * (r.rate || 0) / 100)
                      }, 0))}</span>
                    </div>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">Facturas Incluidas</h4>
                    <div className="space-y-2">
                      {invoices.filter(inv => selectedInvoices.includes(inv.id)).map((invoice) => {
                        const supplierName = invoice.supplier?.business_name || 
                                           (invoice.supplier?.first_name && invoice.supplier?.last_name 
                                             ? `${invoice.supplier.first_name} ${invoice.supplier.last_name}` 
                                             : null) ||
                                           invoice.issuerCompany?.business_name ||
                                           invoice.issuerCompany?.name ||
                                           'Sin nombre'
                        return (
                          <div key={invoice.id} className="p-3 bg-background rounded-lg border">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium">{supplierName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {invoice.type} {String(invoice.sales_point || 0).padStart(4, '0')}-{String(invoice.voucher_number || 0).padStart(8, '0')}
                                </p>
                              </div>
                              <p className="font-semibold">{formatCurrency(invoice.pending_amount || invoice.total)}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                              <div>Emisión: {new Date(invoice.issue_date).toLocaleDateString('es-AR')}</div>
                              <div>Vencimiento: {new Date(invoice.due_date).toLocaleDateString('es-AR')}</div>
                              <div>Subtotal: {formatCurrency(invoice.subtotal || 0)}</div>
                              <div>IVA: {formatCurrency(invoice.total_taxes || 0)}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  
                  {selectedInvoices.length === 1 && (() => {
                    const invoice = invoices.find(inv => inv.id === selectedInvoices[0])
                    const supplier = invoice?.supplier
                    return (
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3">Datos Bancarios del Proveedor</h4>
                        {supplier?.bank_name || supplier?.bank_cbu || supplier?.bank_account_number ? (
                          <div className="space-y-2 text-sm">
                            {supplier.bank_name && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Banco:</span>
                                <span className="font-medium">{supplier.bank_name}</span>
                              </div>
                            )}
                            {supplier.bank_cbu && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">CBU:</span>
                                <span className="font-mono font-medium">{supplier.bank_cbu}</span>
                              </div>
                            )}
                            {supplier.bank_account_number && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Cuenta:</span>
                                <span className="font-mono font-medium">{supplier.bank_account_number}</span>
                              </div>
                            )}
                            {supplier.bank_account_type && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Tipo:</span>
                                <span className="font-medium">{supplier.bank_account_type === 'checking' ? 'Cuenta Corriente' : 'Caja de Ahorro'}</span>
                              </div>
                            )}
                            {supplier.bank_alias && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Alias:</span>
                                <span className="font-medium">{supplier.bank_alias}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-sm text-muted-foreground">
                            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                            <p>No hay datos bancarios registrados</p>
                            <p className="text-xs mt-1">Complete los datos en Mis Proveedores</p>
                          </div>
                        )}
                      </div>
                    )
                  })()}
                  
                  {selectedInvoices.length > 1 && (
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3">Resumen del Pago</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Facturas:</span>
                          <span className="font-semibold">{selectedInvoices.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Proveedores Únicos:</span>
                          <span className="font-semibold">{new Set(invoices.filter(inv => selectedInvoices.includes(inv.id)).map(inv => inv.supplier_id || inv.issuer_company_id)).size}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Monto Total:</span>
                          <span className="font-bold text-lg">{formatCurrency(parseFloat(paymentForm.amount) || 0)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)} disabled={submitting}>Cancelar</Button>
              <Button onClick={handleSubmitPayment} disabled={submitting}>{submitting ? 'Registrando...' : 'Registrar Pago'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* TXT Generation Dialog */}
        <Dialog open={showTxtDialog} onOpenChange={setShowTxtDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generar Archivo TXT para Homebanking</DialogTitle>
              <DialogDescription>
                Se generará un archivo TXT con las facturas seleccionadas ({selectedInvoices.length})
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTxtDialog(false)}>Cancelar</Button>
              <Button onClick={handleGenerateTxt}>Generar TXT</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
