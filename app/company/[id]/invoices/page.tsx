"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, FileText, Download, Filter, Search, CheckSquare, Square, Eye, ExternalLink, Loader2, RefreshCw, Trash2 } from "lucide-react"
import { invoiceService } from "@/services/invoice.service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    const loadInvoices = async () => {
      if (!companyId) return
      
      setIsLoading(true)
      try {
        const response = await invoiceService.getInvoices(companyId, currentPage)
        setInvoices(response.data || [])
        setTotalPages(response.last_page || 1)
        setTotal(response.total || 0)
      } catch (error: any) {
        toast.error('Error al cargar facturas', {
          description: error.response?.data?.message || 'Intente nuevamente'
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated && companyId) {
      loadInvoices()
    }
  }, [isAuthenticated, companyId, currentPage])

  const handleSelectInvoice = (invoiceId: string) => {
    setSelectedInvoices(prev => {
      if (prev.includes(invoiceId)) {
        return prev.filter(id => id !== invoiceId)
      } else if (prev.length >= 50) {
        toast.error('Máximo 50 facturas seleccionadas', {
          description: 'Deselecciona algunas facturas para continuar'
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
        toast.warning('Solo se seleccionaron las primeras 50 facturas')
      }
      setSelectedInvoices(toSelect)
    }
  }

  const getFilteredInvoices = () => {
    return invoices.filter(invoice => {
      const clientName = invoice.client?.business_name || invoice.client?.first_name + ' ' + invoice.client?.last_name || 'Sin cliente'
      const matchesSearch = invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           clientName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
      const matchesType = typeFilter === "all" || invoice.type === typeFilter
      const matchesClient = clientFilter === "all" || clientName === clientFilter
      
      let matchesDateRange = true
      if (dateFromFilter) {
        matchesDateRange = matchesDateRange && new Date(invoice.issue_date) >= new Date(dateFromFilter)
      }
      if (dateToFilter) {
        matchesDateRange = matchesDateRange && new Date(invoice.issue_date) <= new Date(dateToFilter)
      }
      
      return matchesSearch && matchesStatus && matchesType && matchesClient && matchesDateRange
    })
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setTypeFilter("all")
    setDateFromFilter("")
    setDateToFilter("")
    setClientFilter("all")
  }

  const uniqueClients = [...new Set(invoices.map(inv => 
    inv.client?.business_name || inv.client?.first_name + ' ' + inv.client?.last_name || 'Sin cliente'
  ))]

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
    const isOverdue = dueDate < today && invoice.status !== 'paid' && invoice.status !== 'cancelled'
    const isEmitted = !invoice.supplier_id // Factura emitida (sin supplier)
    
    // 1. Vencimiento (máxima prioridad visual)
    if (isOverdue) {
      badges.push(<Badge key="overdue" className="bg-red-500 text-white">Vencida</Badge>)
    }
    
    // 2. Estado de aprobación/workflow
    if (invoice.status === 'pending_approval') {
      badges.push(<Badge key="status" className="bg-yellow-100 text-yellow-800">Pend. Aprobación</Badge>)
    } else if (invoice.status === 'issued') {
      badges.push(<Badge key="status" className="bg-blue-100 text-blue-800">Emitida</Badge>)
    } else if (invoice.status === 'approved') {
      badges.push(<Badge key="status" className="bg-green-100 text-green-800">Aprobada</Badge>)
    } else if (invoice.status === 'rejected') {
      badges.push(<Badge key="status" className="bg-red-100 text-red-800">Rechazada</Badge>)
    } else if (invoice.status === 'paid') {
      // Diferenciar entre facturas emitidas (cobradas) y recibidas (pagadas)
      const label = isEmitted ? 'Cobrada' : 'Pagada'
      badges.push(<Badge key="status" className="bg-green-500 text-white">{label}</Badge>)
    } else if (invoice.status === 'cancelled') {
      badges.push(<Badge key="status" className="bg-gray-100 text-gray-800">Anulada</Badge>)
    } else if (invoice.status === 'partially_cancelled') {
      badges.push(<Badge key="status" className="bg-orange-100 text-orange-800">Parc. Anulada</Badge>)
    }
    
    return <div className="flex gap-1.5 flex-wrap items-center">{badges}</div>
  }

  const filteredInvoices = getFilteredInvoices()

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push(`/company/${companyId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Ver Facturas</h1>
            <p className="text-muted-foreground">Gestionar todas las facturas de la empresa</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Facturas ({total} total)</span>
              <div className="flex gap-2">
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
                      toast.error('Selecciona al menos una factura')
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
                      toast.error('Selecciona al menos una factura')
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
            </CardTitle>
            <CardDescription>
              {selectedInvoices.length > 0 && (
                <span className="text-blue-600">
                  {selectedInvoices.length}/50 facturas seleccionadas
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar por número o empresa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filtros
                </Button>
                {(statusFilter !== "all" || typeFilter !== "all" || dateFromFilter || dateToFilter || clientFilter !== "all") && (
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
                <Card className="p-4">
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
                          <SelectItem value="issued">Emitida</SelectItem>
                          <SelectItem value="approved">Aprobada</SelectItem>
                          <SelectItem value="rejected">Rechazada</SelectItem>
                          <SelectItem value="paid">Pagada</SelectItem>
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
                          <SelectItem value="E">Factura E (Exportación)</SelectItem>
                          <SelectItem value="NCA">Nota de Crédito A</SelectItem>
                          <SelectItem value="NCB">Nota de Crédito B</SelectItem>
                          <SelectItem value="NCC">Nota de Crédito C</SelectItem>
                          <SelectItem value="NCM">Nota de Crédito M</SelectItem>
                          <SelectItem value="NCE">Nota de Crédito E</SelectItem>
                          <SelectItem value="NDA">Nota de Débito A</SelectItem>
                          <SelectItem value="NDB">Nota de Débito B</SelectItem>
                          <SelectItem value="NDC">Nota de Débito C</SelectItem>
                          <SelectItem value="NDM">Nota de Débito M</SelectItem>
                          <SelectItem value="NDE">Nota de Débito E</SelectItem>
                          <SelectItem value="RA">Recibo A</SelectItem>
                          <SelectItem value="RB">Recibo B</SelectItem>
                          <SelectItem value="RC">Recibo C</SelectItem>
                          <SelectItem value="RM">Recibo M</SelectItem>
                          <SelectItem value="FCEA">FCE MiPyME A</SelectItem>
                          <SelectItem value="FCEB">FCE MiPyME B</SelectItem>
                          <SelectItem value="FCEC">FCE MiPyME C</SelectItem>
                          <SelectItem value="NCFCEA">NC FCE MiPyME A</SelectItem>
                          <SelectItem value="NCFCEB">NC FCE MiPyME B</SelectItem>
                          <SelectItem value="NCFCEC">NC FCE MiPyME C</SelectItem>
                          <SelectItem value="NDFCEA">ND FCE MiPyME A</SelectItem>
                          <SelectItem value="NDFCEB">ND FCE MiPyME B</SelectItem>
                          <SelectItem value="NDFCEC">ND FCE MiPyME C</SelectItem>
                          <SelectItem value="R">Remito Electrónico</SelectItem>
                          <SelectItem value="LBUA">Liquidación Bienes Usados A</SelectItem>
                          <SelectItem value="LBUB">Liquidación Bienes Usados B</SelectItem>
                          <SelectItem value="CBUCF">Comprobante Compra Bienes Usados</SelectItem>
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
                          {uniqueClients.map(client => (
                            <SelectItem key={client} value={client}>{client}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Fecha Desde</Label>
                      <DatePicker
                        date={dateFromFilter ? new Date(dateFromFilter) : undefined}
                        onSelect={(date) => setDateFromFilter(date ? date.toISOString().split('T')[0] : '')}
                        placeholder="Seleccionar fecha"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Fecha Hasta</Label>
                      <DatePicker
                        date={dateToFilter ? new Date(dateToFilter) : undefined}
                        onSelect={(date) => setDateToFilter(date ? date.toISOString().split('T')[0] : '')}
                        placeholder="Seleccionar fecha"
                        minDate={dateFromFilter ? new Date(dateFromFilter) : undefined}
                      />
                    </div>
                  </div>
                </Card>
              )}
            </div>

            <div className="border rounded-lg">
              <div className="grid grid-cols-8 gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span>Seleccionar</span>
                </div>
                <div>Número</div>
                <div>Tipo</div>
                <div>Cliente</div>
                <div>Fecha</div>
                <div>Total</div>
                <div>Estado</div>
                <div>Acciones</div>
              </div>

              {isLoading ? (
                <div className="text-center py-32">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-3">Cargando facturas...</p>
                </div>
              ) : (
                <>
                  {filteredInvoices.map((invoice) => {
                    const clientName = invoice.client?.business_name || 
                                      (invoice.client?.first_name && invoice.client?.last_name 
                                        ? `${invoice.client.first_name} ${invoice.client.last_name}` 
                                        : 'Sin cliente')
                    return (
                      <div key={invoice.id} className="grid grid-cols-8 gap-4 p-4 border-b hover:bg-muted/30">
                        <div className="flex items-center">
                          <Checkbox
                            checked={selectedInvoices.includes(invoice.id)}
                            onCheckedChange={() => handleSelectInvoice(invoice.id)}
                          />
                        </div>
                        <div className="font-medium">{invoice.number}</div>
                        <div>
                          <Badge variant="outline">Tipo {invoice.type}</Badge>
                        </div>
                        <div className="truncate" title={clientName}>{clientName}</div>
                        <div>{new Date(invoice.issue_date).toLocaleDateString('es-AR')}</div>
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
                              if (confirm('¿Estás seguro de eliminar esta factura? Solo se borrará de tu sistema, no de AFIP.')) {
                                try {
                                  await invoiceService.deleteInvoice(companyId, invoice.id)
                                  toast.success('Factura eliminada')
                                  window.location.reload()
                                } catch (error: any) {
                                  toast.error(error.response?.data?.message || 'Error al eliminar factura')
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

                  {filteredInvoices.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No se encontraron facturas</p>
                    </div>
                  )}
                </>
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
          </CardContent>
        </Card>
      </div>

      {/* Sync Dialog */}
      <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sincronizar Facturas desde AFIP</DialogTitle>
            <DialogDescription>
              Importa facturas emitidas directamente desde los registros de AFIP
            </DialogDescription>
          </DialogHeader>
          
          {!syncResults ? (
            <div className="space-y-4">
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
                  <div className="font-medium mb-1">Una factura específica</div>
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
                  <div className="text-sm text-muted-foreground">Traer todas las facturas de un período</div>
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
                  <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                    <p className="mb-1">ℹ️ Se consultará la factura específica en AFIP</p>
                    <p className="text-xs">📅 La fecha de vencimiento se calculará automáticamente como 30 días desde la fecha de emisión</p>
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
                  <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                    <p className="font-medium mb-1">ℹ️ Se consultarán:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Facturas, Notas de Crédito y Notas de Débito (A, B, C, M)</li>
                      <li>Todos los puntos de venta autorizados en AFIP (incluso no consecutivos)</li>
                      <li>Solo comprobantes dentro del rango de fechas</li>
                    </ul>
                    <p className="text-xs mt-2">📅 La fecha de vencimiento se calculará automáticamente como 30 días desde la fecha de emisión de cada factura</p>
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
                  <p className="text-sm text-muted-foreground">Nuevas Importadas</p>
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
              
              {syncResults.invoices && syncResults.invoices.length > 0 && (
                <div className="space-y-2">
                  <Label>Facturas Encontradas ({syncResults.invoices.length})</Label>
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
                                ⚠️ Esta factura ya se encuentra en tu sistema
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
                  <p>No se encontraron facturas en AFIP</p>
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
                      toast.error('Ingresá el número de factura')
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
                    const syncToast = toast.loading(syncMode === 'date_range' ? 'Sincronizando facturas desde AFIP... Puede tardar varios minutos' : 'Consultando factura en AFIP...')
                    
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
                      
                      const result = await invoiceService.syncFromAfip(companyId, payload)
                      toast.dismiss(syncToast)
                      setSyncResults(result)
                      
                      if (result.imported_count === 0) {
                        toast.warning('No se encontraron facturas')
                      } else {
                        // Check if any invoice was actually saved (new)
                        const newInvoices = result.invoices?.filter((inv: any) => inv.saved).length || 0
                        
                        if (newInvoices > 0) {
                          // Reload invoices in background
                          try {
                            const response = await invoiceService.getInvoices(companyId)
                            setInvoices(response.data || [])
                            toast.success(`${newInvoices} factura${newInvoices > 1 ? 's' : ''} importada${newInvoices > 1 ? 's' : ''} correctamente`)
                          } catch (error) {
                            console.error('Error reloading invoices:', error)
                            toast.success(`${newInvoices} factura${newInvoices > 1 ? 's' : ''} encontrada${newInvoices > 1 ? 's' : ''}`)  
                          }
                        } else {
                          toast.success(`${result.imported_count} factura${result.imported_count > 1 ? 's' : ''} encontrada${result.imported_count > 1 ? 's' : ''} (ya existía${result.imported_count > 1 ? 'n' : ''} en el sistema)`)
                        }
                      }
                    } catch (error: any) {
                      toast.dismiss(syncToast)
                      console.error('Sync error:', error)
                      const errorData = error.response?.data
                      console.error('Error response:', errorData)
                      const errorMsg = errorData?.message || errorData?.error || error.message || 'Intente nuevamente'
                      toast.error('Error al sincronizar', {
                        description: errorMsg
                      })
                    } finally {
                      setSyncing(false)
                    }
                  }}
                  disabled={syncing}
                >
                  {syncing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {syncMode === 'date_range' ? 'Sincronizando... Puede tardar varios minutos' : 'Consultando...'}
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {syncMode === 'single' ? 'Consultar Factura' : 'Sincronizar por Fechas'}
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => {
                  setSyncResults(null)
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