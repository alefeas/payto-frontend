"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, TrendingUp, AlertCircle, Calendar, DollarSign, Plus, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { invoiceService } from "@/services/invoice.service"
import collectionService from "@/services/collection.service"

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
      const response = await invoiceService.getInvoices(companyId)
      const allInvoices = response.data || response
      const filtered = Array.isArray(allInvoices) ? allInvoices.filter((inv: any) => {
        if (inv.issuer_company_id !== companyId) return false
        if (inv.status !== 'issued' && inv.status !== 'approved') return false
        
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
        
        await collectionService.createCollection(companyId, {
          invoice_id: invoiceId,
          amount: invoice.total,
          collection_date: collectionForm.collection_date,
          collection_method: collectionForm.collection_method as 'transfer' | 'check' | 'cash' | 'card',
          reference_number: collectionForm.reference_number,
          notes: collectionForm.notes,
          status: 'confirmed'
        })
      }
      
      toast.success(`${selectedInvoices.length} cobro(s) registrado(s) exitosamente`)
      setShowCollectionDialog(false)
      setSelectedInvoices([])
      // Recargar solo los datos necesarios sin recargar la página
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

  const getInvoiceStatusBadges = (invoice: any) => {
    const badges = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(invoice.due_date)
    dueDate.setHours(0, 0, 0, 0)
    const isOverdue = dueDate < today
    
    if (isOverdue) {
      badges.push(<Badge key="overdue" className="bg-red-500 text-white font-semibold">Vencida</Badge>)
    }
    
    badges.push(<Badge key="status" className="bg-gray-100 text-gray-800">Pendiente Cobro</Badge>)
    
    return <div className="flex gap-1 flex-wrap">{badges}</div>
  }

  if (authLoading || loading) return null
  if (!isAuthenticated) return null

  const summary = getFilteredSummary()

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/company/${companyId}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Cuentas por Cobrar</h1>
              <p className="text-muted-foreground">Gestión de facturas emitidas y cobros</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                if (selectedInvoices.length > 0) {
                  handleCollectInvoices(selectedInvoices)
                }
              }}
              disabled={selectedInvoices.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Registrar Cobro {selectedInvoices.length > 0 && `(${selectedInvoices.length})`}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendiente de Cobro</CardTitle>
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
              <CardTitle className="text-sm font-medium">Facturas por Cobrar</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getFilteredInvoices().length}</div>
              <p className="text-xs text-muted-foreground">Facturas emitidas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cobrado</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.total_collected)}</div>
              <p className="text-xs text-muted-foreground">
                {filters.from_date || filters.to_date ? 'Del periodo filtrado' : 'Total histórico'}
              </p>
            </CardContent>
          </Card>
        </div>

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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="invoices">Facturas Pendientes</TabsTrigger>
            <TabsTrigger value="upcoming">Próximos Vencimientos</TabsTrigger>
            <TabsTrigger value="overdue">Vencidas</TabsTrigger>
            <TabsTrigger value="collections">Cobros Realizados</TabsTrigger>
            <TabsTrigger value="clients">Por Cliente</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Facturas Pendientes de Cobro</CardTitle>
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
                      <p>No hay facturas pendientes de cobro</p>
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
                          <div className="font-medium">{invoice.client?.business_name || invoice.client?.first_name + ' ' + invoice.client?.last_name || invoice.receiverCompany?.business_name || 'Cliente'}</div>
                          <div className="text-sm text-muted-foreground">
                            {invoice.type || 'FC'} {String(invoice.sales_point || 0).padStart(4, '0')}-{String(invoice.voucher_number || 0).padStart(8, '0')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(invoice.total)}</div>
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
                          <Button size="sm" onClick={(e) => {
                            e.stopPropagation()
                            setSelectedInvoices([invoice.id])
                            handleCollectInvoices([invoice.id])
                          }}>
                            Cobrar
                          </Button>
                        </div>
                      </div>
                    </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-yellow-600">Próximos Vencimientos (30 días)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {getFilteredInvoices().filter(inv => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const dueDate = new Date(inv.due_date)
                    dueDate.setHours(0, 0, 0, 0)
                    const thirtyDaysFromNow = new Date(today)
                    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
                    return dueDate >= today && dueDate <= thirtyDaysFromNow
                  }).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No hay facturas próximas a vencer</p>
                    </div>
                  ) : (
                    getFilteredInvoices().filter(inv => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      const dueDate = new Date(inv.due_date)
                      dueDate.setHours(0, 0, 0, 0)
                      const thirtyDaysFromNow = new Date(today)
                      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
                      return dueDate >= today && dueDate <= thirtyDaysFromNow
                    }).map((invoice) => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      const dueDate = new Date(invoice.due_date)
                      dueDate.setHours(0, 0, 0, 0)
                      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                      
                      return (
                        <div key={invoice.id} className="flex items-center justify-between p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                          <div>
                            <div className="font-medium">{invoice.client?.business_name || invoice.client?.first_name + ' ' + invoice.client?.last_name || invoice.receiverCompany?.business_name || 'Cliente'}</div>
                            <div className="text-sm text-muted-foreground">
                              {invoice.type} {String(invoice.sales_point || 0).padStart(4, '0')}-{String(invoice.voucher_number || 0).padStart(8, '0')} • Vence en {daysUntilDue} día{daysUntilDue !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-yellow-600">{formatCurrency(invoice.total)}</div>
                            <Button size="sm" variant="outline" onClick={() => {
                              setSelectedInvoices([invoice.id])
                              handleCollectInvoices([invoice.id])
                            }}>
                              Cobrar
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

          <TabsContent value="overdue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Facturas Vencidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {getFilteredInvoices().filter(inv => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const dueDate = new Date(inv.due_date)
                    dueDate.setHours(0, 0, 0, 0)
                    return dueDate < today
                  }).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No hay facturas vencidas</p>
                    </div>
                  ) : (
                    getFilteredInvoices().filter(inv => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      const dueDate = new Date(inv.due_date)
                      dueDate.setHours(0, 0, 0, 0)
                      return dueDate < today
                    }).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                      <div>
                        <div className="font-medium">{invoice.client?.business_name || invoice.client?.first_name + ' ' + invoice.client?.last_name || invoice.receiverCompany?.business_name || 'Cliente'}</div>
                        <div className="text-sm text-muted-foreground">
                          {invoice.type} {String(invoice.sales_point || 0).padStart(4, '0')}-{String(invoice.voucher_number || 0).padStart(8, '0')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-red-600">{formatCurrency(invoice.total)}</div>
                        <Button size="sm" variant="destructive" onClick={() => {
                          setSelectedInvoices([invoice.id])
                          handleCollectInvoices([invoice.id])
                        }}>
                          Cobrar Urgente
                        </Button>
                      </div>
                    </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Cobros</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {collections.length} cobro{collections.length !== 1 ? 's' : ''} registrado{collections.length !== 1 ? 's' : ''}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {collections.length === 0 ? (
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
                    <div key={collection.id} className="p-4 border rounded-lg bg-green-50/50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-lg">{collection.invoice?.client?.business_name || collection.invoice?.client?.first_name + ' ' + collection.invoice?.client?.last_name || collection.invoice?.receiverCompany?.business_name || 'Cliente'}</div>
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
          </TabsContent>

          <TabsContent value="clients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resumen por Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(() => {
                    const byClient = getFilteredInvoices().reduce((acc: any, inv) => {
                      const clientId = inv.client_id || inv.receiver_company_id || 'unknown'
                      const clientName = inv.client?.business_name || inv.client?.first_name + ' ' + inv.client?.last_name || inv.receiverCompany?.business_name || 'Cliente sin nombre'
                      
                      if (!acc[clientId]) {
                        acc[clientId] = {
                          client_id: clientId,
                          client_name: clientName,
                          invoice_count: 0,
                          total_pending: 0,
                          client_cuit: inv.client?.document_number || inv.receiverCompany?.national_id || ''
                        }
                      }
                      
                      acc[clientId].invoice_count++
                      acc[clientId].total_pending += parseFloat(inv.total) || 0
                      
                      return acc
                    }, {})
                    
                    const clientsArray = Object.values(byClient).sort((a: any, b: any) => b.total_pending - a.total_pending)
                    
                    return clientsArray.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No hay datos por cliente</p>
                      </div>
                    ) : (
                      clientsArray.map((client: any) => (
                        <div key={client.client_id} className="p-4 border border-emerald-200 bg-emerald-50 rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <div className="font-semibold text-gray-900">{client.client_name}</div>
                              </div>
                              {client.client_cuit && (
                                <div className="text-sm text-gray-500 ml-4">{client.client_cuit}</div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500 mb-1">Pendiente</div>
                              <div className="font-bold text-lg text-emerald-600">{formatCurrency(client.total_pending)}</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-emerald-200">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium text-gray-900">{client.invoice_count}</span> factura{client.invoice_count !== 1 ? 's' : ''}
                            </div>
                            <Button 
                              size="sm" 
                              className="bg-emerald-500 hover:bg-emerald-600 text-white"
                              onClick={() => {
                                setActiveTab('invoices')
                                setFilters({...filters, search: client.client_cuit})
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Facturas
                            </Button>
                          </div>
                        </div>
                      ))
                    )
                  })()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
                        <p className="font-medium">{invoice.client?.business_name || invoice.client?.first_name + ' ' + invoice.client?.last_name || invoice.receiverCompany?.business_name || 'Cliente'}</p>
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
      </div>
    </div>
  )
}
