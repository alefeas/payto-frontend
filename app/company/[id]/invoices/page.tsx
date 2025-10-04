"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Search, Filter, Download, Eye, MoreHorizontal, Calendar, Building2, DollarSign, FileDown, CheckSquare, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

// Mock invoices data
const mockInvoices = [
  {
    id: "1",
    number: "FC-001-00000123",
    type: "A",
    clientCompany: "TechCorp SA",
    issueDate: "2024-01-15",
    dueDate: "2024-02-15",
    subtotal: 100000,
    taxes: 21000,
    total: 121000,
    currency: "ARS",
    status: "aprobada",
    paymentStatus: "pendiente",
    invoiceType: "venta" // Factura emitida por nosotros
  },
  {
    id: "2",
    number: "FC-001-00000124",
    type: "B",
    clientCompany: "StartupXYZ",
    issueDate: "2024-01-20",
    dueDate: "2024-02-20",
    subtotal: 85000,
    taxes: 17850,
    total: 102850,
    currency: "ARS",
    status: "pendiente_aprobacion",
    paymentStatus: "pendiente",
    invoiceType: "venta"
  },
  {
    id: "3",
    number: "FC-001-00000125",
    type: "A",
    clientCompany: "Consulting LLC",
    issueDate: "2024-01-10",
    dueDate: "2024-02-10",
    subtotal: 150000,
    taxes: 31500,
    total: 181500,
    currency: "ARS",
    status: "emitida",
    paymentStatus: "pagada",
    invoiceType: "venta"
  },
  {
    id: "4",
    number: "FC-001-00000126",
    type: "C",
    clientCompany: "MicroEmpresa SRL",
    issueDate: "2024-01-25",
    dueDate: "2024-02-25",
    subtotal: 45000,
    taxes: 0,
    total: 45000,
    currency: "ARS",
    status: "emitida",
    paymentStatus: "vencida",
    invoiceType: "compra" // Factura recibida de proveedor
  },
  {
    id: "5",
    number: "FC-001-00000127",
    type: "A",
    clientCompany: "GlobalTech Inc",
    issueDate: "2024-01-22",
    dueDate: "2024-02-22",
    subtotal: 200000,
    taxes: 42000,
    total: 242000,
    currency: "USD",
    status: "emitida",
    paymentStatus: "pendiente",
    invoiceType: "venta"
  }
]

type InvoiceStatus = "emitida" | "pendiente_aprobacion" | "aprobada" | "rechazada"
type PaymentStatus = "pendiente" | "pagada" | "vencida" | "parcial"

