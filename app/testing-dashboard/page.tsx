"use client"

import { useState } from "react"
import { 
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { colors, fontSizes } from "@/styles"
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts"

type TimeFilter = '24h' | '7d' | '28d' | '3m' | '12m' | 'all'

export default function TestingDashboardPage() {
  // Time filter state
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<TimeFilter>('28d')

  // Function to generate activity data based on time filter
  const generateActivityData = (filter: TimeFilter) => {
    let dataPoints = 28
    let labelFormat = 'day'
    
    switch (filter) {
      case '24h':
        dataPoints = 24
        labelFormat = 'hour'
        break
      case '7d':
        dataPoints = 7
        labelFormat = 'day'
        break
      case '28d':
        dataPoints = 28
        labelFormat = 'day'
        break
      case '3m':
        dataPoints = 12 // weeks
        labelFormat = 'week'
        break
      case '12m':
        dataPoints = 12
        labelFormat = 'month'
        break
      case 'all':
        dataPoints = 24 // months
        labelFormat = 'month'
        break
    }
    
    return Array.from({ length: dataPoints }, (_, i) => {
      const index = i + 1
      // Generate realistic fluctuating data
      const baseFacturacion = 15000 + Math.sin(index / 5) * 5000 + Math.random() * 3000
      const baseFacturasPagar = 10000 + Math.cos(index / 4) * 4000 + Math.random() * 2000
      
      let label = ''
      if (labelFormat === 'hour') {
        label = `${index}:00`
      } else if (labelFormat === 'day') {
        label = index.toString()
      } else if (labelFormat === 'week') {
        label = `S${index}`
      } else {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        label = months[(i) % 12]
      }
      
      return {
        label,
        facturacion: Math.round(baseFacturacion),
        facturasPagar: Math.round(baseFacturasPagar)
      }
    })
  }

  const activityData = generateActivityData(selectedTimeFilter)

  // Calculate KPI values based on time filter
  const getKPIMultiplier = (filter: TimeFilter) => {
    switch (filter) {
      case '24h':
        return 0.03 // 1 day of data
      case '7d':
        return 0.25
      case '28d':
        return 1
      case '3m':
        return 3
      case '12m':
        return 12
      case 'all':
        return 24
      default:
        return 1
    }
  }

  const kpiMultiplier = getKPIMultiplier(selectedTimeFilter)
  const baseAmountReceivable = 124530
  const baseAmountPayable = 15195
  const baseVATBalance = 8750

  // Mock companies data
  const mockCompanies = [
    { id: "1", name: "Empresa Demo 1", role: "administrator", isActive: true },
    { id: "2", name: "Empresa Demo 2", role: "member", isActive: true },
    { id: "3", name: "Empresa Demo 3", role: "administrator", isActive: false },
  ]

  // Pagination states
  const [currentPageToPay, setCurrentPageToPay] = useState(0)
  const [currentPageToCollect, setCurrentPageToCollect] = useState(0)
  const [currentPageTasks, setCurrentPageTasks] = useState(0)
  const itemsPerPage = 3
  const tasksPerPage = 5

  // Mock invoices to pay (facturas a pagar) - Extended list
  const allInvoicesToPay = [
    { id: "1", supplier: "Proveedor Industrial SA", invoiceNumber: "FC-001-00012345", dueDate: "15/11/2025", amount: "$12,500.00" },
    { id: "2", supplier: "Servicios Logísticos SRL", invoiceNumber: "FC-001-00012346", dueDate: "18/11/2025", amount: "$8,300.00" },
    { id: "3", supplier: "Materiales del Norte", invoiceNumber: "FC-001-00012347", dueDate: "20/11/2025", amount: "$5,750.00" },
    { id: "4", supplier: "Tech Supplies Corp", invoiceNumber: "FC-001-00012348", dueDate: "22/11/2025", amount: "$3,200.00" },
    { id: "5", supplier: "Office Solutions SA", invoiceNumber: "FC-001-00012349", dueDate: "25/11/2025", amount: "$6,800.00" },
    { id: "6", supplier: "Global Trading SRL", invoiceNumber: "FC-001-00012350", dueDate: "28/11/2025", amount: "$15,400.00" }
  ]

  // Mock invoices to collect (facturas a cobrar) - Extended list
  const allInvoicesToCollect = [
    { id: "1", client: "Cliente Comercial SA", invoiceNumber: "FC-001-00009876", dueDate: "14/11/2025", amount: "$18,200.00" },
    { id: "2", client: "Distribuidora Regional", invoiceNumber: "FC-001-00009877", dueDate: "17/11/2025", amount: "$11,500.00" },
    { id: "3", client: "Retail Solutions SRL", invoiceNumber: "FC-001-00009878", dueDate: "22/11/2025", amount: "$9,800.00" },
    { id: "4", client: "Comercial del Sur SA", invoiceNumber: "FC-001-00009879", dueDate: "24/11/2025", amount: "$14,300.00" },
    { id: "5", client: "Tech Innovations Ltd", invoiceNumber: "FC-001-00009880", dueDate: "27/11/2025", amount: "$22,100.00" },
    { id: "6", client: "Import Export Group", invoiceNumber: "FC-001-00009881", dueDate: "30/11/2025", amount: "$7,650.00" }
  ]

  // Calculate paginated data
  const totalPagesToPay = Math.ceil(allInvoicesToPay.length / itemsPerPage)
  const totalPagesToCollect = Math.ceil(allInvoicesToCollect.length / itemsPerPage)
  
  const invoicesToPay = allInvoicesToPay.slice(
    currentPageToPay * itemsPerPage,
    (currentPageToPay + 1) * itemsPerPage
  )
  
  const invoicesToCollect = allInvoicesToCollect.slice(
    currentPageToCollect * itemsPerPage,
    (currentPageToCollect + 1) * itemsPerPage
  )

  // Mock pending tasks - Extended list with due dates for sorting
  const allPendingTasksRaw = [
    { id: "1", title: "Revisar factura de Proveedor Industrial SA", company: "Empresa Demo 1", dueDate: "Hoy", dueDays: 0, priority: "high", completed: false },
    { id: "2", title: "Aprobar pago a Servicios Logísticos SRL", company: "Empresa Demo 2", dueDate: "Mañana", dueDays: 1, priority: "high", completed: false },
    { id: "3", title: "Actualizar datos fiscales", company: "Empresa Demo 1", dueDate: "En 2 días", dueDays: 2, priority: "medium", completed: false },
    { id: "4", title: "Enviar recordatorio de pago a Cliente Comercial SA", company: "Empresa Demo 3", dueDate: "En 3 días", dueDays: 3, priority: "medium", completed: false },
    { id: "5", title: "Revisar conciliación bancaria de Octubre", company: "Empresa Demo 1", dueDate: "Próxima semana", dueDays: 7, priority: "low", completed: false },
    { id: "6", title: "Preparar reporte mensual de gastos", company: "Empresa Demo 2", dueDate: "Próxima semana", dueDays: 8, priority: "low", completed: false },
    { id: "7", title: "Validar retenciones de impuestos", company: "Empresa Demo 1", dueDate: "En 5 días", dueDays: 5, priority: "medium", completed: false },
    { id: "8", title: "Contactar con auditoría externa", company: "Empresa Demo 3", dueDate: "En 4 días", dueDays: 4, priority: "high", completed: false },
    { id: "9", title: "Actualizar presupuesto anual", company: "Empresa Demo 2", dueDate: "En 10 días", dueDays: 10, priority: "low", completed: false },
    { id: "10", title: "Revisar contratos de proveedores", company: "Empresa Demo 1", dueDate: "En 12 días", dueDays: 12, priority: "low", completed: false }
  ]

  // Sort tasks by priority (high > medium > low) and then by due date (sooner first)
  const priorityOrder: { [key: string]: number } = { high: 1, medium: 2, low: 3 }
  const allPendingTasks = [...allPendingTasksRaw].sort((a, b) => {
    // First sort by priority
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    // Then sort by due date (sooner first)
    return a.dueDays - b.dueDays
  })

  // Calculate paginated tasks
  const totalPagesTasks = Math.ceil(allPendingTasks.length / tasksPerPage)
  const pendingTasksList = allPendingTasks.slice(
    currentPageTasks * tasksPerPage,
    (currentPageTasks + 1) * tasksPerPage
  )

  const totalCompanies = mockCompanies.length
  const pendingTasks = 15

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`${fontSizes.h1.desktop} font-medium text-gray-900`}>
                  Mi Dashboard
                </h1>
                <p className="text-gray-500 mt-1 font-light">Bienvenido de vuelta. Aquí está tu resumen financiero.</p>
              </div>
              
              {/* Time Filter Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant={selectedTimeFilter === '24h' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTimeFilter('24h')}
                  className="font-medium-heading text-sm"
                  style={selectedTimeFilter === '24h' ? { backgroundColor: colors.accent } : {}}
                >
                  24 horas
                </Button>
                <Button
                  variant={selectedTimeFilter === '7d' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTimeFilter('7d')}
                  className="font-medium-heading text-sm"
                  style={selectedTimeFilter === '7d' ? { backgroundColor: colors.accent } : {}}
                >
                  7 días
                </Button>
                <Button
                  variant={selectedTimeFilter === '28d' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTimeFilter('28d')}
                  className="font-medium-heading text-sm"
                  style={selectedTimeFilter === '28d' ? { backgroundColor: colors.accent } : {}}
                >
                  28 días
                </Button>
                <Button
                  variant={selectedTimeFilter === '3m' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTimeFilter('3m')}
                  className="font-medium-heading text-sm"
                  style={selectedTimeFilter === '3m' ? { backgroundColor: colors.accent } : {}}
                >
                  3 meses
                </Button>
                <Button
                  variant={selectedTimeFilter === '12m' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTimeFilter('12m')}
                  className="font-medium-heading text-sm"
                  style={selectedTimeFilter === '12m' ? { backgroundColor: colors.accent } : {}}
                >
                  12 meses
                </Button>
                <Button
                  variant={selectedTimeFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTimeFilter('all')}
                  className="font-medium-heading text-sm"
                  style={selectedTimeFilter === 'all' ? { backgroundColor: colors.accent } : {}}
                >
                  Todo el tiempo
                </Button>
              </div>
            </div>

            {/* Top Metrics - 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Cuentas a cobrar */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader className="pb-3">
                  <CardDescription className="text-sm text-gray-500 font-light">Cuentas a cobrar</CardDescription>
                  <CardTitle className={fontSizes.h1.desktop}>
                    ${Math.round(baseAmountReceivable * kpiMultiplier).toLocaleString()}.00
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-green-600 font-light">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>+2.5% vs período anterior</span>
                  </div>
                </CardContent>
              </Card>

              {/* Cuentas por pagar */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader className="pb-3">
                  <CardDescription className="text-sm text-gray-500 font-light">Cuentas por pagar</CardDescription>
                  <CardTitle className={fontSizes.h1.desktop}>
                    ${Math.round(baseAmountPayable * kpiMultiplier).toLocaleString()}.00
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-red-600 font-light">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    <span>-1.2% vs período anterior</span>
                  </div>
                </CardContent>
              </Card>

              {/* Saldo IVA */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader className="pb-3">
                  <CardDescription className="text-sm text-gray-500 font-light">Saldo IVA</CardDescription>
                  <CardTitle className={fontSizes.h1.desktop}>
                    ${Math.round(baseVATBalance * kpiMultiplier).toLocaleString()}.00
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-green-600 font-light">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>+3.8% vs período anterior</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              {/* Chart and Invoices Grid - 2/3 and 1/3 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start">
                {/* Left Column - Chart and Tasks */}
                <div className="flex flex-col gap-6 lg:col-span-2">
                  {/* Cash Flow Trend Chart */}
                  <Card className="shadow-sm border border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        Tendencia de Flujo de Caja
                      </CardTitle>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={activityData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorFacturacion" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={colors.accent} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={colors.accent} stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorFacturasPagar" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0078ff" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#0078ff" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="label" 
                          stroke="#9ca3af"
                          style={{ fontSize: '11px' }}
                          interval="preserveStartEnd"
                        />
                        <YAxis 
                          stroke="#9ca3af"
                          style={{ fontSize: '11px' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            fontSize: '13px'
                          }}
                          formatter={(value: number) => `$${value.toLocaleString()}`}
                        />
                        <Legend 
                          wrapperStyle={{ 
                            fontSize: '13px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="facturacion"
                          name="Facturación"
                          stroke={colors.accent}
                          strokeWidth={2}
                          fill="url(#colorFacturacion)"
                          dot={false}
                          activeDot={{ r: 5 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="facturasPagar"
                          name="Facturas a Pagar"
                          stroke="#0078ff"
                          strokeWidth={2}
                          fill="url(#colorFacturasPagar)"
                          dot={false}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                  {/* Pending Tasks Section */}
                  <Card className="shadow-sm border border-gray-200 flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          Tareas Pendientes
                        </CardTitle>
                        <CardDescription className="mt-1 font-light">
                          {allPendingTasks.filter(t => !t.completed).length} tareas por completar
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {pendingTasksList.map((task) => (
                          <div 
                            key={task.id} 
                            className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              {task.completed ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : (
                                <Circle className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium-heading text-sm ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                {task.title}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <p className="text-xs text-gray-500 font-light">{task.company}</p>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-gray-400" />
                                  <span className="text-xs text-gray-500 font-light">{task.dueDate}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              {task.priority === 'high' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-50 text-xs font-light text-red-700">
                                  Alta
                                </span>
                              )}
                              {task.priority === 'medium' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-orange-50 text-xs font-light text-orange-700">
                                  Media
                                </span>
                              )}
                              {task.priority === 'low' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-xs font-light text-blue-700">
                                  Baja
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentPageTasks(Math.max(0, currentPageTasks - 1))}
                          disabled={currentPageTasks === 0}
                          className="h-9 px-3"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-gray-500 font-light">
                          {currentPageTasks + 1} / {totalPagesTasks}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentPageTasks(Math.min(totalPagesTasks - 1, currentPageTasks + 1))}
                          disabled={currentPageTasks === totalPagesTasks - 1}
                          className="h-9 px-3"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Invoices Column - 33% */}
                <div className="flex flex-col gap-6 lg:col-span-1">
                  {/* Facturas a Pagar */}
                  <Card className="shadow-sm border border-gray-200 flex flex-col flex-1">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          Facturas a Pagar
                        </CardTitle>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="">
                        {invoicesToPay.map((invoice) => (
                          <div key={invoice.id} className="py-2 border-b border-gray-100 last:border-0">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between mt-1.5">
                                <p className="font-medium-heading text-gray-900 text-sm">{invoice.supplier}</p>
                                <p className="font-medium-heading text-gray-900 text-sm">{invoice.amount}</p>
                              </div>
                                <p className="text-sm text-gray-500 font-light">{invoice.invoiceNumber}</p>
                                <p className="text-sm text-gray-400 font-light">Vence: {invoice.dueDate}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Pagination */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentPageToPay(Math.max(0, currentPageToPay - 1))}
                          disabled={currentPageToPay === 0}
                          className="h-9 px-3"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-gray-500 font-light">
                          {currentPageToPay + 1} / {totalPagesToPay}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentPageToPay(Math.min(totalPagesToPay - 1, currentPageToPay + 1))}
                          disabled={currentPageToPay === totalPagesToPay - 1}
                          className="h-9 px-3"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Facturas a Cobrar */}
                  <Card className="shadow-sm border border-gray-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          Facturas a Cobrar
                        </CardTitle>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="">
                        {invoicesToCollect.map((invoice) => (
                          <div key={invoice.id} className="py-2 border-b border-gray-100 last:border-0">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between mt-1.5">
                                <p className="font-medium-heading text-gray-900 text-sm">{invoice.client}</p>
                                <p className="font-medium-heading text-gray-900 text-sm">{invoice.amount}</p>
                              </div>
                              <p className="text-sm text-gray-500 font-light">{invoice.invoiceNumber}</p>
                              <p className="text-sm text-gray-400 font-light">Vence: {invoice.dueDate}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Pagination */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentPageToCollect(Math.max(0, currentPageToCollect - 1))}
                          disabled={currentPageToCollect === 0}
                          className="h-9 px-3"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-gray-500 font-light">
                          {currentPageToCollect + 1} / {totalPagesToCollect}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentPageToCollect(Math.min(totalPagesToCollect - 1, currentPageToCollect + 1))}
                          disabled={currentPageToCollect === totalPagesToCollect - 1}
                          className="h-9 px-3"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
