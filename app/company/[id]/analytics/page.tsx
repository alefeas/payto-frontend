"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, FileText, Clock, Users, BarChart3, PieChart, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import type { Invoice } from "@/types/invoice"
import type { Payment } from "@/types/payment"

// Mock data - en producción vendría de las APIs existentes
const mockInvoices: Invoice[] = [
  {
    id: "1",
    number: "FC-001-00000123",
    type: "A",
    issuerCompanyId: "comp-1",
    receiverCompanyId: "comp-2",
    issueDate: "2024-01-15",
    dueDate: "2024-02-15",
    currency: "ARS",
    subtotal: 100000,
    totalTaxes: 21000,
    totalPerceptions: 0,
    total: 121000,
    status: "pagada",
    items: [],
    taxes: [],
    perceptions: [],
    approvalsRequired: 2,
    approvalsReceived: 2,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
  },
  {
    id: "2", 
    number: "FC-001-00000124",
    type: "B",
    issuerCompanyId: "comp-1",
    receiverCompanyId: "comp-3",
    issueDate: "2024-01-20",
    dueDate: "2024-02-20",
    currency: "ARS",
    subtotal: 85000,
    totalTaxes: 17850,
    totalPerceptions: 0,
    total: 102850,
    status: "pendiente_aprobacion",
    items: [],
    taxes: [],
    perceptions: [],
    approvalsRequired: 2,
    approvalsReceived: 0,
    createdAt: "2024-01-20T14:30:00Z",
    updatedAt: "2024-01-20T14:30:00Z"
  },
  {
    id: "3",
    number: "FC-001-00000125", 
    type: "C",
    issuerCompanyId: "comp-2",
    receiverCompanyId: "comp-1",
    issueDate: "2024-01-10",
    dueDate: "2024-02-10",
    currency: "ARS",
    subtotal: 50000,
    totalTaxes: 10500,
    totalPerceptions: 0,
    total: 60500,
    status: "aprobada",
    items: [],
    taxes: [],
    perceptions: [],
    approvalsRequired: 2,
    approvalsReceived: 2,
    createdAt: "2024-01-10T09:15:00Z",
    updatedAt: "2024-01-10T09:15:00Z"
  }
]

const mockPayments: Payment[] = [
  {
    id: "1",
    invoiceIds: ["FC-001-00000123"],
    payerCompanyId: "comp-2",
    payerCompanyName: "TechCorp SA",
    paymentDate: "2024-01-25",
    method: "transferencia",
    originalAmount: 121000,
    totalRetentions: 2420,
    netAmount: 118580,
    status: "confirmed",
    retentions: [],
    createdAt: "2024-01-25T10:30:00Z"
  }
]

