"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { TrendingUp, TrendingDown, AlertCircle, Calendar, DollarSign, FileText, Download, Plus, Filter, Search, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { formatDateToLocal, parseDateLocal } from "@/lib/utils"
import { accountsPayableService } from "@/services/accounts-payable.service"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ByEntityTab } from "@/components/accounts/ByEntityTab"
import { InvoiceList } from "@/components/accounts/InvoiceList"
import { CollectionsTab } from "@/components/accounts/CollectionsTab"
import { UpcomingTab } from "@/components/accounts/UpcomingTab"
import { BalancesTab } from "@/components/accounts/BalancesTab"
import { InvoiceListSkeleton, DashboardCardsSkeleton } from "@/components/accounts/InvoiceListSkeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { OverdueTab } from "@/components/accounts/OverdueTab"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DatePicker } from "@/components/ui/date-picker"

export default function AccountsPayablePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [dashboard, setDashboard] = useState<any>(null)
  const [allInvoices, setAllInvoices] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [balances, setBalances] = useState<any>(null)
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
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
  const [loadingRetentions, setLoadingRetentions] = useState(false)
  const [generatingTxt, setGeneratingTxt] = useState(false)
  const [filters, setFilters] = useState({
    payment_status: '',
    search: '',
    overdue: false,
    from_date: '',
    to_date: '',
    currency: 'all' as string,
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/log-in')
    } else if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated, authLoading])
  
  useEffect(() => {
    if (isAuthenticated && companyId && !loading) {
      loadInvoices()
    }
  }, [filters.from_date, filters.to_date, isAuthenticated, companyId])
  
  const loadInvoices = async () => {
    try {
      const response = await accountsPayableService.getInvoices(companyId, { page: 1 })
      setAllInvoices(response.data || [])
    } catch (error: any) {
      console.error('Error loading invoices:', error)
      toast.error('Error al cargar facturas')
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      
      const [paymentsData, balancesData] = await Promise.all([
        accountsPayableService.getPayments(companyId),
        accountsPayableService.getBalances(companyId).catch(() => null),
      ])
      
      setPayments(paymentsData.data || [])
      setBalances(balancesData)
      setDashboard({ summary: { upcoming_count: 0, upcoming_amount: 0 } })
      
      await loadInvoices()
    } catch (error: any) {
      console.error('Error loading accounts payable data:', error)
      toast.error(error.response?.data?.error || error.message || 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const handlePayInvoices = (invoiceIds: string[]) => {
    if (invoiceIds.length === 0) return
    
    const selectedInvoiceData = allInvoices.filter(inv => invoiceIds.includes(inv.id))
    const totalAmount = selectedInvoiceData.reduce((sum, inv) => sum + parseFloat(inv.balance_pending ?? inv.available_balance ?? inv.total), 0)
    
    setPaymentForm({
      ...paymentForm,
      invoice_id: invoiceIds.length === 1 ? invoiceIds[0] : '',
      amount: totalAmount.toString(),
    })
    
    setShowPaymentDialog(true)
    setLoadingRetentions(true)
    
    accountsPayableService.getDefaultRetentions(companyId).then(response => {
      setLoadingRetentions(false)
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
    }).catch(() => {
      setLoadingRetentions(false)
      setRetentions([])
    })
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
        const selectedInvoiceData = allInvoices.filter(inv => selectedInvoices.includes(inv.id))
        for (const invoice of selectedInvoiceData) {
          const invoiceBalance = parseFloat(invoice.balance_pending ?? invoice.available_balance ?? invoice.total)
          const retentionsWithAmounts = retentions.map(ret => {
            const base = ret.baseType === 'total' ? invoiceBalance : invoiceBalance
            return { type: ret.type, name: ret.name, rate: ret.rate, base_amount: base, amount: base * ret.rate / 100 }
          })
          
          await accountsPayableService.registerPayment(companyId, {
            invoice_id: invoice.id,
            amount: invoiceBalance,
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
        const invoice = allInvoices.find(inv => inv.id === selectedInvoices[0])
        const invoiceBalance = parseFloat(invoice?.balance_pending ?? invoice?.available_balance ?? invoice?.total ?? paymentForm.amount)
        const retentionsWithAmounts = retentions.map(ret => {
          const base = ret.baseType === 'total' ? invoiceBalance : invoiceBalance
          return { type: ret.type, name: ret.name, rate: ret.rate, base_amount: base, amount: base * ret.rate / 100 }
        })
        
        await accountsPayableService.registerPayment(companyId, {
          ...paymentForm,
          amount: invoiceBalance,
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

  const handleGenerateTxt = async (invoiceIds?: string[]) => {
    const ids = invoiceIds || selectedInvoices
    if (ids.length === 0) {
      toast.error('Selecciona al menos una factura')
      return
    }
    
    // Validar que todas las facturas tengan datos bancarios
    const selectedInvoiceData = allInvoices.filter(inv => ids.includes(inv.id))
    const withoutBankData = selectedInvoiceData.filter(inv => !inv.has_bank_data)
    
    if (withoutBankData.length > 0) {
      toast.error(`${withoutBankData.length} factura(s) sin datos bancarios del proveedor`, {
        description: 'Complete los datos bancarios en Mis Proveedores'
      })
      return
    }
    
    setGeneratingTxt(true)
    try {
      const blob = await accountsPayableService.generatePaymentTxt(companyId, ids)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pagos_${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Archivo TXT generado')
      setSelectedInvoices([])
    } catch (error) {
      toast.error('Error al generar archivo TXT')
    } finally {
      setGeneratingTxt(false)
    }
  }

  const formatCurrency = (amount: number, currency?: string) => {
    const curr = currency || 'ARS'
    const symbols: Record<string, string> = { 'ARS': '$', 'USD': 'USD $', 'EUR': 'EUR €' }
    return `${symbols[curr] || '$'} ${amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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

  const filteredInvoices = useMemo(() => {
    return allInvoices.filter(inv => {
      if (inv.status === 'cancelled') return false
      const companyStatus = inv.company_statuses?.[companyId]
      if (companyStatus === 'paid') return false
      if (filters.currency !== 'all' && inv.currency !== filters.currency) return false
      if (filters.from_date || filters.to_date) {
        const issueDate = new Date(inv.issue_date)
        if (filters.from_date && issueDate < new Date(filters.from_date)) return false
        if (filters.to_date && issueDate > new Date(filters.to_date)) return false
      }
      if (filters.search) {
        const search = filters.search.toLowerCase()
        const searchNum = filters.search.replace(/\D/g, '')
        const invNum = `${inv.type || 'FC'} ${String(inv.sales_point || 0).padStart(4, '0')}-${String(inv.voucher_number || 0).padStart(8, '0')}`.toLowerCase()
        const name = (inv.supplier?.business_name || inv.supplier?.first_name || inv.issuerCompany?.business_name || inv.issuerCompany?.name || '').toLowerCase()
        const cuit = (inv.supplier?.document_number || inv.supplier?.national_id || inv.issuerCompany?.national_id || '').toString().replace(/\D/g, '')
        if (!invNum.includes(search) && !name.includes(search) && !cuit.includes(searchNum)) return false
      }
      return true
    })
  }, [allInvoices, filters.from_date, filters.to_date, filters.search, filters.currency])

  const summary = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const byCurrency = { ARS: { pending: 0, paid: 0, paid_count: 0, overdue: 0, overdue_count: 0 }, USD: { pending: 0, paid: 0, paid_count: 0, overdue: 0, overdue_count: 0 }, EUR: { pending: 0, paid: 0, paid_count: 0, overdue: 0, overdue_count: 0 } }
    
    allInvoices.filter(inv => inv.status !== 'cancelled').forEach(inv => {
      const curr = inv.currency || 'ARS'
      const amount = parseFloat(inv.pending_amount) || 0
      if (curr in byCurrency) {
        byCurrency[curr as keyof typeof byCurrency].pending += amount
        const dueDate = new Date(inv.due_date)
        dueDate.setHours(0, 0, 0, 0)
        if (dueDate < today && amount > 0) {
          byCurrency[curr as keyof typeof byCurrency].overdue += amount
          byCurrency[curr as keyof typeof byCurrency].overdue_count++
        }
      }
    })
    
    payments.forEach(payment => {
      const curr = payment.invoice?.currency || 'ARS'
      if (curr in byCurrency) {
        byCurrency[curr as keyof typeof byCurrency].paid += parseFloat(payment.amount) || 0
        byCurrency[curr as keyof typeof byCurrency].paid_count++
      }
    })
    
    return { byCurrency, overdue_count: byCurrency.ARS.overdue_count + byCurrency.USD.overdue_count + byCurrency.EUR.overdue_count, paid_count: byCurrency.ARS.paid_count + byCurrency.USD.paid_count + byCurrency.EUR.paid_count }
  }, [allInvoices, payments])

  const getInvoiceStatusBadges = (invoice: any) => {
    const badges = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(invoice.due_date)
    dueDate.setHours(0, 0, 0, 0)

    // Estado de la compañía actual sobre la factura
    const companyStatus = invoice.company_statuses?.[companyId]
    const total = parseFloat(invoice.total) || 0
    const pending = parseFloat(invoice.pending_amount) || 0

    // Vencimiento: solo marcar si no está pagada para esta compañía
    const isOverdue = dueDate < today && companyStatus !== 'paid'

    if (isOverdue) {
      badges.push(<Badge key="overdue" className="bg-red-500 text-white font-semibold">Vencida</Badge>)
    }

    // Estado de pago para la compañía actual
    if (companyStatus === 'paid') {
      badges.push(<Badge key="payment" className="bg-green-100 text-green-800">Pagada</Badge>)
    } else if (pending > 0 && pending < total) {
      badges.push(<Badge key="payment" className="bg-yellow-100 text-yellow-800">Pago Parcial</Badge>)
    } else {
      badges.push(<Badge key="payment" className="bg-gray-100 text-gray-800">Pendiente Pago</Badge>)
    }

    return <div className="flex gap-1 flex-wrap">{badges}</div>
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-24 bg-muted rounded animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-8 w-64 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-96 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-48 bg-muted rounded animate-pulse"></div>
              <div className="h-10 w-40 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
          <DashboardCardsSkeleton />
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <div className="h-10 w-40 bg-muted rounded animate-pulse"></div>
                <div className="h-10 w-40 bg-muted rounded animate-pulse"></div>
                <div className="h-10 flex-1 bg-muted rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="h-6 w-48 bg-muted rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <InvoiceListSkeleton count={5} />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton href={`/company/${companyId}`} />
            <div>
              <h1 className="text-3xl font-bold">Cuentas por Pagar</h1>
              <p className="text-muted-foreground">Gestión de facturas de proveedores y pagos</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleGenerateTxt()}
              disabled={generatingTxt || selectedInvoices.length === 0 || allInvoices.filter(inv => selectedInvoices.includes(inv.id)).some(inv => {
                // Check has_bank_data flag or verify manually
                if (inv.has_bank_data) return false
                const bankData = inv.supplier || inv.issuerCompany
                const hasBankData = bankData?.bank_name || bankData?.bank_cbu || bankData?.bank_account_number
                return !hasBankData
              })}
            >
              <Download className="h-4 w-4 mr-2" />
              {generatingTxt ? 'Generando...' : `Generar TXT Homebanking ${selectedInvoices.length > 0 ? `(${selectedInvoices.length})` : ''}`}
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
        {dashboard && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendiente de Pago</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">$ {summary.byCurrency.ARS.pending.toLocaleString('es-AR', {minimumFractionDigits: 2})}</div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>USD $ {summary.byCurrency.USD.pending.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
                    <span>EUR € {summary.byCurrency.EUR.pending.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Facturas Vencidas</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600 mb-2">{summary.overdue_count}</div>
                  <div className="text-sm font-semibold mb-1">$ {summary.byCurrency.ARS.overdue.toLocaleString('es-AR', {minimumFractionDigits: 2})}</div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>USD $ {summary.byCurrency.USD.overdue.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
                    <span>EUR € {summary.byCurrency.EUR.overdue.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
                  </div>
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
                    {formatCurrency(dashboard.summary.upcoming_amount, 'ARS')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pagado</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 mb-2">$ {summary.byCurrency.ARS.paid.toLocaleString('es-AR', {minimumFractionDigits: 2})}</div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>USD $ {summary.byCurrency.USD.paid.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
                    <span>EUR € {summary.byCurrency.EUR.paid.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{summary.paid_count} pago{summary.paid_count !== 1 ? 's' : ''}</p>
                </CardContent>
              </Card>
            </div>
        )}

        {/* Filtros Globales */}
        <div className="flex gap-2">
          <Select value={filters.currency} onValueChange={(value) => setFilters({...filters, currency: value})}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="ARS">ARS $</SelectItem>
              <SelectItem value="USD">USD $</SelectItem>
              <SelectItem value="EUR">EUR €</SelectItem>
            </SelectContent>
          </Select>
          <div className="w-40">
            <DatePicker
              date={filters.from_date ? parseDateLocal(filters.from_date) || undefined : undefined}
              onSelect={(date) => setFilters({...filters, from_date: date ? formatDateToLocal(date) : ''})}
              placeholder="Desde"
            />
          </div>
          <div className="w-40">
            <DatePicker
              date={filters.to_date ? parseDateLocal(filters.to_date) || undefined : undefined}
              onSelect={(date) => setFilters({...filters, to_date: date ? formatDateToLocal(date) : ''})}
              placeholder="Hasta"
            />
          </div>
          <Input
            placeholder="Buscar por número de factura o CUIT..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            className="flex-1"
          />
          {(filters.from_date || filters.to_date || filters.search || filters.currency !== 'ARS') && (
            <Button variant="outline" onClick={() => setFilters({...filters, from_date: '', to_date: '', search: '', currency: 'ARS'})}>
              Limpiar
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="invoices">Facturas Pendientes</TabsTrigger>
            <TabsTrigger value="upcoming">Próximas a Vencer</TabsTrigger>
            <TabsTrigger value="overdue">Vencidas</TabsTrigger>
            <TabsTrigger value="payments">Pagos Realizados</TabsTrigger>
            <TabsTrigger value="suppliers">Por Proveedor</TabsTrigger>
            <TabsTrigger value="balances">Saldos</TabsTrigger>
          </TabsList>

          {/* Saldos */}
          <TabsContent value="balances" className="space-y-4">
            {balances ? (
              <BalancesTab
                creditNotes={balances.credit_notes || []}
                debitNotes={balances.debit_notes || []}
                summary={balances.summary}
                formatCurrency={formatCurrency}
                onView={(id) => router.push(`/company/${companyId}/invoices/${id}`)}
                type="payable"
                filters={filters}
              />
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Cargando saldos...</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Facturas por Pagar */}
          <TabsContent value="invoices" className="space-y-4">
            <InvoiceList
              invoices={filteredInvoices}
              selectedInvoices={selectedInvoices}
              onSelectionChange={setSelectedInvoices}
              onAction={(id) => {
                setSelectedInvoices([id])
                handlePayInvoices([id])
              }}
              onView={(id) => router.push(`/company/${companyId}/invoices/${id}`)}
              formatCurrency={formatCurrency}
              actionLabel="Pagar"
              type="payable"
              loading={loading}
            />
          </TabsContent>

          {/* Próximas a Vencer */}
          <TabsContent value="upcoming" className="space-y-4">
            <UpcomingTab
              invoices={filteredInvoices}
              formatCurrency={formatCurrency}
              onAction={(id) => {
                setSelectedInvoices([id])
                handlePayInvoices([id])
              }}
              type="payable"
              selectedInvoices={selectedInvoices}
              onSelectionChange={setSelectedInvoices}
            />
          </TabsContent>

          {/* Pagos Realizados */}
          <TabsContent value="payments" className="space-y-4">
            <CollectionsTab
              collections={payments}
              formatCurrency={(amount, currency) => formatCurrency(amount, currency)}
              filters={filters}
              type="payable"
            />
          </TabsContent>

          {/* Facturas Vencidas */}
          <TabsContent value="overdue" className="space-y-4">
            <OverdueTab
              invoices={filteredInvoices}
              formatCurrency={formatCurrency}
              onAction={(id) => {
                setSelectedInvoices([id])
                handlePayInvoices([id])
              }}
              type="payable"
              selectedInvoices={selectedInvoices}
              onSelectionChange={setSelectedInvoices}
            />
          </TabsContent>

          {/* Por Proveedor */}
          <TabsContent value="suppliers" className="space-y-4">
            <ByEntityTab
              invoices={filteredInvoices}
              formatCurrency={formatCurrency}
              onViewInvoices={(cuit) => {
                setActiveTab('invoices')
                setFilters({...filters, search: cuit})
              }}
              onViewInvoice={(id) => router.push(`/company/${companyId}/invoices/${id}`)}
              onActionInvoice={(id) => {
                setSelectedInvoices([id])
                handlePayInvoices([id])
              }}
              onGenerateTxt={handleGenerateTxt}
              type="payable"
            />
          </TabsContent>
        </Tabs>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={(open) => {
          setShowPaymentDialog(open)
          if (!open) {
            setLoadingRetentions(false)
            setPaymentDialogTab('payment')
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Pago de Factura{selectedInvoices.length > 1 ? 's' : ''}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
            
            {loadingRetentions ? (
              <div className="space-y-4 py-6">
                <div className="bg-gray-100 p-4 rounded-lg space-y-2">
                  <div className="h-4 w-48 bg-gray-300 rounded animate-pulse"></div>
                  <div className="h-6 w-32 bg-gray-300 rounded animate-pulse"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ) : (
            <Tabs value={paymentDialogTab} onValueChange={setPaymentDialogTab}>
              <TabsList className="grid w-full grid-cols-2 mt-4">
                <TabsTrigger value="payment">Pago</TabsTrigger>
                <TabsTrigger value="details">Detalles</TabsTrigger>
              </TabsList>

              <TabsContent value="payment" className="space-y-4 mt-2">
                <form className="space-y-4">
                  {/* Resumen de Facturas */}
                  <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                    {selectedInvoices.length === 1 ? (
                      (() => {
                        const invoice = allInvoices.find(inv => inv.id === selectedInvoices[0])
                        const supplierName = invoice?.supplier?.business_name || 
                                           (invoice?.supplier?.first_name && invoice?.supplier?.last_name 
                                             ? `${invoice.supplier.first_name} ${invoice.supplier.last_name}` 
                                             : null) ||
                                           invoice?.issuerCompany?.business_name ||
                                           invoice?.issuerCompany?.name ||
                                           'Sin nombre'
                        const hasNotes = (invoice?.credit_notes_applied?.length > 0 || invoice?.debit_notes_applied?.length > 0)
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
                              <span>Total Original:</span>
                              <span className="font-semibold">{formatCurrency(invoice?.total || 0, invoice?.currency)}</span>
                            </div>
                            {hasNotes && (
                              <>
                                {invoice?.credit_notes_applied?.map((nc: any) => (
                                  <div key={nc.id} className="flex justify-between text-sm text-red-600">
                                    <span>NC {String(nc.sales_point || 0).padStart(4, '0')}-{String(nc.voucher_number || 0).padStart(8, '0')}:</span>
                                    <span>-{formatCurrency(nc.total || 0, invoice?.currency)}</span>
                                  </div>
                                ))}
                                {invoice?.debit_notes_applied?.map((nd: any) => (
                                  <div key={nd.id} className="flex justify-between text-sm text-orange-600">
                                    <span>ND {String(nd.sales_point || 0).padStart(4, '0')}-{String(nd.voucher_number || 0).padStart(8, '0')}:</span>
                                    <span>+{formatCurrency(nd.total || 0, invoice?.currency)}</span>
                                  </div>
                                ))}
                                <Separator />
                              </>
                            )}
                            <div className="flex justify-between text-sm font-bold">
                              <span>Saldo a Pagar:</span>
                              <span>{formatCurrency(invoice?.pending_amount || invoice?.total || 0, invoice?.currency)}</span>
                            </div>
                          </>
                        )
                      })()
                    ) : (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Facturas Seleccionadas ({selectedInvoices.length})</p>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {allInvoices.filter(inv => selectedInvoices.includes(inv.id)).map((invoice) => (
                              <div key={invoice.id} className="flex justify-between text-xs p-2 bg-background rounded">
                                <span>{invoice.type} {String(invoice.sales_point || 0).padStart(4, '0')}-{String(invoice.voucher_number || 0).padStart(8, '0')}</span>
                                <span className="font-medium">{formatCurrency(invoice.pending_amount || invoice.total, invoice.currency)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-sm">
                          <span>Total a Pagar:</span>
                          <span className="font-semibold">{(() => {
                            const invoices = allInvoices.filter(inv => selectedInvoices.includes(inv.id))
                            const currency = invoices[0]?.currency || 'ARS'
                            return formatCurrency(parseFloat(paymentForm.amount) || 0, currency)
                          })()}</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha de Pago *</Label>
                      <DatePicker
                        date={paymentForm.payment_date ? parseDateLocal(paymentForm.payment_date) || undefined : undefined}
                        onSelect={(date) => setPaymentForm({...paymentForm, payment_date: date ? formatDateToLocal(date) : ''})}
                        placeholder="Seleccionar fecha"
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
                  
                  <Separator />
                  
                  {/* Retenciones */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Retenciones</Label>
                      <Button 
                        type="button" 
                        onClick={() => setRetentions([...retentions, { type: 'other', name: '', rate: 0, baseType: 'net' }])} 
                        size="sm" 
                        variant="outline"
                        disabled={loadingRetentions}
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
                            <div key={idx} className="rounded-lg p-3 bg-muted/30 border border-gray-200">
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
                      <span className="font-semibold">{(() => {
                        const invoices = allInvoices.filter(inv => selectedInvoices.includes(inv.id))
                        const currency = invoices[0]?.currency || 'ARS'
                        return formatCurrency(parseFloat(paymentForm.amount) || 0, currency)
                      })()}</span>
                    </div>
                    {retentions.length > 0 && (
                      <div className="flex justify-between text-sm text-orange-600">
                        <span>Retenciones:</span>
                        <span className="font-semibold">-{(() => {
                          const invoices = allInvoices.filter(inv => selectedInvoices.includes(inv.id))
                          const currency = invoices[0]?.currency || 'ARS'
                          return formatCurrency(retentions.reduce((sum, r) => {
                            const amount = parseFloat(paymentForm.amount) || 0
                            const base = r.baseType === 'total' ? amount : amount
                            return sum + (base * (r.rate || 0) / 100)
                          }, 0), currency)
                        })()}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-bold">Neto a Pagar:</span>
                      <span className="text-xl font-bold text-green-600">{(() => {
                        const invoices = allInvoices.filter(inv => selectedInvoices.includes(inv.id))
                        const currency = invoices[0]?.currency || 'ARS'
                        return formatCurrency(parseFloat(paymentForm.amount) - retentions.reduce((sum, r) => {
                          const amount = parseFloat(paymentForm.amount) || 0
                          const base = r.baseType === 'total' ? amount : amount
                          return sum + (base * (r.rate || 0) / 100)
                        }, 0), currency)
                      })()}</span>
                    </div>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="details" className="space-y-4 mt-2">
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">Facturas Incluidas</h4>
                    <div className="space-y-2">
                      {allInvoices.filter(inv => selectedInvoices.includes(inv.id)).map((invoice) => {
                        const supplierName = invoice.supplier?.business_name || 
                                           (invoice.supplier?.first_name && invoice.supplier?.last_name 
                                             ? `${invoice.supplier.first_name} ${invoice.supplier.last_name}` 
                                             : null) ||
                                           invoice.issuerCompany?.business_name ||
                                           invoice.issuerCompany?.name ||
                                           'Sin nombre'
                        return (
                          <div key={invoice.id} className="p-3 bg-background rounded-lg border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium">{supplierName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {invoice.type} {String(invoice.sales_point || 0).padStart(4, '0')}-{String(invoice.voucher_number || 0).padStart(8, '0')}
                                </p>
                              </div>
                              <p className="font-semibold">{formatCurrency(invoice.pending_amount || invoice.total, invoice.currency)}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                              <div>Emisión: {parseDateLocal(invoice.issue_date)?.toLocaleDateString('es-AR')}</div>
                              <div>Vencimiento: {parseDateLocal(invoice.due_date)?.toLocaleDateString('es-AR')}</div>
                              <div>Subtotal: {formatCurrency(invoice.subtotal || 0, invoice.currency)}</div>
                              <div>IVA: {formatCurrency(invoice.total_taxes || 0, invoice.currency)}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  
                  {selectedInvoices.length === 1 && (() => {
                    const invoice = allInvoices.find(inv => inv.id === selectedInvoices[0])
                    // Try supplier first, then issuerCompany (for connected companies)
                    const bankData = invoice?.supplier || invoice?.issuerCompany
                    const hasBankData = bankData?.bank_name || bankData?.bank_cbu || bankData?.bank_account_number
                    
                    return (
                      <div className="bg-muted/50 p-4 rounded-lg border border-gray-200">
                        <h4 className="font-semibold mb-3">Datos Bancarios del Proveedor</h4>
                        {hasBankData ? (
                          <div className="space-y-2 text-sm">
                            {bankData.bank_name && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Banco:</span>
                                <span className="font-medium">{bankData.bank_name}</span>
                              </div>
                            )}
                            {bankData.bank_cbu && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">CBU:</span>
                                <span className="font-mono font-medium">{bankData.bank_cbu}</span>
                              </div>
                            )}
                            {bankData.bank_account_number && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Cuenta:</span>
                                <span className="font-mono font-medium">{bankData.bank_account_number}</span>
                              </div>
                            )}
                            {bankData.bank_account_type && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Tipo:</span>
                                <span className="font-medium">
                                  {bankData.bank_account_type === 'checking' || bankData.bank_account_type === 'CC' 
                                    ? 'Cuenta Corriente' 
                                    : bankData.bank_account_type === 'CA' 
                                    ? 'Caja de Ahorro'
                                    : bankData.bank_account_type}
                                </span>
                              </div>
                            )}
                            {bankData.bank_alias && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Alias:</span>
                                <span className="font-medium">{bankData.bank_alias}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-sm text-muted-foreground">
                            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                            <p>No hay datos bancarios registrados</p>
                            <p className="text-xs mt-1">
                              {invoice?.supplier 
                                ? 'Complete los datos en Mis Proveedores'
                                : invoice?.issuerCompany
                                ? 'La empresa conectada no tiene datos bancarios configurados'
                                : 'Complete los datos bancarios del proveedor'}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })()}
                  
                  {selectedInvoices.length > 1 && (
                    <div className="bg-muted/50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-semibold mb-3">Resumen del Pago</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Facturas:</span>
                          <span className="font-semibold">{selectedInvoices.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Proveedores Únicos:</span>
                          <span className="font-semibold">{new Set(allInvoices.filter(inv => selectedInvoices.includes(inv.id)).map(inv => inv.supplier_id || inv.issuer_company_id)).size}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Monto Total:</span>
                          <span className="font-bold text-lg">{(() => {
                            const invoices = allInvoices.filter(inv => selectedInvoices.includes(inv.id))
                            const currency = invoices[0]?.currency || 'ARS'
                            return formatCurrency(parseFloat(paymentForm.amount) || 0, currency)
                          })()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            )
            }
            </ScrollArea>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)} disabled={submitting || loadingRetentions}>Cancelar</Button>
              <Button onClick={handleSubmitPayment} disabled={submitting || loadingRetentions}>{submitting ? 'Registrando...' : 'Registrar Pago'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


      </div>
    </div>
  )
}