export default function InvoicesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState<string>("all")
  const [dateFromFilter, setDateFromFilter] = useState<string>("")
  const [dateToFilter, setDateToFilter] = useState<string>("")
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  const filteredInvoices = useMemo(() => {
    return mockInvoices.filter(invoice => {
      const matchesSearch = 
        invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clientCompany.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
      const matchesPayment = paymentFilter === "all" || invoice.paymentStatus === paymentFilter
      const matchesType = typeFilter === "all" || invoice.type === typeFilter
      const matchesInvoiceType = invoiceTypeFilter === "all" || invoice.invoiceType === invoiceTypeFilter
      
      let matchesDateRange = true
      if (dateFromFilter || dateToFilter) {
        const issueDate = new Date(invoice.issueDate)
        if (dateFromFilter) {
          matchesDateRange = matchesDateRange && issueDate >= new Date(dateFromFilter)
        }
        if (dateToFilter) {
          matchesDateRange = matchesDateRange && issueDate <= new Date(dateToFilter)
        }
      }
      
      return matchesSearch && matchesStatus && matchesPayment && matchesType && matchesInvoiceType && matchesDateRange
    })
  }, [searchTerm, statusFilter, paymentFilter, typeFilter, invoiceTypeFilter, dateFromFilter, dateToFilter])

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'emitida':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Emitida</Badge>
      case 'pendiente_aprobacion':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendiente Aprobación</Badge>
      case 'aprobada':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Aprobada</Badge>
      case 'rechazada':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rechazada</Badge>
    }
  }

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'pendiente':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case 'pagada':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Pagada</Badge>
      case 'vencida':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Vencida</Badge>
      case 'parcial':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Parcial</Badge>
    }
  }

  const handleDownloadInvoice = (invoiceId: string) => {
    const invoice = mockInvoices.find(inv => inv.id === invoiceId)
    toast.success('Descarga iniciada', {
      description: `PDF de ${invoice?.number}`
    })
  }

  const handleDownloadTxt = (invoiceId: string) => {
    const invoice = mockInvoices.find(inv => inv.id === invoiceId)
    toast.success('Descarga iniciada', {
      description: `TXT para AFIP/ARCA de ${invoice?.number}`
    })
  }

  const handleViewDetails = (invoiceId: string) => {
    router.push(`/company/${companyId}/invoices/${invoiceId}`)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setPaymentFilter("all")
    setTypeFilter("all")
    setInvoiceTypeFilter("all")
    setDateFromFilter("")
    setDateToFilter("")
  }

  const toggleInvoiceSelection = (invoiceId: string) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    )
  }

  const selectAllInvoices = () => {
    setSelectedInvoices(filteredInvoices.map(inv => inv.id))
  }

  const clearSelection = () => {
    setSelectedInvoices([])
    setIsSelectionMode(false)
  }

  const handleBulkTxtDownload = () => {
    if (selectedInvoices.length === 0) {
      toast.error('Selecciona al menos una factura')
      return
    }
    
    toast.success('Generando TXT masivo', {
      description: `Procesando ${selectedInvoices.length} facturas para AFIP/ARCA`
    })
    
    setTimeout(() => {
      toast.success('TXT masivo generado', {
        description: `Archivo con ${selectedInvoices.length} facturas listo para descarga`
      })
    }, 2000)
  }

  const handleBulkPdfDownload = () => {
    if (selectedInvoices.length === 0) {
      toast.error('Selecciona al menos una factura')
      return
    }
    
    toast.success('Generando ZIP con PDFs', {
      description: `Comprimiendo ${selectedInvoices.length} facturas en PDF`
    })
  }



  const stats = {
    total: mockInvoices.length,
    pending: mockInvoices.filter(inv => inv.paymentStatus === 'pendiente').length,
    paid: mockInvoices.filter(inv => inv.paymentStatus === 'pagada').length,
    overdue: mockInvoices.filter(inv => inv.paymentStatus === 'vencida').length
  }

  if (authLoading) return null
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/company/${companyId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Ver Facturas</h1>
            <p className="text-muted-foreground">Gestionar todas las facturas de la empresa</p>
          </div>
          <div className="flex gap-2">
            {!isSelectionMode ? (
              <>
                <Button 
                  variant="default" 
                  size="lg"
                  onClick={() => setIsSelectionMode(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <CheckSquare className="h-5 w-5 mr-2" />
                  Seleccionar Facturas
                </Button>
                <Button onClick={() => router.push(`/company/${companyId}/create-invoice`)}>
                  Emitir Nueva Factura
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={selectAllInvoices}
                  disabled={filteredInvoices.length === 0}
                >
                  Seleccionar Todas
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleBulkTxtDownload}
                  disabled={selectedInvoices.length === 0}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  TXT AFIP ({selectedInvoices.length})
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleBulkPdfDownload}
                  disabled={selectedInvoices.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  ZIP PDFs
                </Button>

                <Button 
                  variant="outline" 
                  onClick={clearSelection}
                >
                  Cancelar
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pagadas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Vencidas</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                </div>
                <Calendar className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Búsqueda y Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Primera fila de filtros */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                {/* Search */}
                <div className="md:col-span-2 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por número o cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Invoice Type Filter */}
                <Select value={invoiceTypeFilter} onValueChange={setInvoiceTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Venta/Compra" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Ventas y Compras</SelectItem>
                    <SelectItem value="venta">Ventas (Emitidas)</SelectItem>
                    <SelectItem value="compra">Compras (Recibidas)</SelectItem>
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="emitida">Emitida</SelectItem>
                    <SelectItem value="pendiente_aprobacion">Pendiente Aprobación</SelectItem>
                    <SelectItem value="aprobada">Aprobada</SelectItem>
                    <SelectItem value="rechazada">Rechazada</SelectItem>
                  </SelectContent>
                </Select>

                {/* Payment Filter */}
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los pagos</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="pagada">Pagada</SelectItem>
                    <SelectItem value="vencida">Vencida</SelectItem>
                    <SelectItem value="parcial">Parcial</SelectItem>
                  </SelectContent>
                </Select>

                {/* Type Filter */}
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="A">Factura A</SelectItem>
                    <SelectItem value="B">Factura B</SelectItem>
                    <SelectItem value="C">Factura C</SelectItem>
                    <SelectItem value="E">Factura E</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Segunda fila - Rango de fechas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha desde:</label>
                  <Input
                    type="date"
                    value={dateFromFilter}
                    onChange={(e) => setDateFromFilter(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha hasta:</label>
                  <Input
                    type="date"
                    value={dateToFilter}
                    onChange={(e) => setDateToFilter(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Limpiar Filtros
                  </Button>
                </div>
              </div>
            </div>
            
            {(searchTerm || statusFilter !== "all" || paymentFilter !== "all" || typeFilter !== "all" || invoiceTypeFilter !== "all" || dateFromFilter || dateToFilter || isSelectionMode) && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Mostrando {filteredInvoices.length} de {mockInvoices.length} facturas
                  {isSelectionMode && selectedInvoices.length > 0 && (
                    <span className="ml-2 text-blue-600 font-medium">
                      • {selectedInvoices.length} seleccionadas
                    </span>
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selection Mode Banner */}
        {isSelectionMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckSquare className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">
                    Modo Selección Activo
                  </p>
                  <p className="text-sm text-blue-700">
                    Haz clic en las facturas para seleccionarlas y usar las acciones masivas
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-900">
                  {selectedInvoices.length} seleccionadas
                </p>
                <p className="text-sm text-blue-700">
                  de {filteredInvoices.length} facturas
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Invoices List */}
        <Card>
          <CardHeader>
            <CardTitle>Facturas ({filteredInvoices.length})</CardTitle>
            <CardDescription>Lista de todas las facturas filtradas</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No se encontraron facturas</p>
                <p className="text-sm">Intenta ajustar los filtros o crear una nueva factura</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInvoices.map((invoice) => (
                  <div 
                    key={invoice.id} 
                    className={`border rounded-lg p-4 transition-colors ${
                      isSelectionMode ? 'cursor-pointer' : 'hover:bg-muted/50'
                    } ${
                      selectedInvoices.includes(invoice.id) ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={isSelectionMode ? () => toggleInvoiceSelection(invoice.id) : undefined}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-2 flex-1">
                        {isSelectionMode && (
                          <div className="mt-0.5">
                            {selectedInvoices.includes(invoice.id) ? (
                              <CheckSquare className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Square className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        )}
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-lg">{invoice.number}</span>
                            <Badge variant="outline">Tipo {invoice.type}</Badge>
                            {getStatusBadge(invoice.status as InvoiceStatus)}
                            {getPaymentBadge(invoice.paymentStatus as PaymentStatus)}
                          </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {invoice.clientCompany}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Emitida: {new Date(invoice.issueDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Vence: {new Date(invoice.dueDate).toLocaleDateString()}
                          </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            ${invoice.total.toLocaleString()} {invoice.currency}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Subtotal: ${invoice.subtotal.toLocaleString()}
                          </p>
                        </div>
                        
                        {!isSelectionMode && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(invoice.id)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownloadInvoice(invoice.id)}>
                                <Download className="h-4 w-4 mr-2" />
                                Descargar PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownloadTxt(invoice.id)}>
                                <FileDown className="h-4 w-4 mr-2" />
                                Descargar TXT AFIP
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}