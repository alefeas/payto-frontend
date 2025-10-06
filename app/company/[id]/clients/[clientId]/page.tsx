"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, FileText, Calendar, Eye, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Client } from "@/types/client"

// Mock data
const mockClient: Client = {
  id: "1",
  companyId: "TC8X9K2L",
  documentType: "CUIT",
  documentNumber: "20-12345678-9",
  businessName: "Distribuidora El Sol SRL",
  email: "contacto@elsol.com.ar",
  phone: "+54 11 4567-8901",
  address: "Av. Corrientes 1234, CABA",
  taxCondition: "RI",
  isCompanyConnection: false,
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-15T10:00:00Z"
}

const mockInvoices = [
  {
    id: "1",
    type: "A",
    number: "00001-00000123",
    issueDate: "2024-03-15",
    dueDate: "2024-04-15",
    total: 125000,
    status: "paid"
  },
  {
    id: "2",
    type: "A",
    number: "00001-00000145",
    issueDate: "2024-03-20",
    dueDate: "2024-04-20",
    total: 87500,
    status: "pending"
  },
  {
    id: "3",
    type: "A",
    number: "00001-00000167",
    issueDate: "2024-03-25",
    dueDate: "2024-04-25",
    total: 156000,
    status: "pending"
  }
]

const statusLabels = {
  paid: "Pagada",
  pending: "Pendiente",
  overdue: "Vencida",
  rejected: "Rechazada"
}

const statusColors = {
  paid: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  overdue: "bg-red-100 text-red-800",
  rejected: "bg-gray-100 text-gray-800"
}

export default function ClientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string
  const clientId = params.clientId as string

  const [client] = useState(mockClient)
  const [invoices] = useState(mockInvoices)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.type.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === "all" || invoice.status === filterStatus

    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push(`/company/${companyId}/clients`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{client.businessName || `${client.firstName} ${client.lastName}`}</h1>
            <p className="text-muted-foreground">{client.documentType}: {client.documentNumber}</p>
          </div>
          <Button onClick={() => router.push(`/company/${companyId}/emit-invoice?clientId=${clientId}`)}>
            <FileText className="h-4 w-4 mr-2" />
            Nueva Factura
          </Button>
        </div>

        {/* Client Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Condición IVA</p>
                <p className="font-medium">{client.taxCondition}</p>
              </div>
              {client.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{client.email}</p>
                </div>
              )}
              {client.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{client.phone}</p>
                </div>
              )}
              {client.address && (
                <div>
                  <p className="text-sm text-muted-foreground">Domicilio</p>
                  <p className="font-medium">{client.address}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>



        {/* Search and Filters */}
        <Card>
          <CardContent className="!p-2">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número o tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Estado:</span>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="paid">Pagadas</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="overdue">Vencidas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Facturas ({filteredInvoices.length})</CardTitle>
            <CardDescription>
              Todas las facturas emitidas a este cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredInvoices.map((invoice) => (
                <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      {/* Invoice Info */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="bg-blue-100 text-blue-800 font-bold px-3 py-2 rounded">
                          {invoice.type}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{invoice.number}</p>
                            <Badge className={statusColors[invoice.status as keyof typeof statusColors]}>
                              {statusLabels[invoice.status as keyof typeof statusLabels]}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Emisión: {new Date(invoice.issueDate).toLocaleDateString('es-AR')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Vencimiento: {new Date(invoice.dueDate).toLocaleDateString('es-AR')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Amount and Action */}
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-2xl font-bold">${invoice.total.toLocaleString('es-AR')}</p>
                          <p className="text-xs text-muted-foreground">ARS</p>
                        </div>
                        <Button variant="default" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
