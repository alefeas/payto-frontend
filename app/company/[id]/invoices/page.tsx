"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, FileText, Download, Filter, Search, CheckSquare, Square, Eye, ExternalLink, Loader2 } from "lucide-react"
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

export default function InvoicesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [invoices, setInvoices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
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

  useEffect(() => {
    const loadInvoices = async () => {
      if (!companyId) return
      
      setIsLoading(true)
      try {
        const response = await invoiceService.getInvoices(companyId)
        setInvoices(response.data || [])
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
  }, [isAuthenticated, companyId])

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
      badges.push(<Badge key="status" className="bg-green-500 text-white">Pagada</Badge>)
    } else if (invoice.status === 'cancelled') {
      badges.push(<Badge key="status" className="bg-gray-100 text-gray-800">Anulada</Badge>)
    } else if (invoice.status === 'partially_cancelled') {
      badges.push(<Badge key="status" className="bg-orange-100 text-orange-800">Parc. Anulada</Badge>)
    }
    
    return <div className="flex gap-1.5 flex-wrap items-center">{badges}</div>
  }

  const filteredInvoices = getFilteredInvoices()

  if (authLoading || isLoading) {
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
              <span>Facturas Emitidas</span>
              <div className="flex gap-2">
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
                      {parseFloat(invoice.total).toLocaleString('es-AR', { style: 'currency', currency: invoice.currency })}
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}