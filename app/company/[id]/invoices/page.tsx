"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { FileText, Download, Filter, Search, Loader2, RefreshCw, Shield } from "lucide-react"
import { invoiceService } from "@/services/invoice.service"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { formatDateToLocal, parseDateLocal } from "@/lib/utils"
import { colors } from "@/styles"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { InvoiceCard } from "@/components/invoices/InvoiceCard"
import { InvoicesPageSkeleton, InvoiceCardSkeleton } from "@/components/invoices/InvoicesSkeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { useAfipCertificate } from "@/hooks/use-afip-certificate"
import { AfipButton } from "@/components/afip/afip-guard"
import { AfipCertificateBanner } from "@/components/afip/afip-certificate-banner"
import { ResponsiveHeading, ResponsiveText } from "@/components/ui/responsive-heading"

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

  const [allInvoices, setAllInvoices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
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
  const [downloadingTXT, setDownloadingTXT] = useState(false)
  const [downloadingPDF, setDownloadingPDF] = useState(false)

  // AFIP Certificate validation
  const { isVerified: isAfipVerified, isLoading: isLoadingCert } = useAfipCertificate(companyId)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/log-in')
    }
  }, [isAuthenticated, authLoading, router])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, typeFilter, dateFromFilter, dateToFilter, clientFilter])

  // Cargar todas las facturas y clientes solo una vez al inicio
  useEffect(() => {
    const loadAllData = async () => {
      if (!companyId) return
      
      setIsLoading(true)
      try {
        // Cargar primera página para saber cuántas páginas hay
        const firstResponse = await invoiceService.getInvoices(companyId, 1, {})
        const totalPages = firstResponse.last_page || 1
        
        // Cargar todas las páginas en paralelo
        const pagePromises = []
        for (let page = 1; page <= totalPages; page++) {
          pagePromises.push(invoiceService.getInvoices(companyId, page, {}))
        }
        
        const allResponses = await Promise.all(pagePromises)
        const allInvoicesData = allResponses.flatMap(response => response.data || [])
        
        setAllInvoices(allInvoicesData)
        
        // Extraer clientes únicos
        const clientsMap = new Map()
        let hasInvoicesWithoutClient = false
        
        allInvoicesData.forEach((inv: any) => {
          const clientName = inv.receiver_name || inv.client?.business_name || 
                            inv.receiverCompany?.name ||
                            (inv.client?.first_name && inv.client?.last_name 
                              ? `${inv.client.first_name} ${inv.client.last_name}` 
                              : null)
          
          if (clientName && !clientsMap.has(clientName)) {
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
        
        const clients = Array.from(clientsMap.values())
        if (hasInvoicesWithoutClient) {
          clients.push({ id: 'sin_cliente', name: 'Sin cliente', isCompany: false })
        }
        setAllClients(clients)
      } catch (error: any) {
        console.error('Error loading invoices:', error)
        setAllInvoices([])
        toast.error('Error al cargar comprobantes', {
          description: error.response?.data?.message || 'Intente nuevamente'
        })
      } finally {
        setIsLoading(false)
        setInitialLoad(false)
      }
    }

    if (isAuthenticated && companyId) {
      loadAllData()
    }
  }, [isAuthenticated, companyId])

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
    const currentlySelected = filteredInvoices.filter(inv => selectedInvoices.includes(inv.id))
    
    if (currentlySelected.length > 0) {
      // Si hay alguna seleccionada, deseleccionar todas
      setSelectedInvoices([])
    } else {
      // Seleccionar hasta 50
      const toSelect = filteredInvoices.slice(0, 50).map(inv => inv.id)
      if (filteredInvoices.length > 50) {
        toast.warning('Solo se seleccionaron los primeros 50 comprobantes')
      }
      setSelectedInvoices(toSelect)
    }
  }

  const getFilteredInvoices = () => {
    let filtered = [...allInvoices]
    
    // Filtro de búsqueda por número
    if (searchTerm) {
      filtered = filtered.filter(inv => 
        inv.number?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Filtro de estado
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(inv => inv.status === statusFilter)
    }
    
    // Filtro de tipo
    if (typeFilter && typeFilter !== 'all') {
      filtered = filtered.filter(inv => inv.type === typeFilter)
    }
    
    // Filtro de cliente
    if (clientFilter && clientFilter !== 'all') {
      filtered = filtered.filter(inv => {
        const invClientId = inv.receiver_company_id || inv.client_id
        const invClientName = inv.receiver_name || inv.client?.business_name || 
                             inv.receiverCompany?.name ||
                             (inv.client?.first_name && inv.client?.last_name 
                               ? `${inv.client.first_name} ${inv.client.last_name}` 
                               : null)
        
        if (clientFilter === 'sin_cliente') {
          return !invClientName
        }
        
        return invClientId === clientFilter || invClientName === clientFilter
      })
    }
    
    // Filtro de fecha desde
    if (dateFromFilter) {
      filtered = filtered.filter(inv => {
        const invDate = new Date(inv.date)
        const filterDate = new Date(dateFromFilter)
        return invDate >= filterDate
      })
    }
    
    // Filtro de fecha hasta
    if (dateToFilter) {
      filtered = filtered.filter(inv => {
        const invDate = new Date(inv.date)
        const filterDate = new Date(dateToFilter)
        return invDate <= filterDate
      })
    }
    
    return filtered
  }
  
  // Calcular paginación en el frontend
  const filteredInvoices = getFilteredInvoices()
  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage)
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const total = filteredInvoices.length

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setTypeFilter("all")
    setDateFromFilter("")
    setDateToFilter("")
    setClientFilter("all")
  }

  const downloadPDF = async (invoiceId: string) => {
    const invoice = allInvoices.find((inv: any) => inv.id === invoiceId)
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
    const invoice = allInvoices.find((inv: any) => inv.id === invoiceId)
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

  if (authLoading || initialLoad) {
    return <InvoicesPageSkeleton />
  }
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BackButton href={`/company/${companyId}`} />
            <div>
              <ResponsiveHeading level="h1">Ver Comprobantes</ResponsiveHeading>
              <ResponsiveText className="text-muted-foreground">Gestionar todos los comprobantes de la empresa</ResponsiveText>
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-2">
                <AfipButton
                  companyId={companyId}
                  onClick={() => setShowSyncDialog(true)}
                  variant="outline"
                  className="w-full sm:w-auto"
                  errorMessage="Certificado AFIP requerido para sincronizar comprobantes desde AFIP"
                  loadingText="Verificando AFIP..."
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sinc. AFIP
                </AfipButton>
                <Button 
                  onClick={async () => {
                    if (selectedInvoices.length === 0) {
                      toast.error('Selecciona al menos un comprobante')
                      return
                    }
                    
                    setDownloadingTXT(true)
                    try {
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
                    } finally {
                      setDownloadingTXT(false)
                    }
                  }}
                  disabled={selectedInvoices.length === 0 || downloadingTXT}
                  className="w-full sm:w-auto"
                >
                  {downloadingTXT ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      TXT...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      TXT ({selectedInvoices.length})
                    </>
                  )}
                </Button>
                <Button 
                  onClick={async () => {
                    if (selectedInvoices.length === 0) {
                      toast.error('Selecciona al menos un comprobante')
                      return
                    }
                    
                    setDownloadingPDF(true)
                    try {
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
                    } finally {
                      setDownloadingPDF(false)
                    }
                  }}
                  disabled={selectedInvoices.length === 0 || downloadingPDF}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  {downloadingPDF ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      PDF...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      PDF ({selectedInvoices.length})
                    </>
                  )}
                </Button>
          </div>
        </div>

        {/* Mensaje de certificado AFIP requerido */}
        {!isAfipVerified && !isLoadingCert && (
          <AfipCertificateBanner 
            companyId={companyId}
            message="No puedes sincronizar comprobantes desde AFIP sin un certificado activo. Configura tu certificado para acceder a todas las funcionalidades."
          />
        )}

        <div className="space-y-4">
          <div className="space-y-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por número..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 w-full sm:w-auto"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
              )}
            </div>

            {/* Header con seleccionar todos */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg mb-4 p-3 sm:p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Checkbox
                    checked={selectedInvoices.length > 0 && filteredInvoices.some(inv => selectedInvoices.includes(inv.id))}
                    onCheckedChange={handleSelectAll}
                    className="flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-700 truncate">
                      {selectedInvoices.length > 0 
                        ? `${selectedInvoices.length} seleccionado${selectedInvoices.length > 1 ? 's' : ''}`
                        : 'Seleccionar todos'
                      }
                    </div>
                    <div className="text-xs text-gray-500 sm:hidden">
                      {total} total
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500 hidden sm:block flex-shrink-0">
                  {total} comprobante{total !== 1 ? 's' : ''} en total
                </div>
              </div>
            </div>

            {/* Lista de facturas */}
            <div className="space-y-3">
              {paginatedInvoices.map((invoice) => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  companyId={companyId}
                  isSelected={selectedInvoices.includes(invoice.id)}
                  onSelect={handleSelectInvoice}
                  onDownloadPDF={downloadPDF}
                  onDownloadTXT={downloadTXT}
                />
              ))}

              {paginatedInvoices.length === 0 && !isLoading && (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium mb-2">No se encontraron comprobantes</p>
                  <p className="text-sm">Intenta ajustar los filtros o crear un nuevo comprobante</p>
                </div>
              )}
            </div>
            
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 pt-4 border-t border-gray-200 gap-3 sm:gap-0">
                <div className="text-sm text-muted-foreground text-center sm:text-left">
                  Página {currentPage} de {totalPages}
                </div>
                <div className="flex gap-2 justify-center sm:justify-end">
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
                <div className="bg-muted/30 border border-muted p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin" style={{ color: colors.accent }} />
                    <div>
                      <p className="font-medium text-foreground">Sincronizando con AFIP</p>
                      <p className="text-sm text-muted-foreground">{syncProgress}</p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-full h-2 bg-muted">
                    <div className="h-2 rounded-full animate-pulse" style={{ width: '60%', backgroundColor: colors.accent }}></div>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSyncMode('single')}
                  className={`p-3 sm:p-4 border rounded-lg text-left transition-all ${
                    syncMode === 'single' 
                      ? 'bg-muted/30 border-primary' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium mb-1 text-sm sm:text-base">Un comprobante específico</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Consultar por número de comprobante</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSyncMode('date_range')}
                  className={`p-3 sm:p-4 border rounded-lg text-left transition-all ${
                    syncMode === 'date_range' 
                      ? 'bg-muted/30 border-primary' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium mb-1 text-sm sm:text-base">Rango de fechas</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Traer todos los comprobantes de un período</div>
                </button>
              </div>

              {syncMode === 'single' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Punto de Venta *</Label>
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
                      <Label className="text-sm">Tipo *</Label>
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
                      <Label className="text-sm">Número *</Label>
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
                  <div className="bg-muted/30 border border-border p-3 sm:p-4 rounded-lg text-sm space-y-2">
                    <p className="font-medium text-sm sm:text-base">Qué hace la sincronización:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-muted-foreground">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Fecha Desde *</Label>
                      <DatePicker
                        date={syncForm.date_from ? parseDateLocal(syncForm.date_from) || undefined : undefined}
                        onSelect={(date) => setSyncForm({...syncForm, date_from: date ? formatDateToLocal(date) : ''})}
                        placeholder="Seleccionar fecha"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Fecha Hasta *</Label>
                      <DatePicker
                        date={syncForm.date_to ? parseDateLocal(syncForm.date_to) || undefined : undefined}
                        onSelect={(date) => setSyncForm({...syncForm, date_to: date ? formatDateToLocal(date) : ''})}
                        placeholder="Seleccionar fecha"
                        minDate={syncForm.date_from ? parseDateLocal(syncForm.date_from) || undefined : undefined}
                      />
                    </div>
                  </div>
                  <Alert className="border-amber-200 bg-amber-50/50">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-sm">
                      <strong>Límite:</strong> El rango máximo permitido es de 90 días (3 meses).
                    </AlertDescription>
                  </Alert>
                  <div className="bg-muted/30 border border-border p-3 sm:p-4 rounded-lg text-sm space-y-2">
                    <p className="font-medium text-sm sm:text-base">Qué hace la sincronización masiva:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-muted-foreground">
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
                    <p className="text-xs mt-2 font-medium text-muted-foreground">Nota: Este proceso puede tardar varios minutos según la cantidad de comprobantes.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <Card className="p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Encontradas</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{syncResults.imported_count}</p>
                </Card>
                <Card className="p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-muted-foreground">Nuevos Importados</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">
                    {syncResults.invoices?.filter((inv: any) => inv.saved).length || 0}
                  </p>
                </Card>
                <Card className="p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-muted-foreground">Ya Existían</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">
                    {syncResults.invoices?.filter((inv: any) => !inv.saved).length || 0}
                  </p>
                </Card>
              </div>
              
              {syncResults.auto_created_clients > 0 && (
                <div className="bg-amber-50/50 border border-amber-200 p-3 rounded-lg">
                  <p className="text-sm font-medium text-foreground">
                    Se crearon {syncResults.auto_created_clients} clientes archivados
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
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
                              <p className="text-xs text-muted-foreground mt-1">
                                ⚠️ Este comprobante ya se encuentra en tu sistema
                              </p>
                            )}
                          </div>
                          <Badge variant="outline">
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
                          // Reload all invoices in background
                          try {
                            const firstResponse = await invoiceService.getInvoices(companyId, 1, {})
                            const totalPages = firstResponse.last_page || 1
                            
                            const pagePromises = []
                            for (let page = 1; page <= totalPages; page++) {
                              pagePromises.push(invoiceService.getInvoices(companyId, page, {}))
                            }
                            
                            const allResponses = await Promise.all(pagePromises)
                            const allInvoicesData = allResponses.flatMap(response => response.data || [])
                            setAllInvoices(allInvoicesData)
                            
                            const clientMsg = (result.auto_created_clients && result.auto_created_clients > 0) 
                              ? ` Se crearon ${result.auto_created_clients} cliente(s) archivado(s) con datos incompletos que debes completar en Clientes Archivados.`
                              : '';
                            toast.success(`${newInvoices} comprobante${newInvoices > 1 ? 's' : ''} sincronizado${newInvoices > 1 ? 's' : ''} desde AFIP.${clientMsg}`)
                          } catch (error) {
                            console.error('Error reloading invoices:', error)
                            toast.success(`${newInvoices} comprobante${newInvoices > 1 ? 's' : ''} encontrado${newInvoices > 1 ? 's' : ''}`)  
                          }
                        } else {
                          toast.success(`${result.imported_count} comprobante${result.imported_count > 1 ? 's' : ''} encontrado${result.imported_count > 1 ? 's' : ''} en AFIP`, {
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