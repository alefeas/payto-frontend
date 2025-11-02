"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Users, AlertTriangle, Clock, Calendar as CalendarIcon, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { DateRange } from "react-day-picker"
import { useAuth } from "@/contexts/auth-context"
import { analyticsService, type AnalyticsSummary, type RevenueTrend, type TopClient, type PendingInvoices } from "@/services/analytics.service"
import { toast } from "sonner"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function AnalyticsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrend[]>([])
  const [topClients, setTopClients] = useState<TopClient[]>([])
  const [pendingInvoices, setPendingInvoices] = useState<PendingInvoices | null>(null)
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year' | 'custom'>('month')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/log-in')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (isAuthenticated && companyId) {
      if (period === 'custom' && (!dateRange?.from || !dateRange?.to)) {
        return
      }
      loadAnalytics()
    }
  }, [isAuthenticated, companyId, period, dateRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      
      let startDate: string | undefined
      let endDate: string | undefined
      
      if (period === 'custom' && dateRange?.from && dateRange?.to) {
        startDate = format(dateRange.from, 'yyyy-MM-dd')
        endDate = format(dateRange.to, 'yyyy-MM-dd')
      }
      
      const [summaryData, trendData, clientsData, pendingData] = await Promise.all([
        analyticsService.getSummary(companyId, period, startDate, endDate),
        analyticsService.getRevenueTrend(companyId, period, startDate, endDate),
        analyticsService.getTopClients(companyId, period, startDate, endDate),
        analyticsService.getPendingInvoices(companyId)
      ])
      
      setSummary(summaryData)
      setRevenueTrend(trendData)
      setTopClients(clientsData)
      setPendingInvoices(pendingData)
    } catch (error) {
      console.error('Error loading analytics:', error)
      toast.error('Error al cargar estadísticas')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || (loading && !summary)) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-muted rounded animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-8 w-64 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-96 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !summary) return null

  const netBalance = summary.balance
  const profitMargin = summary.sales.total > 0 
    ? ((summary.sales.total - summary.purchases.total) / summary.sales.total) * 100 
    : 0

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton href={`/company/${companyId}`} />
            <div>
              <h1 className="text-3xl font-bold">Estadísticas y Análisis</h1>
              <p className="text-muted-foreground">
                Período: {(() => {
                  if (period === 'custom' && dateRange?.from) {
                    return dateRange.to 
                      ? `${format(dateRange.from, 'dd/MM/yyyy', { locale: es })} - ${format(dateRange.to, 'dd/MM/yyyy', { locale: es })}`
                      : format(dateRange.from, 'dd/MM/yyyy', { locale: es })
                  }
                  const now = new Date()
                  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
                  if (period === 'month') {
                    return `${months[now.getMonth()]} ${now.getFullYear()}`
                  } else if (period === 'quarter') {
                    const quarter = Math.floor(now.getMonth() / 3) + 1
                    return `Q${quarter} ${now.getFullYear()}`
                  } else {
                    return `${now.getFullYear()}`
                  }
                })()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
              <SelectTrigger className="w-[180px]">
                <CalendarIcon className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Mes Actual</SelectItem>
                <SelectItem value="quarter">Trimestre</SelectItem>
                <SelectItem value="year">Año Completo</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
            {period === 'custom' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yyyy", { locale: es })} - {format(dateRange.to, "dd/MM/yyyy", { locale: es })}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy", { locale: es })
                      )
                    ) : (
                      <span>Seleccionar fechas</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            )}
            <Button 
              variant="outline" 
              size="sm"
              disabled={exporting}
              onClick={async () => {
                setExporting(true)
                try {
                  await new Promise(resolve => setTimeout(resolve, 1500))
                  
                  let csv = 'REPORTE DE ANALYTICS\n\n'
                  csv += `Periodo,${period === 'month' ? 'Mes Actual' : period === 'quarter' ? 'Trimestre' : 'Año Completo'}\n\n`
                  
                  csv += 'RESUMEN FINANCIERO\n'
                  csv += 'Concepto,Monto,Cantidad\n'
                  csv += `Ventas,${summary.sales.total},${summary.sales.count}\n`
                  csv += `Compras,${summary.purchases.total},${summary.purchases.count}\n`
                  csv += `Balance,${summary.balance},-\n\n`
                  
                  csv += 'TENDENCIA MENSUAL\n'
                  csv += 'Mes,Ventas,Compras\n'
                  revenueTrend.forEach(item => {
                    csv += `${item.month},${item.sales},${item.purchases}\n`
                  })
                  
                  csv += '\nTOP CLIENTES\n'
                  csv += 'Cliente,Monto Total,Cantidad Facturas\n'
                  topClients.forEach(client => {
                    csv += `${client.client_name},${client.total_amount},${client.invoice_count}\n`
                  })
                  
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `analytics-${period}-${new Date().toISOString().split('T')[0]}.csv`
                  a.click()
                  URL.revokeObjectURL(url)
                  toast.success('Reporte exportado en formato CSV')
                } catch (error) {
                  toast.error('Error al exportar datos')
                } finally {
                  setExporting(false)
                }
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              {exporting ? 'Exportando...' : 'Exportar'}
            </Button>
          </div>
        </div>

        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Ventas {period === 'month' ? 'del Mes' : period === 'quarter' ? 'del Trimestre' : 'del Año'}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    ${summary.sales.total.toLocaleString('es-AR')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {summary.sales.count} facturas
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
                  <p className="text-sm text-muted-foreground">
                    Compras {period === 'month' ? 'del Mes' : period === 'quarter' ? 'del Trimestre' : 'del Año'}
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    ${summary.purchases.total.toLocaleString('es-AR')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {summary.purchases.count} facturas
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
                  <p className="text-sm text-muted-foreground">Balance Neto</p>
                  <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${netBalance.toLocaleString('es-AR')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ventas - Compras
                  </p>
                </div>
                <DollarSign className={`h-8 w-8 ${netBalance >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Margen</p>
                  <p className={`text-2xl font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profitMargin.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Rentabilidad
                  </p>
                </div>
                <BarChart3 className={`h-8 w-8 ${profitMargin >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Tendencia */}
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Facturación</CardTitle>
              <CardDescription>Últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString('es-AR')}`} />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#10b981" name="Ventas" strokeWidth={2} />
                  <Line type="monotone" dataKey="purchases" stroke="#ef4444" name="Compras" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Flujo de Caja */}
          <Card>
            <CardHeader>
              <CardTitle>Flujo de Caja Acumulado</CardTitle>
              <CardDescription>Balance mes a mes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={revenueTrend.map((item, index, arr) => {
                  const accumulated = arr.slice(0, index + 1).reduce((acc, curr) => acc + (curr.sales - curr.purchases), 0)
                  return {
                    month: item.month,
                    balance: accumulated
                  }
                })}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString('es-AR')}`} />
                  <Legend />
                  <Line type="monotone" dataKey="balance" stroke="#6366f1" name="Balance Acumulado" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Alertas de Vencimientos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alertas de Vencimientos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingInvoices && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-yellow-800">Facturas a Cobrar</p>
                      <p className="text-xs text-yellow-600">Pendientes de pago</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-yellow-700">
                        {pendingInvoices.to_collect}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-orange-800">Facturas a Pagar</p>
                      <p className="text-xs text-orange-600">Aprobadas sin pagar</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-700">
                        {pendingInvoices.to_pay}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-800">Pendientes de Aprobar</p>
                      <p className="text-xs text-green-600">Requieren revisión</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-700">
                        {pendingInvoices.pending_approvals}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>


      </div>
    </div>
  )
}
