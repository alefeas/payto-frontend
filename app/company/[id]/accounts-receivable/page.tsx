"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
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
  const [filters, setFilters] = useState({
    search: '',
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
        // Verificar company_statuses JSON para esta empresa
        const companyStatus = inv.company_statuses?.[companyId]
        if (companyStatus === 'paid') return false
        
        if (filters.from_date || filters.to_date) {
          const issueDate = new Date(inv.issue_date)
          if (filters.from_date && issueDate < new Date(filters.from_date)) return false
          if (filters.to_date && issueDate > new Date(filters.to_date)) return false
        }
        
        if (filters.search) {
          const cuit = inv.client?.document_number || inv.receiverCompany?.national_id || ''
          const searchClean = filters.search.replace(/[^0-9]/g, '')
          const cuitClean = cuit.replace(/[^0-9]/g, '')
          if (!cuitClean.includes(searchClean)) return false
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
        
        await collectionService.createCollection(companyId, {
          invoice_id: invoiceId,
          amount: invoice.total,
          collection_date: collectionForm.collection_date,
          collection_method: method as 'transfer' | 'check' | 'cash' | 'card',
          reference_number: collectionForm.reference_number || undefined,
          notes: collectionForm.notes || undefined,
          status: 'confirmed'
        })
      }
      
      toast.success(`${selectedInvoices.length} cobro(s) registrado(s) exitosamente`)
      setShowCollectionDialog(false)
      setSelectedInvoices([])
      
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

  if (authLoading) return null
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
                    <div key={collection.id} className="p-4 border rounded-lg bg-white/50 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-lg">{collection.invoice?.client?.business_name || (collection.invoice?.client?.first_name && collection.invoice?.client?.last_name ? `${collection.invoice.client.first_name} ${collection.invoice.client.last_name}` : null) || collection.invoice?.receiverCompany?.business_name || collection.invoice?.receiverCompany?.name || 'Cliente'}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Factura: {collection.invoice?.type || 'FC'} {String(collection.invoice?.sales_point || 0).padStart(4, '0')}-{String(collection.invoice?.voucher_number || 0).padStart(8, '0')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-green-600">{formatCurrency(parseFloat(collection.amount) || 0)}</div>
                          <Badge className="bg-white text-white mt-1">Cobrado</Badge>
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
