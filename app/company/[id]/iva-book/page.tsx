"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { BookOpen, Download, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import apiClient from "@/lib/api-client"
import { companyService } from "@/services/company.service"
import { translateTaxCondition } from "@/lib/tax-condition-utils"

// Normalizar condición IVA según AFIP (backend ya lo hace, pero por si acaso)
const normalizeAfipTaxCondition = (condition: string | null | undefined): string => {
  if (!condition) return 'Responsable No Inscripto'
  // El backend ya normaliza, solo mostramos
  return condition
}

export default function IvaBookPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [company, setCompany] = useState<any>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [salesBook, setSalesBook] = useState<any>(null)
  const [purchasesBook, setPurchasesBook] = useState<any>(null)
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [exportingSales, setExportingSales] = useState(false)
  const [exportingPurchases, setExportingPurchases] = useState(false)
  const [validationError, setValidationError] = useState<{message: string, type: 'sales' | 'purchases'} | null>(null)

  const months = [
    { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' }, { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' }, { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' }, { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' },
  ]

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/log-in')
    } else if (isAuthenticated && companyId) {
      loadCompany()
    }
  }, [isAuthenticated, authLoading, router, companyId])

  useEffect(() => {
    if (company) {
      loadData()
    }
  }, [selectedMonth, selectedYear, company])

  const loadCompany = async () => {
    try {
      const companyData = await companyService.getCompany(companyId)
      setCompany(companyData)
    } catch (error) {
      toast.error('Error al cargar empresa')
      router.push('/dashboard')
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const [salesResponse, purchasesResponse, summaryResponse] = await Promise.all([
        apiClient.get(`/companies/${companyId}/iva-book/sales?month=${selectedMonth}&year=${selectedYear}`),
        apiClient.get(`/companies/${companyId}/iva-book/purchases?month=${selectedMonth}&year=${selectedYear}`),
        apiClient.get(`/companies/${companyId}/iva-book/summary?month=${selectedMonth}&year=${selectedYear}`)
      ])

      setSalesBook((salesResponse.data as any).data)
      setPurchasesBook((purchasesResponse.data as any).data)
      setSummary((summaryResponse.data as any).data)
      
      // Debug: verificar valores del backend
      console.log('Summary from backend:', (summaryResponse.data as any).data)
      console.log('Sales totals:', (salesResponse.data as any).data?.totals)
      console.log('Purchases totals:', (purchasesResponse.data as any).data?.totals)
    } catch (error: any) {
      toast.error('Error al cargar datos', {
        description: error.response?.data?.message || 'Intente nuevamente'
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number, currency: string = 'ARS') => {
    const symbols: Record<string, string> = { 'ARS': '$', 'USD': 'USD $', 'EUR': 'EUR €' }
    return `${symbols[currency] || '$'} ${value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  if (authLoading || loading || !company) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10" />
              <div>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-96" />
              </div>
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-[140px]" />
              <Skeleton className="h-10 w-[100px]" />
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-3 w-28 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs Content Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Table Header */}
                <div className="flex gap-4">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                </div>
                {/* Table Rows */}
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-4 py-3 border-b border-gray-200">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton href={`/company/${companyId}`} />
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-primary" />
                Libro IVA
              </h1>
              <p className="text-muted-foreground mt-1">Registro de operaciones con IVA - {company?.name}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map(m => (
                  <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Débito Fiscal</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {summary.debito_fiscal_by_currency ? (
                  <>
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      $ {summary.debito_fiscal_by_currency.ARS?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>USD $ {summary.debito_fiscal_by_currency.USD?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
                      <span>EUR € {summary.debito_fiscal_by_currency.EUR?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.debito_fiscal)}</div>
                )}
                <p className="text-xs text-muted-foreground mt-2">IVA de facturas emitidas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Crédito Fiscal</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {summary.credito_fiscal_by_currency ? (
                  <>
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      $ {summary.credito_fiscal_by_currency.ARS?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>USD $ {summary.credito_fiscal_by_currency.USD?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
                      <span>EUR € {summary.credito_fiscal_by_currency.EUR?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(summary.credito_fiscal)}</div>
                )}
                <p className="text-xs text-muted-foreground mt-2">IVA de facturas recibidas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {summary.saldo >= 0 ? 'Saldo a Pagar' : 'Saldo a Favor'}
                </CardTitle>
                {summary.saldo >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                )}
              </CardHeader>
              <CardContent>
                {summary.saldo_by_currency ? (
                  <>
                    <div className={`text-2xl font-bold mb-2 ${summary.saldo_by_currency.ARS >= 0 ? 'text-orange-600' : 'text-green-600'}`}>
                      $ {Math.abs(summary.saldo_by_currency.ARS || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>USD $ {Math.abs(summary.saldo_by_currency.USD || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      <span>EUR € {Math.abs(summary.saldo_by_currency.EUR || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </>
                ) : (
                  <div className={`text-2xl font-bold ${summary.saldo >= 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    {formatCurrency(Math.abs(summary.saldo))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {summary.saldo >= 0 ? 'A pagar a AFIP' : 'A favor del contribuyente'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="sales" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-11">
            <TabsTrigger value="sales" className="text-base">Ventas</TabsTrigger>
            <TabsTrigger value="purchases" className="text-base">Compras</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Libro IVA Ventas</CardTitle>
                    <CardDescription>
                      Facturas emitidas - {salesBook?.period?.month_name} {salesBook?.period?.year}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={exportingSales}
                    onClick={async () => {
                      try {
                        setExportingSales(true)
                        const response = await apiClient.get(`/companies/${companyId}/iva-book/export/sales?month=${selectedMonth}&year=${selectedYear}`) as any
                        const url = window.URL.createObjectURL(new Blob([response.data]))
                        const link = document.createElement('a')
                        link.href = url
                        link.setAttribute('download', `REGINFO_CV_VENTAS_${selectedYear}_${selectedMonth}.txt`)
                        document.body.appendChild(link)
                        link.click()
                        link.remove()
                        toast.success('Archivo descargado correctamente')
                      } catch (error: any) {
                        let errorMsg = 'Error desconocido'
                        if (error.response?.data instanceof Blob) {
                          const text = await error.response.data.text()
                          try {
                            const json = JSON.parse(text)
                            errorMsg = json.message || text
                          } catch {
                            errorMsg = text
                          }
                        } else {
                          errorMsg = error.response?.data?.message || error.message
                        }
                        
                        if (error.response?.status === 422 && errorMsg.includes('CUIT')) {
                          setValidationError({ message: errorMsg, type: 'sales' })
                        } else {
                          toast.error('Error al descargar archivo', {
                            description: errorMsg
                          })
                        }
                        console.error('Download error:', error, errorMsg)
                      } finally {
                        setExportingSales(false)
                      }
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {exportingSales ? 'Exportando...' : 'Exportar para AFIP'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {salesBook?.warnings && salesBook.warnings.length > 0 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-900">Advertencias</p>
                        <ul className="text-sm text-yellow-800 mt-1 space-y-1">
                          {salesBook.warnings.map((warning: string, idx: number) => (
                            <li key={idx}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                {salesBook?.records?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay facturas emitidas en este período
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Fecha</TableHead>
                          <TableHead>Comprobante</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>CUIT/DNI</TableHead>
                          <TableHead>Condición IVA</TableHead>
                          <TableHead>Mon.</TableHead>
                          <TableHead className="text-right">Neto</TableHead>
                          <TableHead className="text-right">27%</TableHead>
                          <TableHead className="text-right">21%</TableHead>
                          <TableHead className="text-right">10.5%</TableHead>
                          <TableHead className="text-right">5%</TableHead>
                          <TableHead className="text-right">2.5%</TableHead>
                          <TableHead className="text-right">Exento</TableHead>
                          <TableHead className="text-right">Percepc.</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {salesBook?.records?.map((record: any, idx: number) => (
                          <TableRow key={idx} className="border-b border-gray-200">
                            <TableCell className="font-medium">{record.fecha}</TableCell>
                            <TableCell>{record.tipo} {record.punto_venta}-{record.numero}</TableCell>
                            <TableCell className="max-w-[150px] truncate">{record.cliente}</TableCell>
                            <TableCell>{record.cuit}</TableCell>
                            <TableCell className="text-xs">{record.condicion_iva || 'Responsable No Inscripto'}</TableCell>
                            <TableCell className="text-xs font-medium">{record.currency || 'ARS'}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.neto_gravado, record.currency)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.iva_27, record.currency)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.iva_21, record.currency)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.iva_105, record.currency)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.iva_5, record.currency)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.iva_25, record.currency)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.exento, record.currency)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.percepciones, record.currency)}</TableCell>
                            <TableCell className="text-right font-semibold">{formatCurrency(record.total, record.currency)}</TableCell>
                          </TableRow>
                        ))}
                        {salesBook?.totals && (
                          <TableRow className="bg-muted/50 font-bold">
                            <TableCell colSpan={6}>TOTALES (ARS)</TableCell>
                            <TableCell className="text-right">{formatCurrency(salesBook.totals.neto_gravado)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(salesBook.totals.iva_27)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(salesBook.totals.iva_21)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(salesBook.totals.iva_105)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(salesBook.totals.iva_5)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(salesBook.totals.iva_25)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(salesBook.totals.exento)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(salesBook.totals.percepciones)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(salesBook.totals.total)}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchases" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Libro IVA Compras</CardTitle>
                    <CardDescription>
                      Facturas recibidas - {purchasesBook?.period?.month_name} {purchasesBook?.period?.year}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={exportingPurchases}
                    onClick={async () => {
                      try {
                        setExportingPurchases(true)
                        const response = await apiClient.get(`/companies/${companyId}/iva-book/export/purchases?month=${selectedMonth}&year=${selectedYear}`) as any
                        const url = window.URL.createObjectURL(new Blob([response.data]))
                        const link = document.createElement('a')
                        link.href = url
                        link.setAttribute('download', `REGINFO_CV_COMPRAS_${selectedYear}_${selectedMonth}.txt`)
                        document.body.appendChild(link)
                        link.click()
                        link.remove()
                        toast.success('Archivo descargado correctamente')
                      } catch (error: any) {
                        let errorMsg = 'Error desconocido'
                        if (error.response?.data instanceof Blob) {
                          const text = await error.response.data.text()
                          try {
                            const json = JSON.parse(text)
                            errorMsg = json.message || text
                          } catch {
                            errorMsg = text
                          }
                        } else {
                          errorMsg = error.response?.data?.message || error.message
                        }
                        
                        if (error.response?.status === 422 && errorMsg.includes('CUIT')) {
                          setValidationError({ message: errorMsg, type: 'purchases' })
                        } else {
                          toast.error('Error al descargar archivo', {
                            description: errorMsg
                          })
                        }
                        console.error('Download error:', error, errorMsg)
                      } finally {
                        setExportingPurchases(false)
                      }
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {exportingPurchases ? 'Exportando...' : 'Exportar para AFIP'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {purchasesBook?.warnings && purchasesBook.warnings.length > 0 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-900">Advertencias</p>
                        <ul className="text-sm text-yellow-800 mt-1 space-y-1">
                          {purchasesBook.warnings.map((warning: string, idx: number) => (
                            <li key={idx}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                {purchasesBook?.records?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay facturas recibidas en este período
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Fecha</TableHead>
                          <TableHead>Comprobante</TableHead>
                          <TableHead>Proveedor</TableHead>
                          <TableHead>CUIT/DNI</TableHead>
                          <TableHead>Condición IVA</TableHead>
                          <TableHead>Mon.</TableHead>
                          <TableHead className="text-right">Neto</TableHead>
                          <TableHead className="text-right">27%</TableHead>
                          <TableHead className="text-right">21%</TableHead>
                          <TableHead className="text-right">10.5%</TableHead>
                          <TableHead className="text-right">5%</TableHead>
                          <TableHead className="text-right">2.5%</TableHead>
                          <TableHead className="text-right">Exento</TableHead>
                          <TableHead className="text-right">Retenc.</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {purchasesBook?.records?.map((record: any, idx: number) => (
                          <TableRow key={idx} className="border-b border-gray-200">
                            <TableCell className="font-medium">{record.fecha}</TableCell>
                            <TableCell>{record.tipo} {record.punto_venta}-{record.numero}</TableCell>
                            <TableCell className="max-w-[150px] truncate">{record.proveedor}</TableCell>
                            <TableCell>{record.cuit}</TableCell>
                            <TableCell className="text-xs">{record.condicion_iva || 'Responsable No Inscripto'}</TableCell>
                            <TableCell className="text-xs font-medium">{record.currency || 'ARS'}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.neto_gravado, record.currency)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.iva_27, record.currency)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.iva_21, record.currency)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.iva_105, record.currency)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.iva_5, record.currency)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.iva_25, record.currency)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.exento, record.currency)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.retenciones, record.currency)}</TableCell>
                            <TableCell className="text-right font-semibold">{formatCurrency(record.total, record.currency)}</TableCell>
                          </TableRow>
                        ))}
                        {purchasesBook?.totals && (
                          <TableRow className="bg-muted/50 font-bold">
                            <TableCell colSpan={6}>TOTALES (ARS)</TableCell>
                            <TableCell className="text-right">{formatCurrency(purchasesBook.totals.neto_gravado)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(purchasesBook.totals.iva_27)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(purchasesBook.totals.iva_21)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(purchasesBook.totals.iva_105)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(purchasesBook.totals.iva_5)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(purchasesBook.totals.iva_25)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(purchasesBook.totals.exento)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(purchasesBook.totals.retenciones)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(purchasesBook.totals.total)}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!validationError} onOpenChange={() => setValidationError(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Errores de validación
            </DialogTitle>
            <DialogDescription>
              Se encontraron errores que impedirán que AFIP acepte este archivo.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto space-y-3">
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <p className="text-sm font-medium">
                {validationError?.message.split(':')[0]}:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {validationError?.message
                  .split(':')
                  .slice(1)
                  .join(':')
                  .split('.')
                  .filter(part => !part.includes('force=1') && !part.includes('AFIP rechazar'))
                  .join('')
                  .split(',')
                  .filter(item => item.trim())
                  .map((item, idx) => (
                    <li key={idx} className="ml-2">{item.trim()}</li>
                  ))}
              </ul>
            </div>
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <p className="text-sm font-medium text-red-900">
                ⚠️ AFIP rechazará este archivo
              </p>
              <p className="text-xs text-red-700 mt-1">
                Corrige los CUITs inválidos editando los {validationError?.type === 'sales' ? 'clientes/empresas en sus secciones respectivas' : 'proveedores/empresas en sus secciones respectivas'}. Si fueron eliminados, restáuralos primero usando el botón "Ver Eliminados".
              </p>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs text-red-700 hover:text-red-900 mt-2"
                onClick={() => {
                  setValidationError(null)
                  router.push(`/company/${companyId}/${validationError?.type === 'sales' ? 'clients' : 'suppliers'}`)
                }}
              >
                Ir a {validationError?.type === 'sales' ? 'Clientes' : 'Proveedores'} →
              </Button>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setValidationError(null)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={async () => {
                try {
                  const endpoint = validationError?.type === 'sales' ? 'sales' : 'purchases'
                  const filename = validationError?.type === 'sales' 
                    ? `REGINFO_CV_VENTAS_${selectedYear}_${selectedMonth}.txt`
                    : `REGINFO_CV_COMPRAS_${selectedYear}_${selectedMonth}.txt`
                  
                  const response = await apiClient.get(`/companies/${companyId}/iva-book/export/${endpoint}?month=${selectedMonth}&year=${selectedYear}&force=1`) as any
                  const url = window.URL.createObjectURL(new Blob([response.data]))
                  const link = document.createElement('a')
                  link.href = url
                  link.setAttribute('download', filename)
                  document.body.appendChild(link)
                  link.click()
                  link.remove()
                  setValidationError(null)
                  toast.warning('Archivo descargado con errores', {
                    description: 'AFIP rechazará este archivo. Corrija los errores antes de enviarlo.'
                  })
                } catch (e) {
                  toast.error('Error al descargar')
                }
              }}
            >
              Descargar de todas maneras
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
