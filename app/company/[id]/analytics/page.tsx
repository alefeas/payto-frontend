"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Users, AlertTriangle, Clock, Calendar as CalendarIcon, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnalyticsCard } from "@/components/analytics/analytics-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { formatDateToLocal } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { DateRange } from "react-day-picker"
import { useAuth } from "@/contexts/auth-context"
import { analyticsService, type AnalyticsSummary, type RevenueTrend, type TopClient, type PendingInvoices } from "@/services/analytics.service"
import { toast } from "sonner"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Skeleton } from "@/components/ui/skeleton"
import { AnalyticsSkeleton } from "@/components/analytics/AnalyticsSkeleton"
import { colors } from "@/styles"

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
  const [selectedCurrency, setSelectedCurrency] = useState<'ALL' | 'ARS' | 'USD' | 'EUR'>('ALL')
  const [isRefreshing, setIsRefreshing] = useState(false)

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
      setIsRefreshing(true)
      loadAnalytics()
    }
  }, [isAuthenticated, companyId, period, dateRange])

  const loadAnalytics = async () => {
    try {
      if (!summary) setLoading(true)
      
      let startDate: string | undefined
      let endDate: string | undefined
      
      if (period === 'custom' && dateRange?.from && dateRange?.to) {
        startDate = formatDateToLocal(dateRange.from)
        endDate = formatDateToLocal(dateRange.to)
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
      setIsRefreshing(false)
    }
  }

  if (authLoading || (loading && !summary)) {
    return <AnalyticsSkeleton />
  }

  if (!isAuthenticated || !summary) return null

  const getCurrencyData = (currency: 'ALL' | 'ARS' | 'USD' | 'EUR') => {
    if (currency === 'ALL') {
      const balance = summary.sales.total - summary.purchases.total
      const margin = summary.sales.total > 0 ? ((summary.sales.total - summary.purchases.total) / summary.sales.total) * 100 : 0
      return { sales: summary.sales, purchases: summary.purchases, balance, margin }
    }
    // Si hay datos por moneda, usarlos; sino usar los totales para ARS
    if (summary.sales_by_currency && summary.purchases_by_currency) {
      const salesByCurrency = summary.sales_by_currency[currency] || { total: 0, count: 0 }
      const purchasesByCurrency = summary.purchases_by_currency[currency] || { total: 0, count: 0 }
      const balance = salesByCurrency.total - purchasesByCurrency.total
      const margin = salesByCurrency.total > 0 ? ((salesByCurrency.total - purchasesByCurrency.total) / salesByCurrency.total) * 100 : 0
      return { sales: salesByCurrency, purchases: purchasesByCurrency, balance, margin }
    } else {
      // Fallback: mostrar todos los datos en ARS
      if (currency === 'ARS') {
        const balance = summary.sales.total - summary.purchases.total
        const margin = summary.sales.total > 0 ? ((summary.sales.total - summary.purchases.total) / summary.sales.total) * 100 : 0
        return { sales: summary.sales, purchases: summary.purchases, balance, margin }
      }
      return { sales: { total: 0, count: 0 }, purchases: { total: 0, count: 0 }, balance: 0, margin: 0 }
    }
  }

  const currencyData = getCurrencyData(selectedCurrency)
  const currencySymbols: Record<string, string> = { 'ALL': '', 'ARS': '$', 'USD': 'USD $', 'EUR': 'EUR €' }

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
            <Select value={selectedCurrency} onValueChange={(v: any) => setSelectedCurrency(v)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                <SelectItem value="ARS">ARS $</SelectItem>
                <SelectItem value="USD">USD $</SelectItem>
                <SelectItem value="EUR">EUR €</SelectItem>
              </SelectContent>
            </Select>
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
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[140px] justify-start bg-white dark:bg-slate-950">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? format(dateRange.from, "dd/MM/yyyy", { locale: es }) : "Desde"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white dark:bg-slate-950 border-gray-200 dark:border-gray-700" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange?.from}
                      onSelect={(date) => setDateRange(prev => ({ from: date, to: prev?.to }))}
                      locale={es}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[140px] justify-start bg-white dark:bg-slate-950">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.to ? format(dateRange.to, "dd/MM/yyyy", { locale: es }) : "Hasta"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white dark:bg-slate-950 border-gray-200 dark:border-gray-700" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange?.to}
                      onSelect={(date) => setDateRange(prev => ({ from: prev?.from, to: date }))}
                      disabled={(date) => dateRange?.from ? date < dateRange.from : false}
                      locale={es}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
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
        {isRefreshing && summary ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-gray-200">
                <CardContent className="p-6">
                  <div className="space-y-3 animate-pulse">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnalyticsCard
            title={`Ventas ${period === 'month' ? 'del Mes' : period === 'quarter' ? 'del Trimestre' : 'del Año'}`}
            mainValue={selectedCurrency === 'ALL' && summary.sales_by_currency 
              ? `$ ${summary.sales_by_currency.ARS.total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : `${currencySymbols[selectedCurrency]} ${currencyData.sales.total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            }
            secondaryValues={selectedCurrency === 'ALL' && summary.sales_by_currency ? [
              { label: 'USD', value: `$ ${summary.sales_by_currency.USD.total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
              { label: 'EUR', value: `€ ${summary.sales_by_currency.EUR.total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }
            ] : undefined}
            tertiaryValue={`${selectedCurrency === 'ALL' ? summary.sales.count : currencyData.sales.count} facturas`}
            icon={TrendingUp}
            isPositive={true}
          />

          <AnalyticsCard
            title={`Compras ${period === 'month' ? 'del Mes' : period === 'quarter' ? 'del Trimestre' : 'del Año'}`}
            mainValue={selectedCurrency === 'ALL' && summary.purchases_by_currency 
              ? `$ ${summary.purchases_by_currency.ARS.total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : `${currencySymbols[selectedCurrency]} ${currencyData.purchases.total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            }
            secondaryValues={selectedCurrency === 'ALL' && summary.purchases_by_currency ? [
              { label: 'USD', value: `$ ${summary.purchases_by_currency.USD.total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
              { label: 'EUR', value: `€ ${summary.purchases_by_currency.EUR.total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }
            ] : undefined}
            tertiaryValue={`${selectedCurrency === 'ALL' ? summary.purchases.count : currencyData.purchases.count} facturas`}
            icon={TrendingDown}
            isPositive={false}
          />

          <AnalyticsCard
            title={`Balance ${period === 'month' ? 'del Mes' : period === 'quarter' ? 'del Trimestre' : 'del Año'}`}
            mainValue={`${currencySymbols[selectedCurrency]} ${currencyData.balance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            secondaryValues={selectedCurrency === 'ALL' && summary.sales_by_currency && summary.purchases_by_currency ? [
              { label: 'USD', value: `$ ${(summary.sales_by_currency.USD.total - summary.purchases_by_currency.USD.total).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
              { label: 'EUR', value: `€ ${(summary.sales_by_currency.EUR.total - summary.purchases_by_currency.EUR.total).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }
            ] : undefined}
            icon={DollarSign}
            isPositive={currencyData.balance >= 0}
          />

          <AnalyticsCard
            title="Margen"
            mainValue={`${currencyData.margin.toFixed(1)}%`}
            tertiaryValue="Rentabilidad"
            icon={BarChart3}
            isPositive={currencyData.margin >= 0}
          />
        </div>
        )}

        {isRefreshing && summary ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="border-gray-200">
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[200px] w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Tendencia */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Tendencia de Facturación</CardTitle>
              <CardDescription>Últimos 6 meses {selectedCurrency !== 'ALL' && `(${currencySymbols[selectedCurrency]})`}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                {selectedCurrency === 'ALL' ? (
                  <LineChart data={revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip wrapperStyle={{ zIndex: 1000 }} formatter={(value, name) => {
                      const nameStr = String(name)
                      const currency = nameStr.includes('ARS') ? '$' : nameStr.includes('USD') ? 'USD $' : nameStr.includes('EUR') ? 'EUR €' : '$'
                      return `${currency} ${Number(value).toLocaleString('es-AR')}`
                    }} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line type="monotone" dataKey="sales_ARS" stroke={colors.gradient.topLeft} name="Ventas ARS" strokeWidth={2} />
                    <Line type="monotone" dataKey="sales_USD" stroke={colors.gradient.topRight} name="Ventas USD" strokeWidth={2} strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="sales_EUR" stroke={colors.gradient.bottomLeft} name="Ventas EUR" strokeWidth={2} strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="purchases_ARS" stroke={colors.gradient.bottomRight} name="Compras ARS" strokeWidth={2} />
                    <Line type="monotone" dataKey="purchases_USD" stroke={colors.accent} name="Compras USD" strokeWidth={2} strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="purchases_EUR" stroke={colors.gradient.bottomRight} name="Compras EUR" strokeWidth={2} strokeDasharray="3 3" />
                  </LineChart>
                ) : (
                  <LineChart data={revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip wrapperStyle={{ zIndex: 1000 }} formatter={(value) => `${currencySymbols[selectedCurrency]} ${Number(value).toLocaleString('es-AR')}`} />
                    <Legend />
                    <Line type="monotone" dataKey={`sales_${selectedCurrency}`} stroke={colors.gradient.topLeft} name="Ventas" strokeWidth={2} />
                    <Line type="monotone" dataKey={`purchases_${selectedCurrency}`} stroke={colors.gradient.bottomRight} name="Compras" strokeWidth={2} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Flujo de Caja */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Flujo de Caja Acumulado</CardTitle>
              <CardDescription>Balance mes a mes {selectedCurrency !== 'ALL' && `(${currencySymbols[selectedCurrency]})`}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                {selectedCurrency === 'ALL' ? (
                  <LineChart data={revenueTrend.map((item, index, arr) => {
                    const accARS = arr.slice(0, index + 1).reduce((acc, curr) => acc + ((curr.sales_ARS || 0) - (curr.purchases_ARS || 0)), 0)
                    const accUSD = arr.slice(0, index + 1).reduce((acc, curr) => acc + ((curr.sales_USD || 0) - (curr.purchases_USD || 0)), 0)
                    const accEUR = arr.slice(0, index + 1).reduce((acc, curr) => acc + ((curr.sales_EUR || 0) - (curr.purchases_EUR || 0)), 0)
                    return {
                      month: item.month,
                      balance_ARS: accARS,
                      balance_USD: accUSD,
                      balance_EUR: accEUR
                    }
                  })}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip wrapperStyle={{ zIndex: 1000 }} formatter={(value, name) => {
                      const nameStr = String(name)
                      const currency = nameStr.includes('ARS') ? '$' : nameStr.includes('USD') ? 'USD $' : 'EUR €'
                      return `${currency} ${Number(value).toLocaleString('es-AR')}`
                    }} />
                    <Legend />
                    <Line type="monotone" dataKey="balance_ARS" stroke={colors.gradient.topLeft} name="Balance ARS" strokeWidth={2} />
                    <Line type="monotone" dataKey="balance_USD" stroke={colors.gradient.topRight} name="Balance USD" strokeWidth={2} strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="balance_EUR" stroke={colors.gradient.bottomRight} name="Balance EUR" strokeWidth={2} strokeDasharray="3 3" />
                  </LineChart>
                ) : (
                  <LineChart data={revenueTrend.map((item, index, arr) => {
                    const accumulated = arr.slice(0, index + 1).reduce((acc, curr) => {
                      const sales = curr[`sales_${selectedCurrency}`] || 0
                      const purchases = curr[`purchases_${selectedCurrency}`] || 0
                      return acc + (sales - purchases)
                    }, 0)
                    return {
                      month: item.month,
                      balance: accumulated
                    }
                  })}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip wrapperStyle={{ zIndex: 1000 }} formatter={(value) => `${currencySymbols[selectedCurrency]} ${Number(value).toLocaleString('es-AR')}`} />
                    <Legend />
                    <Line type="monotone" dataKey="balance" stroke={colors.gradient.topLeft} name="Balance Acumulado" strokeWidth={2} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Alertas de Vencimientos */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" style={{ color: colors.accent }} />
              Alertas de Vencimientos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingInvoices && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">Facturas a Cobrar</p>
                      <p className="text-xs text-muted-foreground">Pendientes de pago</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {pendingInvoices.to_collect}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">Facturas a Pagar</p>
                      <p className="text-xs text-muted-foreground">Aprobadas sin pagar</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {pendingInvoices.to_pay}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">Pendientes de Aprobar</p>
                      <p className="text-xs text-muted-foreground">Requieren revisión</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
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
