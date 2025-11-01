"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AccountsReceivablePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [invoices, setInvoices] = useState<any[]>([])
  const [collections, setCollections] = useState<any[]>([])
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
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/log-in')
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
      // Cargar todas las páginas de facturas emitidas
      let allInvoices: any[] = []
      let currentPage = 1
      let hasMore = true
      
      while (hasMore) {
        const response = await invoiceService.getInvoices(companyId, currentPage)
        const pageData = response.data || []
        allInvoices = [...allInvoices, ...pageData]
        
        // Si hay más páginas, continuar
        if (response.last_page && currentPage < response.last_page) {
          currentPage++
        } else {
          hasMore = false
        }
      }
      
      const filtered = Array.isArray(allInvoices) ? allInvoices.filter((inv: any) => {
        if (inv.issuer_company_id !== companyId) return false
        if (inv.supplier_id) return false
        const companyStatus = inv.company_statuses?.[companyId]
        if (companyStatus === 'paid' || companyStatus === 'collected') return false
        
        if (filters.from_date || filters.to_date) {
          const issueDate = new Date(inv.issue_date)
          if (filters.from_date && issueDate < new Date(filters.from_date)) return false
          if (filters.to_date && issueDate > new Date(filters.to_date)) return false
        }
        
        if (filters.search) {
          const invoiceNumber = `${inv.type || 'FC'} ${String(inv.sales_point || 0).padStart(4, '0')}-${String(inv.voucher_number || 0).padStart(8, '0')}`
          const clientName = inv.receiver_name || inv.client?.business_name || (inv.client?.first_name && inv.client?.last_name ? `${inv.client.first_name} ${inv.client.last_name}` : null) || inv.receiverCompany?.name || inv.receiverCompany?.business_name || ''
          const clientCuit = inv.client?.document_number || inv.client?.national_id || inv.receiverCompany?.national_id || ''
          const searchLower = filters.search.toLowerCase()
          if (!invoiceNumber.toLowerCase().includes(searchLower) && 
              !clientName.toLowerCase().includes(searchLower) && 
              !clientCuit.includes(filters.search)) return false
        }
        
        return true
      }) : []
      setInvoices(filtered)
    } catch (error: any) {
      console.error('Error loading invoices:', error)
      toast.error('Error al cargar facturas')
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      
      const [collectionsData] = await Promise.all([
        collectionService.getCollections(companyId),
      ])
      
      setCollections(collectionsData.filter((c: any) => c.status === 'confirmed') || [])
      
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
        const invoice = invoices.find(inv => inv.id === invoiceId)
        if (!invoice) continue
        
        // Normalizar método de cobro
        let method = collectionForm.collection_method
        if (method === 'debit_card' || method === 'credit_card') {
          method = 'card'
        }
        
        // Calcular montos de retenciones
        const invoiceAmount = parseFloat(invoice.total)
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
      setLoading(true)
      await loadInvoices()
      const collectionsData = await collectionService.getCollections(companyId)
      setCollections(collectionsData.filter((c: any) => c.status === 'confirmed') || [])
      setLoading(false)
    } catch (error: any) {
      console.error('Collection error:', error)
      toast.error(error.response?.data?.message || 'Error al registrar cobro')
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount)
  }

  const getFilteredInvoices = () => {
    return invoices
  }

  const getFilteredSummary = () => {
    const filtered = getFilteredInvoices()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const totalReceivable = filtered.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0)
    const totalCollected = collections.reduce((sum, col) => sum + (parseFloat(col.amount) || 0), 0)
    
    const overdue = filtered.filter(inv => {
      const dueDate = new Date(inv.due_date)
      dueDate.setHours(0, 0, 0, 0)
      return dueDate < today
    })
    
    return {
      total_receivable: totalReceivable,
      total_collected: totalCollected,
      total_pending: totalReceivable,
      overdue_count: overdue.length,
      overdue_amount: overdue.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-muted rounded animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-8 w-64 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-96 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    )
  }
  if (!isAuthenticated) return null

  const summary = getFilteredSummary()
  const filtered = getFilteredInvoices()

  return (
    <>
    <AccountsLayout
      companyId={companyId}
      title="Cuentas por Cobrar"
      subtitle="Gestión de facturas emitidas y cobros"
      headerActions={
        <Button 
          onClick={() => selectedInvoices.length > 0 && handleCollectInvoices(selectedInvoices)}
          disabled={selectedInvoices.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          Registrar Cobro {selectedInvoices.length > 0 && `(${selectedInvoices.length})`}
        </Button>
      }
      summaryCards={
        <SummaryCards 
          summary={summary} 
          invoiceCount={filtered.length} 
          filters={filters} 
          formatCurrency={formatCurrency}
          type="receivable"
        />
      }
      filters={filters}
      onFiltersChange={setFilters}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabs={[
        {
          value: 'invoices',
          label: 'Facturas Pendientes',
          content: (
            <InvoiceList
              invoices={filtered}
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
          )
        },
        {
          value: 'upcoming',
          label: 'Próximos Vencimientos',
          content: (
            <UpcomingTab
              invoices={filtered}
              formatCurrency={formatCurrency}
              onAction={(id) => {
                setSelectedInvoices([id])
                handleCollectInvoices([id])
              }}
              type="receivable"
            />
          )
        },
        {
          value: 'overdue',
          label: 'Vencidas',
          content: (
            <OverdueTab
              invoices={filtered}
              formatCurrency={formatCurrency}
              onAction={(id) => {
                setSelectedInvoices([id])
                handleCollectInvoices([id])
              }}
              type="receivable"
            />
          )
        },
        {
          value: 'collections',
          label: 'Cobros Realizados',
          content: (
            <Card>
              <CardHeader>
                <CardTitle>Historial de Cobros</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {collections.length} cobro{collections.length !== 1 ? 's' : ''} registrado{collections.length !== 1 ? 's' : ''}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Cargando cobros...</p>
                    </div>
                  ) : collections.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No hay cobros registrados</p>
                      <p className="text-xs mt-2">Los cobros aparecerán aquí una vez que registres pagos de facturas emitidas</p>
                    </div>
                  ) : (
                    collections
                      .filter((collection) => {
                        if (!filters.from_date && !filters.to_date) return true
                        const collectionDate = new Date(collection.collection_date)
                        if (filters.from_date && collectionDate < new Date(filters.from_date)) return false
                        if (filters.to_date && collectionDate > new Date(filters.to_date)) return false
                        return true
                      })
                      .map((collection) => {
                        const methodLabels: Record<string, string> = {
                          transfer: 'Transferencia',
                          check: 'Cheque',
                          cash: 'Efectivo',
                          debit_card: 'Débito',
                          credit_card: 'Crédito',
                          card: 'Tarjeta',
                          other: 'Otro'
                        }
                        return (
                    <div key={collection.id} className="p-4 border rounded-lg bg-green-50/50 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-lg">{collection.invoice?.client?.business_name || (collection.invoice?.client?.first_name && collection.invoice?.client?.last_name ? `${collection.invoice.client.first_name} ${collection.invoice.client.last_name}` : null) || collection.invoice?.receiverCompany?.business_name || collection.invoice?.receiverCompany?.name || 'Cliente'}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Factura: {collection.invoice?.type || 'FC'} {String(collection.invoice?.sales_point || 0).padStart(4, '0')}-{String(collection.invoice?.voucher_number || 0).padStart(8, '0')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-green-600">{formatCurrency(parseFloat(collection.amount) || 0)}</div>
                          <Badge className="bg-green-600 text-white mt-1">Cobrado</Badge>
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground pt-2 border-t">
                        <div>
                          <span className="font-medium">Fecha:</span> {new Date(collection.collection_date).toLocaleDateString('es-AR')}
                        </div>
                        <div>
                          <span className="font-medium">Método:</span> {methodLabels[collection.collection_method] || collection.collection_method}
                        </div>
                        {collection.reference_number && (
                          <div>
                            <span className="font-medium">Ref:</span> {collection.reference_number}
                          </div>
                        )}
                      </div>
                      {collection.notes && (
                        <div className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                          <span className="font-medium">Notas:</span> {collection.notes}
                        </div>
                      )}
                    </div>
                        )
                      })
                  )}
                </div>
              </CardContent>
            </Card>
          )
        },
        {
          value: 'clients',
          label: 'Por Cliente',
          content: (
            <ByEntityTab
              invoices={filtered}
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
          )
        }
      ]}
    />
    
    <Dialog open={showCollectionDialog} onOpenChange={setShowCollectionDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Cobro</DialogTitle>
              <DialogDescription>
                {selectedInvoices.length} factura{selectedInvoices.length !== 1 ? 's' : ''} por {formatCurrency(invoices.filter(inv => selectedInvoices.includes(inv.id)).reduce((sum, inv) => sum + parseFloat(inv.total), 0))}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-muted/30">
                <h4 className="font-medium mb-3 text-sm text-muted-foreground">Facturas seleccionadas</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {invoices.filter(inv => selectedInvoices.includes(inv.id)).map((invoice) => (
                    <div key={invoice.id} className="flex justify-between items-center text-sm p-2 bg-background rounded">
                      <div>
                        <p className="font-medium">{invoice.receiver_name || invoice.client?.business_name || (invoice.client?.first_name && invoice.client?.last_name ? `${invoice.client.first_name} ${invoice.client.last_name}` : null) || invoice.receiverCompany?.name || invoice.receiverCompany?.business_name || 'Cliente'}</p>
                        <p className="text-xs text-muted-foreground">{invoice.type} {String(invoice.sales_point || 0).padStart(4, '0')}-{String(invoice.voucher_number || 0).padStart(8, '0')}</p>
                      </div>
                      <p className="font-semibold">{formatCurrency(invoice.total)}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha de Cobro *</Label>
                  <Input
                    type="date"
                    value={collectionForm.collection_date}
                    onChange={(e) => setCollectionForm({...collectionForm, collection_date: e.target.value})}
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
                      const totalInvoices = invoices.filter(inv => selectedInvoices.includes(inv.id)).reduce((sum, inv) => sum + parseFloat(inv.total), 0)
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
                      <div key={idx} className="border rounded-lg p-3 bg-muted/30">
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
                    <span className="font-semibold">{formatCurrency(invoices.filter(inv => selectedInvoices.includes(inv.id)).reduce((sum, inv) => sum + parseFloat(inv.total), 0))}</span>
                  </div>
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Retenciones:</span>
                    <span className="font-semibold">-{formatCurrency(withholdings.reduce((sum, wh) => {
                      const totalInvoices = invoices.filter(inv => selectedInvoices.includes(inv.id)).reduce((s, inv) => s + parseFloat(inv.total), 0)
                      const base = wh.baseType === 'total' ? totalInvoices : totalInvoices
                      return sum + (base * (wh.rate || 0) / 100)
                    }, 0))}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-bold">Neto a Cobrar:</span>
                    <span className="text-xl font-bold text-green-600">{formatCurrency(invoices.filter(inv => selectedInvoices.includes(inv.id)).reduce((sum, inv) => sum + parseFloat(inv.total), 0) - withholdings.reduce((sum, wh) => {
                      const totalInvoices = invoices.filter(inv => selectedInvoices.includes(inv.id)).reduce((s, inv) => s + parseFloat(inv.total), 0)
                      const base = wh.baseType === 'total' ? totalInvoices : totalInvoices
                      return sum + (base * (wh.rate || 0) / 100)
                    }, 0))}</span>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCollectionDialog(false)} disabled={submitting}>Cancelar</Button>
              <Button onClick={handleSubmitCollection} disabled={submitting}>{submitting ? 'Registrando...' : 'Registrar Cobro'}</Button>
            </DialogFooter>
          </DialogContent>
    </Dialog>
    </>
  )
}
