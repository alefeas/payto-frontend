"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Calendar, AlertTriangle, Clock, FileText, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"

const mockDueInvoices = [
  {
    id: "1",
    number: "FC-001-00000123",
    clientCompany: "TechCorp SA",
    issueDate: "2024-01-15",
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    total: 121000,
    currency: "ARS",
    status: "vencida",
    daysOverdue: 2
  },
  {
    id: "2",
    number: "FC-001-00000124",
    clientCompany: "StartupXYZ",
    issueDate: "2024-01-20",
    dueDate: new Date().toISOString().split('T')[0],
    total: 85000,
    currency: "ARS",
    status: "vence_hoy",
    daysUntilDue: 0
  },
  {
    id: "3",
    number: "FC-001-00000125",
    clientCompany: "Consulting LLC",
    issueDate: "2024-01-25",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    total: 50000,
    currency: "ARS",
    status: "proximo",
    daysUntilDue: 3
  },
  {
    id: "4",
    number: "FC-001-00000126",
    clientCompany: "Digital Solutions",
    issueDate: "2024-02-01",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    total: 200000,
    currency: "ARS",
    status: "proximo",
    daysUntilDue: 7
  },
  {
    id: "5",
    number: "FC-001-00000127",
    clientCompany: "Innovation Corp",
    issueDate: "2024-02-05",
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    total: 150000,
    currency: "ARS",
    status: "proximo",
    daysUntilDue: 15
  }
]

export default function DueInvoicesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [selectedTab, setSelectedTab] = useState("all")

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  const overdueInvoices = mockDueInvoices.filter(inv => inv.status === "vencida")
  const todayInvoices = mockDueInvoices.filter(inv => inv.status === "vence_hoy")
  const upcomingInvoices = mockDueInvoices.filter(inv => inv.status === "proximo")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "vencida":
        return <Badge className="bg-red-500 text-white">Vencida</Badge>
      case "vence_hoy":
        return <Badge className="bg-orange-500 text-white">Vence Hoy</Badge>
      case "proximo":
        return <Badge className="bg-blue-500 text-white">Próximo</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredInvoices = selectedTab === "all" 
    ? mockDueInvoices 
    : selectedTab === "overdue"
    ? overdueInvoices
    : selectedTab === "today"
    ? todayInvoices
    : upcomingInvoices

  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0)
  const totalToday = todayInvoices.reduce((sum, inv) => sum + inv.total, 0)
  const totalUpcoming = upcomingInvoices.reduce((sum, inv) => sum + inv.total, 0)

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
            <h1 className="text-3xl font-bold">Vencimientos de Facturas</h1>
            <p className="text-muted-foreground">Control de fechas de vencimiento y cobros pendientes</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <Clock className="h-4 w-4 inline mr-2" />
            El sistema envía recordatorios automáticos 7 días antes, 3 días antes y el día del vencimiento.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Facturas por Vencer</CardTitle>
            <CardDescription>Gestiona los vencimientos y realiza seguimiento de cobros</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">Todas ({mockDueInvoices.length})</TabsTrigger>
                <TabsTrigger value="overdue">Vencidas ({overdueInvoices.length})</TabsTrigger>
                <TabsTrigger value="today">Hoy ({todayInvoices.length})</TabsTrigger>
                <TabsTrigger value="upcoming">Próximas ({upcomingInvoices.length})</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab} className="space-y-4 mt-6">
                {filteredInvoices.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay facturas en esta categoría</p>
                  </div>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <div key={invoice.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4" />
                            <span className="font-medium">{invoice.number}</span>
                            {getStatusBadge(invoice.status)}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {invoice.clientCompany}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Vence: {new Date(invoice.dueDate).toLocaleDateString('es-AR')}
                            </div>
                            {invoice.status === "vencida" && (
                              <span className="text-red-600 font-medium">
                                {invoice.daysOverdue} días de atraso
                              </span>
                            )}
                            {invoice.status === "vence_hoy" && (
                              <span className="text-orange-600 font-medium">
                                Vence hoy
                              </span>
                            )}
                            {invoice.status === "proximo" && (
                              <span className="text-blue-600">
                                Faltan {invoice.daysUntilDue} días
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right space-y-2">
                          <p className="text-2xl font-bold">
                            ${invoice.total.toLocaleString()} {invoice.currency}
                          </p>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => router.push(`/company/${companyId}/invoices/${invoice.id}`)}
                          >
                            Ver Detalles
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
