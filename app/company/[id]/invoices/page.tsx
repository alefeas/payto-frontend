"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { FileText, Download, Filter, Search, CheckSquare, Square, Eye, ExternalLink, Loader2, RefreshCw, Trash2 } from "lucide-react"
import { invoiceService } from "@/services/invoice.service"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { formatDateToLocal, parseDateLocal } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { InvoiceListSkeleton } from "@/components/accounts/InvoiceListSkeleton"

const formatCurrency = (amount: number, currency: string) => {
  const formatted = amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const formats: Record<string, string> = {
    'ARS': `ARS $${formatted}`,
    'USD': `USD $${formatted}`,
    'EUR': `EUR €${formatted}`
  }
  return formats[currency] || `ARS $${formatted}`
}

export default function InvoicesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [invoices, setInvoices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [dateFromFilter, setDateFromFilter] = useState("")
  const [dateToFilter, setDateToFilter] = useState("")
  const [clientFilter, setClientFilter] = useState("all")
  const [allClients, setAllClients] = useState<any[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [showSyncDialog, setShowSyncDialog] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncMode, setSyncMode] = useState<'single' | 'date_range'>('single')
  const [syncForm, setSyncForm] = useState({
    sales_point: 1,
    invoice_type: 'B',
    invoice_number: '',
    date_from: '',
    date_to: ''
  })
  const [syncResults, setSyncResults] = useState<any>(null)
  const [syncProgress, setSyncProgress] = useState<string>('')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/log-in')
    }
  }, [isAuthenticated, authLoading, router])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, typeFilter, dateFromFilter, dateToFilter, clientFilter])

  // Cargar todos los clientes únicos al inicio
  useEffect(() => {
    const loadAllClients = async () => {
      if (!companyId) return
      try {
        const response = await invoiceService.getInvoices(companyId, 1, {})
        const clientsMap = new Map()
        let hasInvoicesWithoutClient = false
        
        for (let page = 1; page <= response.last_page; page++) {
          const pageResponse = await invoiceService.getInvoices(companyId, page, {})
          pageResponse.data.forEach((inv: any) => {
            const clientName = inv.receiver_name || inv.client?.business_name || 
                              inv.receiverCompany?.name ||
                              (inv.client?.first_name && inv.client?.last_name 
                                ? `${inv.client.first_name} ${inv.client.last_name}` 
                                : null)
            
            if (clientName && !clientsMap.has(clientName)) {
              // Prioridad: receiver_company_id > client_id > nombre
              const id = inv.receiver_company_id || inv.client_id || clientName
              clientsMap.set(clientName, {
                id: id,
                name: clientName,
                isCompany: !!inv.receiver_company_id
              })
            } else if (!clientName) {
              hasInvoicesWithoutClient = true
            }
          })
        }
        
        const clients = Array.from(clientsMap.values())
        if (hasInvoicesWithoutClient) {
          clients.push({ id: 'sin_cliente', name: 'Sin cliente', isCompany: false })
        }
        setAllClients(clients)
      } catch (error) {
        console.error('Error loading clients:', error)
      }
    }

    if (isAuthenticated && companyId) {
      loadAllClients()
    }
  }, [isAuthenticated, companyId])

  useEffect(() => {
    const loadInvoices = async () => {
      if (!companyId) return
      
      setIsLoading(true)
      try {
        const filters: any = {}
        
        if (searchTerm) filters.search = searchTerm
        if (statusFilter && statusFilter !== 'all') filters.status = statusFilter
        if (typeFilter && typeFilter !== 'all') filters.type = typeFilter
        if (clientFilter && clientFilter !== 'all') filters.client = clientFilter
        if (dateFromFilter) filters.date_from = dateFromFilter
        if (dateToFilter) filters.date_to = dateToFilter
        
        const response = await invoiceService.getInvoices(companyId, currentPage, filters)
        setInvoices(response.data || [])
        setTotalPages(response.last_page || 1)
        setTotal(response.total || 0)
      } catch (error: any) {
        console.error('Error loading invoices:', error)
        setInvoices([])
        toast.error('Error al cargar comprobantes', {
          description: error.response?.data?.message || 'Intente nuevamente'
        })
      } finally {
        setIsLoading(false)
        setInitialLoad(false)
      }
    }

    if (isAuthenticated && companyId) {
      loadInvoices()
    }
  }, [isAuthenticated, companyId, currentPage, searchTerm, statusFilter, typeFilter, dateFromFilter, dateToFilter, clientFilter])

  const handleSelectInvoice = (invoiceId: string) => {
    setSelectedInvoices(prev => {
      if (prev.includes(invoiceId)) {
        return prev.filter(id => id !== invoiceId)
      } else if (prev.length >= 50) {
        toast.error('Máximo 50 comprobantes seleccionados', {
          description: 'Deselecciona algunos comprobantes para continuar'
        })
        return prev
      } else {
        return [...prev, invoiceId]
      }
    })
  }

  const handleSelectAll = () => {
    const filteredInvoices = getFilteredInvoices()
    if (selectedInvoices.length === filteredInvoices.length) {
      setSelectedInvoices([])
    } else {
      const toSelect = filteredInvoices.slice(0, 50).map(inv => inv.id)
      if (filteredInvoices.length > 50) {
        toast.warning('Solo se seleccionaron los primeros 50 comprobantes')
      }
      setSelectedInvoices(toSelect)
    }
  }

  const getFilteredInvoices = () => {
    return invoices
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setTypeFilter("all")
    setDateFromFilter("")
    setDateToFilter("")
    setClientFilter("all")
  }



  const downloadPDF = async (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId)
    try {
      const blob = await invoiceService.downloadPDF(companyId, invoiceId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoice?.number || 'factura'}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('PDF descargado')
    } catch (error) {
      toast.error('Error al descargar PDF')
    }
  }

  const downloadTXT = async (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId)
    try {
      const blob = await invoiceService.downloadTXT(companyId, invoiceId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoice?.number || 'factura'}.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('TXT descargado')
    } catch (error) {
      toast.error('Error al descargar TXT')
    }
  }

  const getInvoiceStatusBadges = (invoice: any) => {
    const badges = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(invoice.due_date)
    dueDate.setHours(0, 0, 0, 0)
    const isOverdue = dueDate < today && invoice.payment_status !== 'paid' && invoice.status !== 'cancelled'
    // Asegurar comparación robusta (string) para distinguir emisor vs receptor
    const isIssuer = String(invoice.issuer_company_id) === String(companyId)
    const isReceiver = String(invoice.receiver_company_id) === String(companyId)
    const isRejected = invoice.display_status === 'rejected' || invoice.status === 'rejected'
    
    // 1. Vencimiento (solo si no está pagada/cobrada/rechazada)
    if (isOverdue && !isRejected) {
      badges.push(<Badge key="overdue" className="bg-red-600 hover:bg-red-600 text-white border-red-600">Vencida</Badge>)
    }
    
    // 2. Estado principal (cancelled tiene prioridad absoluta)
    const status = invoice.display_status || invoice.status
    
    // Verificar company_statuses JSON primero
    const companyStatus = invoice.company_statuses?.[companyId]
    
    // PRIORIDAD 1: Anulada (tiene prioridad sobre todo)
    if (status === 'cancelled' || invoice.payment_status === 'cancelled') {
      badges.push(<Badge key="status" className="bg-gray-500 text-white">Anulada</Badge>)
    } else if (invoice.payment_status === 'collected' || invoice.payment_status === 'paid' || companyStatus === 'collected' || companyStatus === 'paid' || status === 'collected' || status === 'paid') {
      // PRIORIDAD 2: payment_status tiene prioridad sobre display_status
      // Si la compañía actual es receptora, mostrar "Pagada"; si es emisora, "Cobrada"
      const label = isReceiver ? 'Pagada' : 'Cobrada'
      badges.push(<Badge key="status" className="bg-green-500 text-white">{label}</Badge>)
    } else if (invoice.payment_status === 'partial') {
      const label = isReceiver ? 'Pago Parcial' : 'Cobro Parcial'
      badges.push(<Badge key="status" className="bg-yellow-100 text-yellow-800">{label}</Badge>)
    } else if (status === 'partially_cancelled') {
      badges.push(<Badge key="status" className="bg-orange-100 text-orange-800">Parc. Anulada</Badge>)
    } else if (status === 'pending_approval') {
      badges.push(<Badge key="status" className="bg-yellow-100 text-yellow-800">Pend. Aprobación</Badge>)
    } else if (status === 'rejected') {
      badges.push(<Badge key="status" className="bg-red-100 text-red-800">Rechazada</Badge>)
    } else if (status === 'approved') {
      badges.push(<Badge key="status" className="bg-green-100 text-green-800">Aprobada</Badge>)
    } else if (status === 'issued') {
      badges.push(<Badge key="status" className="bg-blue-100 text-blue-800">Emitida</Badge>)
    }
    
    return <div className="flex gap-1.5 flex-wrap items-center">{badges}</div>
  }

  const filteredInvoices = getFilteredInvoices()

  if (authLoading || initialLoad) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
          
          {/* Action Buttons Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-40" />
                  <Skeleton className="h-10 w-36" />
                </div>
              </div>
            </CardHeader>
          </Card>
          
          {/* Filters Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </CardHeader>
          </Card>
          
          {/* Invoice List Skeleton */}
          <InvoiceListSkeleton count={8} />
        </div>
      </div>
    )
  }
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <BackButton href={`/company/${companyId}`} />
          <div>
            <h1 className="text-3xl font-bold">Ver Comprobantes</h1>
            <p className="text-muted-foreground">Gestionar todos los comprobantes de la empresa</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Comprobantes</h2>
              {!isLoading && <p className="text-sm text-muted-foreground">{total} comprobantes en total</p>}
            </div>
            <div className="flex gap-2">
              <span>Comprobantes {!isLoading && `(${total} total)`}</span>
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    if (!confirm('⚠️ ATENCIÓN: Esto eliminará TODOS los comprobantes de esta empresa.\n\n¿Estás seguro? Esta acción no se puede deshacer.')) return
                    if (!confirm('¿REALMENTE estás seguro? Se eliminarán ' + total + ' comprobantes.')) return
                    try {
                      await invoiceService.deleteAllInvoices(companyId)
                      toast.success('Todos los comprobantes fueron eliminados')
                      window.location.reload()
                    } catch (error: any) {
                      toast.error(error.response?.data?.message || 'Error al eliminar comprobantes')
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Todas
                </Button>
                <Button
                  onClick={() => setShowSyncDialog(true)}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sincronizar con AFIP
                </Button>
                <Button 
                  onClick={async () => {
                    if (selectedInvoices.length === 0) {
                      toast.error('Selecciona al menos un comprobante')
                      return
                    }
                    
                    try {
                      toast.info('Generando TXT...')
                      const blob = await invoiceService.downloadBulk(companyId, selectedInvoices, 'txt')
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `facturas_${new Date().toISOString().split('T')[0]}.zip`
                      document.body.appendChild(a)
                      a.click()
                      window.URL.revokeObjectURL(url)
                      document.body.removeChild(a)
                      toast.success('TXT descargados')
                    } catch (error: any) {
                      console.error('Download error:', error)
                      toast.error(error.response?.data?.error || 'Error al descargar archivos')
                    }
                  }}
                  disabled={selectedInvoices.length === 0}
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar TXT ({selectedInvoices.length})
                </Button>
                <Button 
                  onClick={async () => {
                    if (selectedInvoices.length === 0) {
                      toast.error('Selecciona al menos un comprobante')
                      return
                    }
                    
                    try {
                      toast.info('Generando PDF...')
                      const blob = await invoiceService.downloadBulk(companyId, selectedInvoices, 'pdf')
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `facturas_${new Date().toISOString().split('T')[0]}.zip`
                      document.body.appendChild(a)
                      a.click()
                      window.URL.revokeObjectURL(url)
                      document.body.removeChild(a)
                      toast.success('PDF descargados')
                    } catch (error: any) {
                      console.error('Download error:', error)
                      toast.error(error.response?.data?.error || 'Error al descargar archivos')
                    }
                  }}
                  disabled={selectedInvoices.length === 0}
                  size="sm"
                  variant="outline"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Descargar PDF ({selectedInvoices.length})
                </Button>
              </div>
            </div>
          </div>
          {selectedInvoices.length > 0 && (
            <p className="text-sm text-blue-600">
              {selectedInvoices.length}/50 comprobantes seleccionados
            </p>
          )}
          <div>
            <div className="space-y-4 mb-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por número de factura..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10"
                  />
                  {isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filtros
                </Button>
                {(statusFilter !== "all" || typeFilter !== "all" || dateFromFilter || dateToFilter || clientFilter !== "all" || searchTerm) && (
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    size="sm"
                  >
                    Limpiar Filtros
                  </Button>
                )}
              </div>
              
              {showFilters && (
                <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="pending_approval">Pendiente Aprobación</SelectItem>
                          <SelectItem value="approved">Aprobada</SelectItem>
                          <SelectItem value="rejected">Rechazada</SelectItem>
                          <SelectItem value="issued">Emitida</SelectItem>
                          <SelectItem value="paid">Pagada</SelectItem>
                          <SelectItem value="collected">Cobrada</SelectItem>
                          <SelectItem value="overdue">Vencida</SelectItem>
                          <SelectItem value="cancelled">Anulada</SelectItem>
                          <SelectItem value="partially_cancelled">Parcialmente Anulada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="A">Factura A</SelectItem>
                          <SelectItem value="B">Factura B</SelectItem>
                          <SelectItem value="C">Factura C</SelectItem>
                          <SelectItem value="M">Factura M</SelectItem>
                          <SelectItem value="NCA">Nota de Crédito A</SelectItem>
                          <SelectItem value="NCB">Nota de Crédito B</SelectItem>
                          <SelectItem value="NCC">Nota de Crédito C</SelectItem>
                          <SelectItem value="NCM">Nota de Crédito M</SelectItem>
                          <SelectItem value="NDA">Nota de Débito A</SelectItem>
                          <SelectItem value="NDB">Nota de Débito B</SelectItem>
                          <SelectItem value="NDC">Nota de Débito C</SelectItem>
                          <SelectItem value="NDM">Nota de Débito M</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Cliente</Label>
                      <Select value={clientFilter} onValueChange={setClientFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          {allClients.map(client => (
                            <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Fecha Desde</Label>
                      <DatePicker
                        date={dateFromFilter ? parseDateLocal(dateFromFilter) || undefined : undefined}
                        onSelect={(date) => setDateFromFilter(date ? formatDateToLocal(date) : '')}
                        placeholder="Seleccionar fecha"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Fecha Hasta</Label>
                      <DatePicker
                        date={dateToFilter ? parseDateLocal(dateToFilter) || undefined : undefined}
                        onSelect={(date) => setDateToFilter(date ? formatDateToLocal(date) : '')}
                        placeholder="Seleccionar fecha"
                        minDate={dateFromFilter ? parseDateLocal(dateFromFilter) || undefined : undefined}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
              <div className="grid grid-cols-[40px_120px_140px_1fr_100px_120px_180px_140px] gap-4 p-4 border-b border-gray-200 bg-gray-50 font-medium text-sm">
                <div className="flex items-center justify-center">
                  <Checkbox
                    checked={selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </div>
                <div>Número</div>
                <div>Tipo</div>
                <div>Cliente</div>
                <div>Fecha</div>
                <div>Total</div>
                <div>Estado</div>
                <div>Acciones</div>
              </div>

              {isLoading && !initialLoad ? (
                // Skeleton para búsquedas, filtros y paginación
                Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-[40px_120px_140px_1fr_100px_120px_180px_140px] gap-4 p-4 border-b border-gray-200">
                    <div className="h-5 w-5 bg-muted rounded animate-pulse"></div>
                    <div className="h-5 bg-muted rounded animate-pulse"></div>
                    <div className="h-5 bg-muted rounded animate-pulse"></div>
                    <div className="h-5 bg-muted rounded animate-pulse"></div>
                    <div className="h-5 bg-muted rounded animate-pulse"></div>
                    <div className="h-5 bg-muted rounded animate-pulse"></div>
                    <div className="h-5 bg-muted rounded animate-pulse"></div>
                    <div className="flex gap-1">
                      <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                      <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                      <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                      <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                    </div>
                  </div>
                ))
              ) : filteredInvoices.map((invoice) => {
                    const clientName = invoice.receiver_name || invoice.client?.business_name || 
                                      (invoice.client?.first_name && invoice.client?.last_name 
                                        ? `${invoice.client.first_name} ${invoice.client.last_name}` 
                                        : 'Sin cliente')
                    return (
                      <div key={invoice.id} className="grid grid-cols-[40px_120px_140px_1fr_100px_120px_180px_140px] gap-4 p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={selectedInvoices.includes(invoice.id)}
                            onCheckedChange={() => handleSelectInvoice(invoice.id)}
                          />
                        </div>
                        <div className="text-sm">{invoice.number}</div>
                        <div>
                          <Badge className="bg-gray-100 text-gray-700 border-gray-200">Tipo {invoice.type}</Badge>
                        </div>
                        <div className="truncate" title={clientName}>
                          {clientName}
                          <div className="flex gap-1 mt-1">
                            {invoice.is_manual_load ? (
                              <Badge variant="outline" className="border-orange-300 text-orange-700 bg-orange-50 text-xs">Carga Manual</Badge>
                            ) : invoice.synced_from_afip ? (
                              <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-xs">Sinc. AFIP</Badge>
                            ) : invoice.afip_cae && !invoice.is_manual_load && !invoice.synced_from_afip ? (
                              <Badge className="bg-green-50 text-green-700 border border-green-200 text-xs">Subidas a AFIP</Badge>
                            ) : null}
                          </div>
                        </div>
                        <div>{parseDateLocal(invoice.issue_date)?.toLocaleDateString('es-AR') || 'N/A'}</div>
                        <div className="font-medium">
                          {formatCurrency(parseFloat(invoice.total), invoice.currency)}
                        </div>
                        <div>{getInvoiceStatusBadges(invoice)}</div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/company/${companyId}/invoices/${invoice.id}`)}
                            title="Ver detalle"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => downloadPDF(invoice.id)}
                            title="Descargar PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => downloadTXT(invoice.id)}
                            title="Descargar TXT AFIP"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={async () => {
                              if (confirm('¿Estás seguro de eliminar este comprobante? Solo se borrará de tu sistema, no de AFIP.')) {
                                try {
                                  await invoiceService.deleteInvoice(companyId, invoice.id)
                                  toast.success('Comprobante eliminado')
                                  window.location.reload()
                                } catch (error: any) {
                                  toast.error(error.response?.data?.message || 'Error al eliminar comprobante')
                                }
                              }
                            }}
                            title="Eliminar (solo en homologación)"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
              })}

              {!isLoading && filteredInvoices.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No se encontraron comprobantes</p>
                </div>
              )}
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sync Dialog */}
      <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sincronizar Comprobantes desde AFIP</DialogTitle>
            <DialogDescription>
              Importa comprobantes emitidos directamente desde los registros de AFIP
            </DialogDescription>
          </DialogHeader>
          
          {!syncResults ? (
            <div className="space-y-4">
              {syncing && syncProgress && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Sincronizando con AFIP</p>
                      <p className="text-sm text-blue-700">{syncProgress}</p>
                    </div>
                  </div>
                  <div className="mt-3 bg-blue-100 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSyncMode('single')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    syncMode === 'single' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium mb-1">Un comprobante específico</div>
                  <div className="text-sm text-muted-foreground">Consultar por número de comprobante</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSyncMode('date_range')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    syncMode === 'date_range' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium mb-1">Rango de fechas</div>
                  <div className="text-sm text-muted-foreground">Traer todos los comprobantes de un período</div>
                </button>
              </div>

              {syncMode === 'single' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Punto de Venta *</Label>
                      <Input
                        type="number"
                        placeholder="1"
                        min="1"
                        max="9999"
                        value={syncForm.sales_point}
                        onChange={(e) => {
                          const num = parseInt(e.target.value) || 1
                          if (num >= 1 && num <= 9999) {
                            setSyncForm({...syncForm, sales_point: num})
                          }
                        }}
                      />
                      <p className="text-xs text-muted-foreground">Se formateará como {syncForm.sales_point.toString().padStart(4, '0')}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo *</Label>
                      <Select value={syncForm.invoice_type} onValueChange={(value) => setSyncForm({...syncForm, invoice_type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">Factura A</SelectItem>
                          <SelectItem value="B">Factura B</SelectItem>
                          <SelectItem value="C">Factura C</SelectItem>
                          <SelectItem value="M">Factura M</SelectItem>
                          <SelectItem value="NCA">Nota de Crédito A</SelectItem>
                          <SelectItem value="NCB">Nota de Crédito B</SelectItem>
                          <SelectItem value="NCC">Nota de Crédito C</SelectItem>
                          <SelectItem value="NCM">Nota de Crédito M</SelectItem>
                          <SelectItem value="NDA">Nota de Débito A</SelectItem>
                          <SelectItem value="NDB">Nota de Débito B</SelectItem>
                          <SelectItem value="NDC">Nota de Débito C</SelectItem>
                          <SelectItem value="NDM">Nota de Débito M</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Número *</Label>
                      <Input
                        type="number"
                        placeholder="1"
                        min="1"
                        max="99999999"
                        value={syncForm.invoice_number}
                        onChange={(e) => {
                          const val = e.target.value
                          if (val.length <= 8) {
                            setSyncForm({...syncForm, invoice_number: val})
                          }
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        {syncForm.invoice_number && `Se formateará como ${syncForm.invoice_number.toString().padStart(8, '0')}`}
                      </p>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm text-blue-900 space-y-2">
                    <p className="font-medium">Qué hace la sincronización:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Consulta el comprobante específico en AFIP</li>
                      <li>Busca el cliente por CUIT en tu sistema (empresas conectadas primero, luego clientes externos)</li>
                      <li>Si no existe, crea un cliente archivado con datos incompletos que deberás completar</li>
                      <li>Importa: número, fecha, totales, CAE y datos fiscales</li>
                      <li>NO importa: concepto (productos/servicios), fechas de servicio, ni detalle de ítems (AFIP no los proporciona)</li>
                      <li>Podrás editar después: concepto, fechas de servicio y descripción del ítem genérico</li>
                      <li>NO podrás editar: montos, cantidades ni precios (deben coincidir con AFIP)</li>
                      <li>El comprobante se marca como "Sincronizado AFIP" para identificarlo</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha Desde *</Label>
                      <Input
                        type="date"
                        value={syncForm.date_from}
                        onChange={(e) => setSyncForm({...syncForm, date_from: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha Hasta *</Label>
                      <Input
                        type="date"
                        value={syncForm.date_to}
                        min={syncForm.date_from}
                        onChange={(e) => setSyncForm({...syncForm, date_to: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-sm text-red-800">
                    <p><strong>⚠️ Límite:</strong> El rango máximo permitido es de 90 días (3 meses).</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm text-blue-900 space-y-2">
                    <p className="font-medium">Qué hace la sincronización masiva:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Consulta todos los puntos de venta autorizados en AFIP</li>
                      <li>Busca Facturas, Notas de Crédito y Notas de Débito (A, B, C, M)</li>
                      <li>Solo importa comprobantes dentro del rango de fechas</li>
                      <li>Busca cada cliente por CUIT (empresas conectadas primero, luego externos)</li>
                      <li>Crea clientes archivados con datos incompletos si no existen</li>
                      <li>Importa: número, fecha, totales, CAE y datos fiscales</li>
                      <li>NO importa: concepto, fechas de servicio, ni detalle de ítems (AFIP no los proporciona)</li>
                      <li>Podrás editar después: concepto, fechas de servicio y descripción del ítem genérico</li>
                      <li>NO podrás editar: montos, cantidades ni precios (deben coincidir con AFIP)</li>
                      <li>Los comprobantes se marcan como "Sincronizado AFIP"</li>
                    </ul>
                    <p className="text-xs mt-2 font-medium text-blue-800">Nota: Este proceso puede tardar varios minutos según la cantidad de comprobantes.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Total Encontradas</p>
                  <p className="text-3xl font-bold text-blue-600">{syncResults.imported_count}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Nuevos Importados</p>
                  <p className="text-3xl font-bold text-green-600">
                    {syncResults.invoices?.filter((inv: any) => inv.saved).length || 0}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Ya Existían</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {syncResults.invoices?.filter((inv: any) => !inv.saved).length || 0}
                  </p>
                </Card>
              </div>
              
              {syncResults.auto_created_clients && syncResults.auto_created_clients > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
                  <p className="text-sm font-medium text-yellow-800">
                    ⚠️ Se crearon {syncResults.auto_created_clients} clientes archivados
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Estos clientes requieren revisión en la sección de Clientes para completar sus datos.
                  </p>
                </div>
              )}
              
              {syncResults.invoices && syncResults.invoices.length > 0 && (
                <div className="space-y-2">
                  <Label>Comprobantes Encontrados ({syncResults.invoices.length})</Label>
                  <div className="max-h-60 overflow-y-auto border rounded-lg">
                    {syncResults.invoices.map((inv: any, idx: number) => (
                      <div key={idx} className="p-3 border-b last:border-b-0 hover:bg-muted/50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium">{inv.formatted_number} - Tipo {inv.type}</p>
                            {inv.data && (
                              <p className="text-sm text-muted-foreground">
                                CAE: {inv.data.cae} | Total: {formatCurrency(parseFloat(inv.data.total), inv.data.currency || 'ARS')}
                              </p>
                            )}
                            {!inv.saved && (
                              <p className="text-xs text-orange-600 mt-1">
                                ⚠️ Este comprobante ya se encuentra en tu sistema
                              </p>
                            )}
                          </div>
                          <Badge className={inv.saved ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
                            {inv.saved ? 'Importada' : 'Ya existe'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {syncResults.imported_count === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No se encontraron comprobantes en AFIP</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            {!syncResults ? (
              <>
                <Button variant="outline" onClick={() => setShowSyncDialog(false)} disabled={syncing}>
                  Cancelar
                </Button>
                <Button 
                  onClick={async () => {
                    if (syncMode === 'single' && !syncForm.invoice_number) {
                      toast.error('Ingresá el número de comprobante')
                      return
                    }
                    if (syncMode === 'date_range') {
                      if (!syncForm.date_from || !syncForm.date_to) {
                        toast.error('Ingresá ambas fechas')
                        return
                      }
                      
                      const from = new Date(syncForm.date_from)
                      const to = new Date(syncForm.date_to)
                      const diffDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
                      
                      if (diffDays > 90) {
                        toast.error('El rango no puede superar los 90 días (3 meses)')
                        return
                      }
                    }
                    
                    setSyncing(true)
                    setSyncProgress(syncMode === 'date_range' ? 'Iniciando sincronización masiva...' : 'Consultando comprobante en AFIP...')
                    
                    const syncToast = syncMode === 'date_range' 
                      ? toast.loading('🔄 Sincronizando con AFIP... Consultando todos los puntos de venta y tipos de comprobante. Esto puede tardar varios minutos.')
                      : null
                    
                    try {
                      let payload: any
                      
                      if (syncMode === 'single') {
                        payload = {
                          mode: 'single',
                          sales_point: syncForm.sales_point,
                          invoice_type: syncForm.invoice_type,
                          invoice_number: parseInt(syncForm.invoice_number)
                        }
                      } else {
                        payload = {
                          mode: 'date_range',
                          date_from: syncForm.date_from,
                          date_to: syncForm.date_to
                        }
                      }
                      
                      if (syncMode === 'date_range') {
                        setSyncProgress('🔍 Consultando puntos de venta autorizados...')
                        await new Promise(resolve => setTimeout(resolve, 500))
                        setSyncProgress('📄 Consultando comprobantes por tipo y punto de venta...')
                        await new Promise(resolve => setTimeout(resolve, 500))
                        setSyncProgress('💾 Guardando facturas encontradas...')
                      }
                      
                      const result = await invoiceService.syncFromAfip(companyId, payload)
                      if (syncToast) toast.dismiss(syncToast)
                      
                      // Mostrar información detallada del proceso
                      if (syncMode === 'date_range' && result.summary) {
                        console.log('📊 Resumen de sincronización:', result.summary)
                        toast.info(`📊 Consultados ${result.summary.length} puntos de venta en AFIP`, {
                          description: `Se encontraron ${result.imported_count} comprobantes en total`
                        })
                      }
                      
                      setSyncResults(result)
                      
                      if (result.imported_count === 0) {
                        toast.warning('No se encontraron comprobantes en AFIP', {
                          description: syncMode === 'single' 
                            ? 'Verifica que el número, tipo y punto de venta sean correctos'
                            : 'No hay comprobantes emitidos en el rango de fechas seleccionado'
                        })
                      } else {
                        // Check if any invoice was actually saved (new)
                        const newInvoices = result.invoices?.filter((inv: any) => inv.saved).length || 0
                        
                        if (newInvoices > 0) {
                          // Reload invoices in background
                          try {
                            const response = await invoiceService.getInvoices(companyId, currentPage, {})
                            setInvoices(response.data || [])
                            const clientMsg = (result.auto_created_clients && result.auto_created_clients > 0) 
                              ? ` Se crearon ${result.auto_created_clients} cliente(s) archivado(s) con datos incompletos que debes completar en Clientes Archivados.`
                              : '';
                            toast.success(`${newInvoices} comprobante${newInvoices > 1 ? 's' : ''} sincronizado${newInvoices > 1 ? 's' : ''} desde AFIP.${clientMsg}`)
                          } catch (error) {
                            console.error('Error reloading invoices:', error)
                            toast.success(`${newInvoices} comprobante${newInvoices > 1 ? 's' : ''} encontrado${newInvoices > 1 ? 's' : ''}`)  
                          }
                        } else {
                          toast.success(`ℹ️ ${result.imported_count} comprobante${result.imported_count > 1 ? 's' : ''} encontrado${result.imported_count > 1 ? 's' : ''} en AFIP`, {
                            description: 'Ya existía' + (result.imported_count > 1 ? 'n' : '') + ' en tu sistema'
                          })
                        }
                      }
                    } catch (error: any) {
                      if (syncToast) toast.dismiss(syncToast)
                      console.error('Error de sincronización:', error)
                      const errorData = error.response?.data || {}
                      console.error('Respuesta del servidor:', errorData)
                      
                      let errorMsg = 'Error desconocido. Intente nuevamente'
                      let errorDescription = ''
                      
                      if (errorData?.message) {
                        errorMsg = errorData.message
                      } else if (errorData?.error) {
                        errorMsg = errorData.error
                      } else if (error.message) {
                        errorMsg = error.message
                      }
                      
                      // Mensajes específicos para errores comunes
                      if (errorMsg.includes('certificate') || errorMsg.includes('certificado')) {
                        errorDescription = 'Verifica tu certificado AFIP en Configuración → Verificar Perfil Fiscal'
                      } else if (errorMsg.includes('connection') || errorMsg.includes('conexión')) {
                        errorDescription = 'Problema de conexión con AFIP. Intenta nuevamente en unos minutos'
                      } else if (errorMsg.includes('not found') || errorMsg.includes('no encontrada')) {
                        errorDescription = 'El comprobante no existe en AFIP o los datos son incorrectos'
                      }
                      
                      toast.error('Error al sincronizar con AFIP', {
                        description: errorDescription || errorMsg
                      })
                    } finally {
                      setSyncing(false)
                      setSyncProgress('')
                    }
                  }}
                  disabled={syncing}
                >
                  {syncing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {syncProgress || (syncMode === 'date_range' ? 'Sincronizando...' : 'Consultando...')}
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {syncMode === 'single' ? 'Consultar Comprobante' : 'Sincronizar por Fechas'}
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => {
                  setSyncResults(null)
                  setSyncProgress('')
                  setSyncForm({
                    sales_point: 1,
                    invoice_type: 'B',
                    invoice_number: '',
                    date_from: '',
                    date_to: ''
                  })
                }}>
                  Nueva Consulta
                </Button>
                <Button onClick={() => {
                  setShowSyncDialog(false)
                  setSyncResults(null)
                  setSyncProgress('')
                }}>
                  Cerrar
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}