"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BackButton } from "@/components/ui/back-button"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { formatDateToLocal, parseDateLocal } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { invoiceService } from "@/services/invoice.service"
import collectionService from "@/services/collection.service"
import { AccountsLayout } from "@/components/accounts/AccountsLayout"
import { SummaryCards } from "@/components/accounts/SummaryCards"
import { InvoiceList } from "@/components/accounts/InvoiceList"
import { UpcomingTab } from "@/components/accounts/UpcomingTab"
import { OverdueTab } from "@/components/accounts/OverdueTab"
import { ByEntityTab } from "@/components/accounts/ByEntityTab"
import { CollectionsTab } from "@/components/accounts/CollectionsTab"
import { BalancesTab } from "@/components/accounts/BalancesTab"
import { accountsReceivableService } from "@/services/accounts-receivable.service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DatePicker } from "@/components/ui/date-picker"
import { InvoiceListSkeleton, DashboardCardsSkeleton } from "@/components/accounts/InvoiceListSkeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AccountsReceivablePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [allInvoices, setAllInvoices] = useState<any[]>([])
  const [collections, setCollections] = useState<any[]>([])
  const [balances, setBalances] = useState<any>(null)
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [showCollectionDialog, setShowCollectionDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('invoices')
  const [collectionForm, setCollectionForm] = useState({
    collection_date: new Date().toISOString().split('T')[0],
    collection_method: 'transfer',
    reference_number: '',
    notes: '',
  })
  const [withholdings, setWithholdings] = useState<Array<{type: string, description: string, rate: number, baseType: string}>>([])
  const [filters, setFilters] = useState({
    search: '',
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
      const response = await invoiceService.getInvoices(companyId, 1)
      const data = response.data || []
      
      const filtered = Array.isArray(data) ? data.filter((inv: any) => {
        if (inv.issuer_company_id !== companyId) return false
        if (inv.supplier_id) return false
        const isCreditNote = ['NCA', 'NCB', 'NCC', 'NCM', 'NCE'].includes(inv.type)
        const isDebitNote = ['NDA', 'NDB', 'NDC', 'NDM', 'NDE'].includes(inv.type)
        // Excluir TODAS las ND/NC (asociadas y standalone)
        if (isCreditNote || isDebitNote) return false
        if (inv.status === 'cancelled') return false
        const companyStatus = inv.company_statuses?.[companyId]
        if (companyStatus === 'paid' || companyStatus === 'collected') return false
        return true
      }) : []
      setAllInvoices(filtered)
    } catch (error: any) {
      console.error('Error loading invoices:', error)
      toast.error('Error al cargar facturas')
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      
      const [collectionsData, balancesData] = await Promise.all([
        collectionService.getCollections(companyId),
        accountsReceivableService.getBalances(companyId).catch(() => null),
      ])
      
      setCollections(collectionsData.filter((c: any) => c.status === 'confirmed') || [])
      setBalances(balancesData)
      
      await loadInvoices()
    } catch (error: any) {
      console.error('Error loading data:', error)
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const handleCollectInvoices = async (invoiceIds: string[]) => {
    if (invoiceIds.length === 0) return
    
    setCollectionForm({
      ...collectionForm,
    })
    
    setShowCollectionDialog(true)
  }

  const handleSubmitCollection = async () => {
    // Validar retenciones
    for (const wh of withholdings) {
      if (!wh.type || !wh.description || !wh.description.trim() || wh.rate <= 0) {
        toast.error('Todas las retenciones deben tener tipo, descripción y alícuota mayor a 0')
        return
      }
    }
    
    setSubmitting(true)
    try {
      for (const invoiceId of selectedInvoices) {
        const invoice = allInvoices.find(inv => inv.id === invoiceId)
        if (!invoice) continue
        
        // Normalizar método de cobro
        let method = collectionForm.collection_method
        if (method === 'debit_card' || method === 'credit_card') {
          method = 'card'
        }
        
        // Calcular montos de retenciones usando balance_pending (incluye ND/NC)
        const invoiceAmount = parseFloat(invoice.balance_pending ?? invoice.available_balance ?? invoice.total)
        const withholdingsData: any = {}
        
        withholdings.forEach(wh => {
          const base = wh.baseType === 'total' ? invoiceAmount : invoiceAmount
          const amount = base * wh.rate / 100
          
          if (wh.type === 'iibb' || wh.type.startsWith('gross_income_')) {
            withholdingsData.withholding_iibb = amount
            withholdingsData.withholding_iibb_notes = wh.description
          } else if (wh.type === 'iva' || wh.type === 'vat_retention') {
            withholdingsData.withholding_iva = amount
            withholdingsData.withholding_iva_notes = wh.description
          } else if (wh.type === 'ganancias' || wh.type === 'income_tax_retention') {
            withholdingsData.withholding_ganancias = amount
            withholdingsData.withholding_ganancias_notes = wh.description
          } else if (wh.type === 'suss' || wh.type === 'suss_retention') {
            withholdingsData.withholding_suss = amount
            withholdingsData.withholding_suss_notes = wh.description
          } else if (wh.type === 'other') {
            withholdingsData.withholding_other = amount
            withholdingsData.withholding_other_notes = wh.description
          }
        })
        
        await collectionService.createCollection(companyId, {
          invoice_id: invoiceId,
          amount: invoiceAmount,
          collection_date: collectionForm.collection_date,
          collection_method: method as 'transfer' | 'check' | 'cash' | 'card',
          reference_number: collectionForm.reference_number || undefined,
          notes: collectionForm.notes || undefined,
          ...withholdingsData,
          status: 'confirmed'
        })
      }
      
      toast.success(`${selectedInvoices.length} cobro(s) registrado(s) exitosamente`)
      setShowCollectionDialog(false)
      setSelectedInvoices([])
      setWithholdings([])
      
      // Recargar datos con loader
      await loadInvoices()
      const collectionsData = await collectionService.getCollections(companyId)
      setCollections(collectionsData.filter((c: any) => c.status === 'confirmed') || [])
    } catch (error: any) {
      console.error('Collection error:', error)
      toast.error(error.response?.data?.message || 'Error al registrar cobro')
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (amount: number, currency?: string) => {
    const curr = currency || 'ARS'
    const symbols: Record<string, string> = { 'ARS': '$', 'USD': 'USD $', 'EUR': 'EUR €' }
    return `${symbols[curr] || '$'} ${amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const filteredInvoices = useMemo(() => {
    return allInvoices.filter(inv => {
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
        const name = (inv.receiver_name || inv.client?.business_name || inv.client?.first_name || inv.receiverCompany?.name || inv.receiverCompany?.business_name || '').toLowerCase()
        const cuit = (inv.client?.document_number || inv.client?.national_id || inv.receiverCompany?.national_id || '').toString().replace(/\D/g, '')
        if (!invNum.includes(search) && !name.includes(search) && !cuit.includes(searchNum)) return false
      }
      return true
    })
  }, [allInvoices, filters.from_date, filters.to_date, filters.search, filters.currency])

  const summary = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const in7Days = new Date(today)
    in7Days.setDate(in7Days.getDate() + 7)
    const byCurrency = { ARS: { receivable: 0, collected: 0, collected_count: 0, upcoming: 0, upcoming_count: 0, overdue: 0, overdue_count: 0 }, USD: { receivable: 0, collected: 0, collected_count: 0, upcoming: 0, upcoming_count: 0, overdue: 0, overdue_count: 0 }, EUR: { receivable: 0, collected: 0, collected_count: 0, upcoming: 0, upcoming_count: 0, overdue: 0, overdue_count: 0 } }
    
    allInvoices.forEach(inv => {
      const curr = inv.currency || 'ARS'
      const amount = parseFloat(inv.available_balance ?? inv.balance_pending ?? inv.pending_amount ?? inv.total) || 0
      if (curr in byCurrency) {
        byCurrency[curr as keyof typeof byCurrency].receivable += amount
        const dueDate = new Date(inv.due_date)
        dueDate.setHours(0, 0, 0, 0)
        if (dueDate < today) {
          byCurrency[curr as keyof typeof byCurrency].overdue += amount
          byCurrency[curr as keyof typeof byCurrency].overdue_count++
        } else if (dueDate <= in7Days) {
          byCurrency[curr as keyof typeof byCurrency].upcoming += amount
          byCurrency[curr as keyof typeof byCurrency].upcoming_count++
        }
      }
    })
    
    collections.forEach(col => {
      const curr = col.invoice?.currency || 'ARS'
      if (curr in byCurrency) {
        byCurrency[curr as keyof typeof byCurrency].collected += parseFloat(col.amount) || 0
        byCurrency[curr as keyof typeof byCurrency].collected_count++
      }
    })
    
    return { byCurrency, overdue_count: byCurrency.ARS.overdue_count + byCurrency.USD.overdue_count + byCurrency.EUR.overdue_count, upcoming_count: byCurrency.ARS.upcoming_count + byCurrency.USD.upcoming_count + byCurrency.EUR.upcoming_count, collected_count: byCurrency.ARS.collected_count + byCurrency.USD.collected_count + byCurrency.EUR.collected_count }
  }, [allInvoices, collections])

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
            <div className="h-10 w-40 bg-muted rounded animate-pulse"></div>
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
    <>
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton href={`/company/${companyId}`} />
            <div>
              <h1 className="text-3xl font-bold">Cuentas por Cobrar</h1>
              <p className="text-muted-foreground">Gestión de facturas emitidas y cobros</p>
            </div>
          </div>
          <Button 
            onClick={() => selectedInvoices.length > 0 && handleCollectInvoices(selectedInvoices)}
            disabled={selectedInvoices.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Registrar Cobro {selectedInvoices.length > 0 && `(${selectedInvoices.length})`}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Por Cobrar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">$ {summary.byCurrency.ARS.receivable.toLocaleString('es-AR', {minimumFractionDigits: 2})}</div>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>USD $ {summary.byCurrency.USD.receivable.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
                <span>EUR € {summary.byCurrency.EUR.receivable.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{filteredInvoices.length} factura{filteredInvoices.length !== 1 ? 's' : ''}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
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
              <CardTitle className="text-sm font-medium">Próx. Venc.</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600 mb-2">{summary.upcoming_count}</div>
              <div className="text-sm font-semibold mb-1">$ {summary.byCurrency.ARS.upcoming.toLocaleString('es-AR', {minimumFractionDigits: 2})}</div>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>USD $ {summary.byCurrency.USD.upcoming.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
                <span>EUR € {summary.byCurrency.EUR.upcoming.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cobrado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 mb-2">$ {summary.byCurrency.ARS.collected.toLocaleString('es-AR', {minimumFractionDigits: 2})}</div>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>USD $ {summary.byCurrency.USD.collected.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
                <span>EUR € {summary.byCurrency.EUR.collected.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{summary.collected_count} cobro{summary.collected_count !== 1 ? 's' : ''}</p>
            </CardContent>
          </Card>
        </div>

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
          {(filters.from_date || filters.to_date || filters.search || filters.currency !== 'all') && (
            <Button variant="outline" onClick={() => setFilters({...filters, from_date: '', to_date: '', search: '', currency: 'all'})}>
              Limpiar
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="invoices">Facturas Pendientes</TabsTrigger>
            <TabsTrigger value="upcoming">Próximos Vencimientos</TabsTrigger>
            <TabsTrigger value="overdue">Vencidas</TabsTrigger>
            <TabsTrigger value="collections">Cobros Realizados</TabsTrigger>
            <TabsTrigger value="clients">Por Cliente</TabsTrigger>
            <TabsTrigger value="balances">Saldos</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="space-y-4">
            <InvoiceList
              invoices={filteredInvoices}
              selectedInvoices={selectedInvoices}
              onSelectionChange={setSelectedInvoices}
              onAction={(id) => {
                setSelectedInvoices([id])
                handleCollectInvoices([id])
              }}
              onView={(id) => router.push(`/company/${companyId}/invoices/${id}`)}
              formatCurrency={formatCurrency}
              actionLabel="Cobrar"
              type="receivable"
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            <UpcomingTab
              invoices={filteredInvoices}
              formatCurrency={formatCurrency}
              onAction={(id) => {
                setSelectedInvoices([id])
                handleCollectInvoices([id])
              }}
              type="receivable"
              selectedInvoices={selectedInvoices}
              onSelectionChange={setSelectedInvoices}
            />
          </TabsContent>

          <TabsContent value="overdue" className="space-y-4">
            <OverdueTab
              invoices={filteredInvoices}
              formatCurrency={formatCurrency}
              onAction={(id) => {
                setSelectedInvoices([id])
                handleCollectInvoices([id])
              }}
              type="receivable"
              selectedInvoices={selectedInvoices}
              onSelectionChange={setSelectedInvoices}
            />
          </TabsContent>

          <TabsContent value="collections" className="space-y-4">
            <CollectionsTab
              collections={collections}
              formatCurrency={formatCurrency}
              filters={filters}
              type="receivable"
            />
          </TabsContent>

          <TabsContent value="clients" className="space-y-4">
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
                handleCollectInvoices([id])
              }}
              type="receivable"
            />
          </TabsContent>

          <TabsContent value="balances" className="space-y-4">
            {balances ? (
              <BalancesTab
                creditNotes={balances.credit_notes || []}
                debitNotes={balances.debit_notes || []}
                summary={balances.summary}
                formatCurrency={formatCurrency}
                onView={(id) => router.push(`/company/${companyId}/invoices/${id}`)}
                type="receivable"
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
        </Tabs>
      </div>
    </div>
    
    <Dialog open={showCollectionDialog} onOpenChange={setShowCollectionDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Cobro</DialogTitle>
              <DialogDescription>
                {selectedInvoices.length} factura{selectedInvoices.length !== 1 ? 's' : ''} por {(() => {
                  const invoices = allInvoices.filter(inv => selectedInvoices.includes(inv.id))
                  const currency = invoices[0]?.currency || 'ARS'
                  return formatCurrency(invoices.reduce((sum, inv) => sum + parseFloat(inv.pending_amount ?? inv.balance_pending ?? inv.total), 0), currency)
                })()}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4 py-2">
              <div className="border border-gray-200 rounded-lg p-4 bg-muted/30">
                <h4 className="font-medium mb-3 text-sm text-muted-foreground">Facturas seleccionadas</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {allInvoices.filter(inv => selectedInvoices.includes(inv.id)).map((invoice) => {
                    const hasNotes = (invoice.credit_notes_applied?.length > 0 || invoice.debit_notes_applied?.length > 0)
                    return (
                    <div key={invoice.id} className="p-2 bg-background rounded space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <div>
                          <p className="font-medium">{invoice.receiver_name || invoice.client?.business_name || (invoice.client?.first_name && invoice.client?.last_name ? `${invoice.client.first_name} ${invoice.client.last_name}` : null) || invoice.receiverCompany?.name || invoice.receiverCompany?.business_name || 'Cliente'}</p>
                          <p className="text-xs text-muted-foreground">{invoice.type} {String(invoice.sales_point || 0).padStart(4, '0')}-{String(invoice.voucher_number || 0).padStart(8, '0')}</p>
                        </div>
                        <p className="font-semibold">{formatCurrency(invoice.pending_amount ?? invoice.balance_pending ?? invoice.total, invoice.currency)}</p>
                      </div>
                      {hasNotes && (
                        <div className="text-xs space-y-0.5 pl-2 border-l-2 border-gray-300">
                          {invoice.credit_notes_applied?.map((nc: any) => (
                            <div key={nc.id} className="flex justify-between text-green-600">
                              <span>NC {String(nc.sales_point || 0).padStart(4, '0')}-{String(nc.voucher_number || 0).padStart(8, '0')}</span>
                              <span>-{formatCurrency(nc.total || 0, invoice.currency)}</span>
                            </div>
                          ))}
                          {invoice.debit_notes_applied?.map((nd: any) => (
                            <div key={nd.id} className="flex justify-between text-orange-600">
                              <span>ND {String(nd.sales_point || 0).padStart(4, '0')}-{String(nd.voucher_number || 0).padStart(8, '0')}</span>
                              <span>+{formatCurrency(nd.total || 0, invoice.currency)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )})}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha de Cobro *</Label>
                  <DatePicker
                    date={collectionForm.collection_date ? parseDateLocal(collectionForm.collection_date) || undefined : undefined}
                    onSelect={(date) => setCollectionForm({...collectionForm, collection_date: date ? formatDateToLocal(date) : ''})}
                    placeholder="Seleccionar fecha"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Método de Cobro *</Label>
                  <Select value={collectionForm.collection_method} onValueChange={(value) => setCollectionForm({...collectionForm, collection_method: value})}>
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
                  value={collectionForm.reference_number}
                  onChange={(e) => setCollectionForm({...collectionForm, reference_number: e.target.value})}
                  placeholder="Número de comprobante, transferencia, etc."
                />
              </div>
              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea
                  value={collectionForm.notes}
                  onChange={(e) => setCollectionForm({...collectionForm, notes: e.target.value})}
                  placeholder="Observaciones adicionales (opcional)"
                  rows={3}
                />
              </div>
              
              {/* Retenciones */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Retenciones del Cliente</Label>
                  <Button 
                    type="button" 
                    onClick={() => setWithholdings([...withholdings, { type: 'vat_retention', description: '', rate: 0, baseType: 'net' }])} 
                    size="sm" 
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </div>
                
                {withholdings.length === 0 ? (
                  <div className="text-center py-4 text-sm text-muted-foreground bg-muted/30 rounded-lg">
                    Sin retenciones
                  </div>
                ) : (
                  <div className="space-y-2">
                    {withholdings.map((wh, idx) => {
                      const totalInvoices = allInvoices.filter(inv => selectedInvoices.includes(inv.id)).reduce((sum, inv) => sum + parseFloat(inv.pending_amount ?? inv.balance_pending ?? inv.total), 0)
                      const base = wh.baseType === 'total' ? totalInvoices : totalInvoices
                      const amount = base * (wh.rate || 0) / 100
                      
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
                      
                      return (
                      <div key={idx} className="rounded-lg p-3 bg-muted/30 border border-gray-200">
                        <div className="space-y-2">
                          <div className="grid grid-cols-12 gap-2 items-end">
                            <div className="col-span-5">
                              <Label className="text-xs mb-1 block">Tipo *</Label>
                              <Select value={wh.type || ''} onValueChange={(value) => {
                                const newWithholdings = [...withholdings]
                                newWithholdings[idx] = { ...wh, type: value }
                                setWithholdings(newWithholdings)
                              }}>
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder="Tipo">{wh.type ? getRetentionLabel(wh.type) : 'Tipo'}</SelectValue>
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
                                value={wh.rate}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0
                                  const newWithholdings = [...withholdings]
                                  newWithholdings[idx] = { ...wh, rate: Math.min(Math.max(value, 0), 100) }
                                  setWithholdings(newWithholdings)
                                }}
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="col-span-2">
                              <Label className="text-xs mb-1 block">Base *</Label>
                              <Select value={wh.baseType || 'net'} onValueChange={(value) => {
                                const newWithholdings = [...withholdings]
                                newWithholdings[idx] = { ...wh, baseType: value }
                                setWithholdings(newWithholdings)
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
                              <div className="text-sm font-semibold text-orange-600">${amount.toFixed(2)}</div>
                            </div>
                            <div className="col-span-1 flex justify-end">
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => setWithholdings(withholdings.filter((_, i) => i !== idx))}
                                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs mb-1 block">Descripción *</Label>
                            <Input
                              value={wh.description}
                              onChange={(e) => {
                                const newWithholdings = [...withholdings]
                                newWithholdings[idx] = { ...wh, description: e.target.value }
                                setWithholdings(newWithholdings)
                              }}
                              className="h-8 text-xs"
                              placeholder="Ej: Retención IVA - Certificado 123"
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
              {withholdings.length > 0 && (
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-semibold">{(() => {
                      const invoices = allInvoices.filter(inv => selectedInvoices.includes(inv.id))
                      const currency = invoices[0]?.currency || 'ARS'
                      return formatCurrency(invoices.reduce((sum, inv) => sum + parseFloat(inv.pending_amount ?? inv.balance_pending ?? inv.total), 0), currency)
                    })()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Retenciones:</span>
                    <span className="font-semibold">-{(() => {
                      const invoices = allInvoices.filter(inv => selectedInvoices.includes(inv.id))
                      const currency = invoices[0]?.currency || 'ARS'
                      const totalInvoices = invoices.reduce((s, inv) => s + parseFloat(inv.pending_amount ?? inv.balance_pending ?? inv.total), 0)
                      return formatCurrency(withholdings.reduce((sum, wh) => {
                        const base = wh.baseType === 'total' ? totalInvoices : totalInvoices
                        return sum + (base * (wh.rate || 0) / 100)
                      }, 0), currency)
                    })()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-bold">Neto a Cobrar:</span>
                    <span className="text-xl font-bold text-green-600">{(() => {
                      const invoices = allInvoices.filter(inv => selectedInvoices.includes(inv.id))
                      const currency = invoices[0]?.currency || 'ARS'
                      const totalInvoices = invoices.reduce((s, inv) => s + parseFloat(inv.pending_amount ?? inv.balance_pending ?? inv.total), 0)
                      return formatCurrency(totalInvoices - withholdings.reduce((sum, wh) => {
                        const base = wh.baseType === 'total' ? totalInvoices : totalInvoices
                        return sum + (base * (wh.rate || 0) / 100)
                      }, 0), currency)
                    })()}</span>
                  </div>
                </div>
              )}
            </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCollectionDialog(false)} disabled={submitting}>Cancelar</Button>
              <Button onClick={handleSubmitCollection} disabled={submitting}>{submitting ? 'Registrando...' : 'Registrar Cobro'}</Button>
            </DialogFooter>
          </DialogContent>
    </Dialog>
    </>
  )
}