export default function AnalyticsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [invoices] = useState<Invoice[]>(mockInvoices)
  const [payments] = useState<Payment[]>(mockPayments)
  const [selectedPeriod, setSelectedPeriod] = useState("month")

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  // Cálculos de estadísticas en tiempo real
  const analytics = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // Filtrar por período seleccionado
    const filterByPeriod = (date: string) => {
      const itemDate = new Date(date)
      if (selectedPeriod === "month") {
        return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear
      } else if (selectedPeriod === "quarter") {
        const quarter = Math.floor(currentMonth / 3)
        const itemQuarter = Math.floor(itemDate.getMonth() / 3)
        return itemQuarter === quarter && itemDate.getFullYear() === currentYear
      } else {
        return itemDate.getFullYear() === currentYear
      }
    }

    // Facturas emitidas (ingresos)
    const issuedInvoices = invoices.filter(inv => inv.issuerCompanyId === companyId)
    const periodIssuedInvoices = issuedInvoices.filter(inv => filterByPeriod(inv.issueDate))
    
    // Facturas recibidas (gastos)
    const receivedInvoices = invoices.filter(inv => inv.receiverCompanyId === companyId)
    const periodReceivedInvoices = receivedInvoices.filter(inv => filterByPeriod(inv.issueDate))

    // Pagos realizados y recibidos
    const periodPayments = payments.filter(pay => filterByPeriod(pay.paymentDate))
    const receivedPayments = periodPayments.filter(pay => 
      issuedInvoices.some(inv => pay.invoiceIds.includes(inv.number))
    )
    const madePayments = periodPayments.filter(pay => 
      receivedInvoices.some(inv => pay.invoiceIds.includes(inv.number))
    )

    return {
      // Ingresos
      totalRevenue: periodIssuedInvoices.reduce((sum, inv) => sum + inv.total, 0),
      paidRevenue: receivedPayments.reduce((sum, pay) => sum + pay.netAmount, 0),
      pendingRevenue: periodIssuedInvoices
        .filter(inv => inv.status === "pendiente_aprobacion" || inv.status === "aprobada")
        .reduce((sum, inv) => sum + inv.total, 0),
      
      // Gastos
      totalExpenses: periodReceivedInvoices.reduce((sum, inv) => sum + inv.total, 0),
      paidExpenses: madePayments.reduce((sum, pay) => sum + pay.originalAmount, 0),
      pendingExpenses: periodReceivedInvoices
        .filter(inv => inv.status === "pendiente_aprobacion" || inv.status === "aprobada")
        .reduce((sum, inv) => sum + inv.total, 0),

      // Contadores
      issuedCount: periodIssuedInvoices.length,
      receivedCount: periodReceivedInvoices.length,
      paidInvoicesCount: receivedPayments.length,
      pendingInvoicesCount: periodIssuedInvoices.filter(inv => inv.status === "pendiente_aprobacion").length,
      
      // Retenciones
      totalRetentions: receivedPayments.reduce((sum, pay) => sum + pay.totalRetentions, 0),
      
      // Clientes únicos
      uniqueClients: new Set(periodIssuedInvoices.map(inv => inv.receiverCompanyId)).size,
      uniqueProviders: new Set(periodReceivedInvoices.map(inv => inv.issuerCompanyId)).size,

      // Promedio de días de pago
      avgPaymentDays: receivedPayments.length > 0 
        ? receivedPayments.reduce((sum, pay) => {
            const invoice = issuedInvoices.find(inv => pay.invoiceIds.includes(inv.number))
            if (invoice) {
              const issueDate = new Date(invoice.issueDate)
              const paymentDate = new Date(pay.paymentDate)
              return sum + Math.ceil((paymentDate.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24))
            }
            return sum
          }, 0) / receivedPayments.length
        : 0
    }
  }, [invoices, payments, companyId, selectedPeriod])

  const netCashFlow = analytics.paidRevenue - analytics.paidExpenses
  const profitMargin = analytics.totalRevenue > 0 ? ((analytics.totalRevenue - analytics.totalExpenses) / analytics.totalRevenue) * 100 : 0

  if (authLoading) return null
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push(`/company/${companyId}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Estadísticas y Análisis</h1>
              <p className="text-muted-foreground">Dashboard financiero en tiempo real</p>
            </div>
          </div>
          
          <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <TabsList>
              <TabsTrigger value="month">Este Mes</TabsTrigger>
              <TabsTrigger value="quarter">Trimestre</TabsTrigger>
              <TabsTrigger value="year">Año</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${analytics.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics.issuedCount} facturas emitidas
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Gastos Totales</p>
                  <p className="text-2xl font-bold text-red-600">
                    ${analytics.totalExpenses.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics.receivedCount} facturas recibidas
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Flujo de Caja Neto</p>
                  <p className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${netCashFlow.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cobrado - Pagado
                  </p>
                </div>
                <DollarSign className={`h-8 w-8 ${netCashFlow >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Margen de Ganancia</p>
                  <p className={`text-2xl font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profitMargin.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Rentabilidad bruta
                  </p>
                </div>
                <BarChart3 className={`h-8 w-8 ${profitMargin >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Estado de Cobros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Estado de Cobros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-green-800">Cobrado</p>
                  <p className="text-sm text-green-600">{analytics.paidInvoicesCount} facturas</p>
                </div>
                <p className="text-lg font-bold text-green-700">
                  ${analytics.paidRevenue.toLocaleString()}
                </p>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-yellow-800">Pendiente</p>
                  <p className="text-sm text-yellow-600">{analytics.pendingInvoicesCount} facturas</p>
                </div>
                <p className="text-lg font-bold text-yellow-700">
                  ${analytics.pendingRevenue.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-800">Retenciones</p>
                  <p className="text-sm text-blue-600">Aplicadas en pagos</p>
                </div>
                <p className="text-lg font-bold text-blue-700">
                  ${analytics.totalRetentions.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Métricas Operativas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Métricas Operativas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Users className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-700">{analytics.uniqueClients}</p>
                  <p className="text-sm text-purple-600">Clientes Activos</p>
                </div>
                
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <FileText className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-700">{analytics.uniqueProviders}</p>
                  <p className="text-sm text-orange-600">Proveedores</p>
                </div>
              </div>

              <div className="p-3 bg-indigo-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-indigo-500" />
                    <span className="font-medium text-indigo-800">Tiempo Promedio de Cobro</span>
                  </div>
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                    {Math.round(analytics.avgPaymentDays)} días
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-gray-50 rounded text-center">
                  <p className="font-medium">Tasa de Cobro</p>
                  <p className="text-lg font-bold">
                    {analytics.totalRevenue > 0 
                      ? ((analytics.paidRevenue / analytics.totalRevenue) * 100).toFixed(1)
                      : 0}%
                  </p>
                </div>
                <div className="p-2 bg-gray-50 rounded text-center">
                  <p className="font-medium">Eficiencia</p>
                  <p className="text-lg font-bold">
                    {analytics.issuedCount > 0 
                      ? ((analytics.paidInvoicesCount / analytics.issuedCount) * 100).toFixed(1)
                      : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumen Ejecutivo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-indigo-500" />
              Resumen Ejecutivo
            </CardTitle>
            <CardDescription>
              Análisis automático basado en los datos del período seleccionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700">Fortalezas</h4>
                <ul className="text-sm space-y-1">
                  {netCashFlow > 0 && <li>• Flujo de caja positivo</li>}
                  {analytics.avgPaymentDays < 30 && <li>• Cobros rápidos (&lt; 30 días)</li>}
                  {profitMargin > 20 && <li>• Margen saludable (&gt; 20%)</li>}
                  {analytics.uniqueClients > 5 && <li>• Base diversificada de clientes</li>}
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-yellow-700">Oportunidades</h4>
                <ul className="text-sm space-y-1">
                  {analytics.pendingRevenue > analytics.paidRevenue && <li>• Acelerar cobros pendientes</li>}
                  {analytics.avgPaymentDays > 45 && <li>• Mejorar términos de pago</li>}
                  {analytics.uniqueClients < 10 && <li>• Expandir base de clientes</li>}
                  <li>• Optimizar retenciones fiscales</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-red-700">Alertas</h4>
                <ul className="text-sm space-y-1">
                  {netCashFlow < 0 && <li>• Flujo de caja negativo</li>}
                  {profitMargin < 10 && <li>• Margen bajo (&lt; 10%)</li>}
                  {analytics.pendingInvoicesCount > analytics.paidInvoicesCount && <li>• Muchas facturas pendientes</li>}
                  {analytics.avgPaymentDays > 60 && <li>• Cobros muy lentos (&gt; 60 días)</li>}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}