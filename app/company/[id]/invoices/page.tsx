"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, FileText, Download, Filter, Search, CheckSquare, Square, Eye, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

const mockInvoices = [
  {
    id: "1",
    number: "FC-001-00000123",
    type: "A",
    issuerCompany: "Mi Empresa",
    receiverCompany: "TechCorp SA",
    issueDate: "2024-01-15",
    dueDate: "2024-02-15",
    total: 121000,
    currency: "ARS",
    status: "emitida"
  },
  {
    id: "2", 
    number: "FC-001-00000124",
    type: "B",
    issuerCompany: "Mi Empresa",
    receiverCompany: "StartupXYZ",
    issueDate: "2024-01-20",
    dueDate: "2024-02-20",
    total: 85000,
    currency: "ARS", 
    status: "pagada"
  },
  {
    id: "3",
    number: "FC-001-00000125",
    type: "C",
    issuerCompany: "Mi Empresa",
    receiverCompany: "Consulting LLC",
    issueDate: "2024-01-25",
    dueDate: "2024-02-25",
    total: 50000,
    currency: "ARS",
    status: "vencida"
  },
  {
    id: "4",
    number: "FC-001-00000126",
    type: "E",
    issuerCompany: "Mi Empresa",
    receiverCompany: "TechCorp SA",
    issueDate: "2024-02-01",
    dueDate: "2024-03-01",
    total: 200000,
    currency: "ARS",
    status: "pendiente"
  },
  {
    id: "5",
    number: "FC-001-00000127",
    type: "A",
    issuerCompany: "Mi Empresa",
    receiverCompany: "Digital Solutions",
    issueDate: "2024-02-05",
    dueDate: "2024-03-05",
    total: 150000,
    currency: "ARS",
    status: "emitida"
  }
]

export default function InvoicesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [invoices] = useState(mockInvoices)
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [dateFromFilter, setDateFromFilter] = useState("")
  const [dateToFilter, setDateToFilter] = useState("")
  const [clientFilter, setClientFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

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
      const matchesSearch = invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.receiverCompany.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
      const matchesType = typeFilter === "all" || invoice.type === typeFilter
      const matchesClient = clientFilter === "all" || invoice.receiverCompany === clientFilter
      
      let matchesDateRange = true
      if (dateFromFilter) {
        matchesDateRange = matchesDateRange && new Date(invoice.issueDate) >= new Date(dateFromFilter)
      }
      if (dateToFilter) {
        matchesDateRange = matchesDateRange && new Date(invoice.issueDate) <= new Date(dateToFilter)
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

  const uniqueClients = [...new Set(invoices.map(inv => inv.receiverCompany))]

  const downloadSelectedTXT = () => {
    if (selectedInvoices.length === 0) {
      toast.error('Selecciona al menos una factura')
      return
    }
    
    toast.success(`Descargando ${selectedInvoices.length} archivos TXT`, {
      description: 'Los archivos se están preparando para descarga'
    })
  }

  const downloadPDF = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId)
    toast.success(`Descargando PDF de ${invoice?.number}`, {
      description: 'El archivo PDF se está descargando'
    })
  }

  const downloadTXT = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId)
    toast.success(`Descargando TXT de ${invoice?.number}`, {
      description: 'Archivo TXT para AFIP/ARCA'
    })
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      emitida: "bg-blue-100 text-blue-800",
      pagada: "bg-green-100 text-green-800", 
      vencida: "bg-red-100 text-red-800",
      pendiente: "bg-yellow-100 text-yellow-800"
    }
    return <Badge variant="secondary" className={variants[status as keyof typeof variants]}>{status}</Badge>
  }

  const filteredInvoices = getFilteredInvoices()

  if (authLoading) return null
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
              <span>Facturas Emitidas</span>
              <div className="flex gap-2">
                <Button 
                  onClick={downloadSelectedTXT}
                  disabled={selectedInvoices.length === 0}
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar TXT ({selectedInvoices.length})
                </Button>
                <Button 
                  onClick={() => {
                    if (selectedInvoices.length === 0) {
                      toast.error('Selecciona al menos una factura')
                      return
                    }
                    toast.success(`Descargando ${selectedInvoices.length} PDFs`, {
                      description: 'Los archivos PDF se están preparando'
                    })
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
                          <SelectItem value="emitida">Emitida</SelectItem>
                          <SelectItem value="pagada">Pagada</SelectItem>
                          <SelectItem value="vencida">Vencida</SelectItem>
                          <SelectItem value="pendiente">Pendiente</SelectItem>
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
                          <SelectItem value="A">Tipo A</SelectItem>
                          <SelectItem value="B">Tipo B</SelectItem>
                          <SelectItem value="C">Tipo C</SelectItem>
                          <SelectItem value="E">Tipo E</SelectItem>
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
                      <Input
                        type="date"
                        value={dateFromFilter}
                        onChange={(e) => setDateFromFilter(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Fecha Hasta</Label>
                      <Input
                        type="date"
                        value={dateToFilter}
                        onChange={(e) => setDateToFilter(e.target.value)}
                        min={dateFromFilter}
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

              {filteredInvoices.map((invoice) => (
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
                  <div>{invoice.receiverCompany}</div>
                  <div>{new Date(invoice.issueDate).toLocaleDateString()}</div>
                  <div className="font-medium">
                    {invoice.total.toLocaleString('es-AR', { style: 'currency', currency: invoice.currency })}
                  </div>
                  <div>{getStatusBadge(invoice.status)}</div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => router.push(`/company/${companyId}/invoices/${invoice.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => downloadPDF(invoice.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => downloadTXT(invoice.id)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {filteredInvoices.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No se encontraron facturas</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}