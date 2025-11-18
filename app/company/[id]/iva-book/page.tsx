"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Download, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import { colors, fontSizes } from "@/styles"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CardCarousel } from "@/components/ui/card-carousel"
import { PageHeader } from "@/components/layouts/PageHeader"
import { IvaBookSkeleton } from "@/components/iva-book/IvaBookSkeleton"
import { useAuth } from "@/contexts/auth-context"
import { hasPermission } from "@/lib/permissions"
import { CompanyRole } from "@/types"
import { toast } from "sonner"
import apiClient from "@/lib/api-client"
import { companyService } from "@/services/company.service"
import { useAfipCertificate } from "@/hooks/use-afip-certificate"
import { AfipButton } from "@/components/afip/afip-guard"
import { AfipCertificateBanner } from "@/components/afip/afip-certificate-banner"



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

  // AFIP Certificate validation
  const { isVerified: isAfipVerified, isLoading: isLoadingCert } = useAfipCertificate(companyId)

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

  // Verificar permisos de acceso
  useEffect(() => {
    if (company) {
      const userRole = company.role as CompanyRole
      if (!hasPermission(userRole, 'iva_book.view')) {
        toast.error('No tienes permisos para acceder al Libro IVA')
        router.push(`/company/${companyId}`)
      }
    }
  }, [company, router, companyId])

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
    // Para valores muy grandes, reducir decimales
    const decimals = Math.abs(value) > 999999 ? 0 : 2
    return `${symbols[currency] || '$'} ${value.toLocaleString('es-AR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
  }

  const getColumnWidth = (value: number) => {
    // Ajustar ancho dinámicamente según el tamaño del número
    const absValue = Math.abs(value)
    if (absValue > 999999999) return 'w-24' // 96px para valores muy grandes
    if (absValue > 999999) return 'w-20' // 80px para millones
    return 'w-16' // 64px por defecto
  }

  const abbreviateIvaCondition = (condition: string) => {
    if (!condition) return 'Resp. No Insc.'
    if (condition.includes('Responsable Inscripto')) return 'Resp. Insc.'
    if (condition.includes('Responsable No Inscripto')) return 'Resp. No Insc.'
    if (condition.includes('Exento')) return 'Exento'
    if (condition.includes('Monotributista')) return 'Monotrib.'
    return condition
  }

  const getDocumentLabel = (cuit: string) => {
    if (!cuit) return 'ID'
    // CUIT tiene formato XX-XXXXXXXX-X (11 dígitos con guiones)
    // DNI es solo números (7-8 dígitos)
    const cleanCuit = cuit.replace(/\D/g, '')
    if (cleanCuit.length === 11) return 'CUIT'
    if (cleanCuit.length <= 8) return 'DNI'
    return 'ID'
  }

  if (authLoading || loading || !company) {
    return <IvaBookSkeleton />
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <PageHeader
          title="Libro IVA"
          description={`Registro de operaciones con IVA`}
          backHref={`/company/${companyId}`}
          titleLevel="h1"
        >
          <div className="flex gap-3 w-full sm:w-auto">
            <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
              <SelectTrigger className="flex-1 sm:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map(m => (
                  <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="flex-1 sm:w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </PageHeader>

        {summary && (
          <CardCarousel desktopCols={3} mobileBreakpoint="lg">
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Débito Fiscal</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </CardHeader>
              <CardContent>
                {summary.debito_fiscal_by_currency ? (
                  <>
                    <div className="text-lg sm:text-2xl font-bold truncate">
                      $ {summary.debito_fiscal_by_currency.ARS?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                    </div>
                    <div className="flex gap-2 text-xs sm:text-sm text-gray-600 mt-1 overflow-x-auto">
                      <span className="flex-shrink-0">US$ {summary.debito_fiscal_by_currency.USD?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
                      <span className="flex-shrink-0">€ {summary.debito_fiscal_by_currency.EUR?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-lg sm:text-2xl font-bold truncate">{formatCurrency(summary.debito_fiscal)}</div>
                )}
                <p className="text-xs sm:text-sm text-gray-600 mt-2">IVA de facturas emitidas</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Crédito Fiscal</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </CardHeader>
              <CardContent>
                {summary.credito_fiscal_by_currency ? (
                  <>
                    <div className="text-lg sm:text-2xl font-bold truncate">
                      $ {summary.credito_fiscal_by_currency.ARS?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                    </div>
                    <div className="flex gap-2 text-xs sm:text-sm text-gray-600 mt-1 overflow-x-auto">
                      <span className="flex-shrink-0">US$ {summary.credito_fiscal_by_currency.USD?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
                      <span className="flex-shrink-0">€ {summary.credito_fiscal_by_currency.EUR?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-lg sm:text-2xl font-bold truncate">{formatCurrency(summary.credito_fiscal)}</div>
                )}
                <p className="text-xs sm:text-sm text-gray-600 mt-2">IVA de facturas recibidas</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Saldo IVA</CardTitle>
                {summary.saldo >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
              </CardHeader>
              <CardContent>
                {summary.saldo_by_currency ? (
                  <>
                    <div className="text-lg sm:text-2xl font-bold truncate">
                      {(summary.saldo_by_currency.ARS ?? 0) < 0 ? '-' : ''}$ {Math.abs(summary.saldo_by_currency.ARS || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="flex gap-2 text-xs sm:text-sm text-gray-600 mt-1 overflow-x-auto">
                      <span className="flex-shrink-0">US$ {(summary.saldo_by_currency.USD ?? 0) < 0 ? '-' : ''}{Math.abs(summary.saldo_by_currency.USD || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      <span className="flex-shrink-0">€ {(summary.saldo_by_currency.EUR ?? 0) < 0 ? '-' : ''}{Math.abs(summary.saldo_by_currency.EUR || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-lg sm:text-2xl font-bold truncate">
                    {summary.saldo < 0 ? '-' : ''}$ {Math.abs(summary.saldo).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                )}
                <p className="text-xs sm:text-sm text-gray-600 mt-2">
                  {summary.saldo >= 0 ? 'A pagar a AFIP' : 'A favor del contribuyente'}
                </p>
              </CardContent>
            </Card>
          </CardCarousel>
        )}

        {/* Mensaje de certificado AFIP requerido */}
        {!isAfipVerified && !isLoadingCert && (
          <AfipCertificateBanner 
            companyId={companyId}
            message="No puedes exportar archivos oficiales para AFIP sin un certificado activo. Configura tu certificado para generar reportes válidos."
          />
        )}

        <Tabs defaultValue="sales" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="inline-flex h-9 rounded-md bg-muted/30 px-1">
              <TabsTrigger value="sales" className="text-sm">Ventas</TabsTrigger>
              <TabsTrigger value="purchases" className="text-sm">Compras</TabsTrigger>
            </TabsList>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <span>Periodo:</span>
              <span className="font-medium">{selectedMonth}/{selectedYear}</span>
            </div>
            <div className="sm:hidden text-xs text-muted-foreground font-medium">
              {selectedMonth}/{selectedYear}
            </div>
          </div>

          <TabsContent value="sales" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Libro IVA Ventas</CardTitle>
                    <CardDescription>
                      Facturas emitidas - {salesBook?.period?.month_name} {salesBook?.period?.year}
                    </CardDescription>
                  </div>
                  <AfipButton
                    companyId={companyId}
                    variant="outline" 
                    size="sm"
                    disabled={exportingSales}
                    errorMessage="Certificado AFIP requerido para exportar archivos oficiales de libro IVA"
                    loadingText="Verificando AFIP..."
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
                  </AfipButton>
                </div>
              </CardHeader>
              <CardContent>
                {salesBook?.warnings && salesBook.warnings.length > 0 && (
                  <div className="mb-4 p-3 rounded-lg border border-gray-200 bg-muted/30">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 mt-0.5" style={{ color: colors.accent }} />
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: colors.accent }}>Advertencias</p>
                        <ul className="text-sm text-muted-foreground mt-1 space-y-1">
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
                  <div className="space-y-2">
                    {salesBook?.records?.map((record: any, idx: number) => (
                      <Card key={idx} className="border-gray-200 shadow-sm">
                        <CardContent className="p-3 xl:p-2">
                          {/* Desktop: Horizontal layout */}
                          <div className="hidden xl:flex items-center gap-4 text-xs overflow-x-auto px-3 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
                            <div className="flex-shrink-0 min-w-fit space-y-1">
                              <p className="font-semibold">{record.tipo} {record.punto_venta}-{record.numero}</p>
                              <p className="text-muted-foreground">{record.fecha}</p>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-muted-foreground text-xs">Cliente</p>
                              <p>{record.cliente}</p>
                            </div>
                            <div className="flex-shrink-0 min-w-fit text-center">
                              <p className="text-muted-foreground text-xs">{getDocumentLabel(record.cuit)}</p>
                              <p className="font-semibold text-xs">{record.cuit}</p>
                            </div>
                            <div className="flex-shrink-0 min-w-fit text-center">
                              <p className="text-muted-foreground text-xs">IVA</p>
                              <p className="font-semibold text-xs">{abbreviateIvaCondition(record.condicion_iva)}</p>
                            </div>
                            <div className="flex gap-3 flex-shrink-0">
                              <div className={`${getColumnWidth(record.neto_gravado)} text-center`}>
                                <p className="text-muted-foreground text-xs">Neto</p>
                                <p className="font-semibold text-xs">{formatCurrency(record.neto_gravado, record.currency)}</p>
                              </div>
                              <div className={`${getColumnWidth(record.iva_27)} text-center`}>
                                <p className="text-muted-foreground text-xs">27%</p>
                                <p className="font-semibold text-xs">{formatCurrency(record.iva_27, record.currency)}</p>
                              </div>
                              <div className={`${getColumnWidth(record.iva_21)} text-center`}>
                                <p className="text-muted-foreground text-xs">21%</p>
                                <p className="font-semibold text-xs">{formatCurrency(record.iva_21, record.currency)}</p>
                              </div>
                              <div className={`${getColumnWidth(record.iva_105)} text-center`}>
                                <p className="text-muted-foreground text-xs">10.5%</p>
                                <p className="font-semibold text-xs">{formatCurrency(record.iva_105, record.currency)}</p>
                              </div>
                              <div className={`${getColumnWidth(record.iva_5)} text-center`}>
                                <p className="text-muted-foreground text-xs">5%</p>
                                <p className="font-semibold text-xs">{formatCurrency(record.iva_5, record.currency)}</p>
                              </div>
                              <div className={`${getColumnWidth(record.iva_25)} text-center`}>
                                <p className="text-muted-foreground text-xs">2.5%</p>
                                <p className="font-semibold text-xs">{formatCurrency(record.iva_25, record.currency)}</p>
                              </div>
                              <div className={`${getColumnWidth(record.exento)} text-center`}>
                                <p className="text-muted-foreground text-xs">Exento</p>
                                <p className="font-semibold text-xs">{formatCurrency(record.exento, record.currency)}</p>
                              </div>
                              <div className={`${getColumnWidth(record.percepciones)} text-center`}>
                                <p className="text-muted-foreground text-xs">Perc.</p>
                                <p className="font-semibold text-xs">{formatCurrency(record.percepciones, record.currency)}</p>
                              </div>
                            </div>
                            <div className="flex-shrink-0 text-center min-w-fit">
                              <p className="text-muted-foreground text-xs">{record.currency || 'ARS'}</p>
                              <p className="font-bold text-sm">{formatCurrency(record.total, record.currency)}</p>
                            </div>
                          </div>

                          {/* Mobile: Vertical layout */}
                          <div className="xl:hidden space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold">{record.fecha} • {record.tipo} {record.punto_venta}-{record.numero}</p>
                                <p className="text-xs text-muted-foreground truncate">{record.cliente}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-xs text-muted-foreground">{record.currency || 'ARS'}</p>
                                <p className="text-xs font-bold">{formatCurrency(record.total, record.currency)}</p>
                              </div>
                            </div>
                            <div className="text-xs space-y-2 border-t border-gray-100 pt-2">
                              <p><span className="text-muted-foreground">CUIT:</span> {record.cuit}</p>
                              <p><span className="text-muted-foreground">IVA:</span> {record.condicion_iva || 'Responsable No Inscripto'}</p>
                              <div className="overflow-x-auto pt-1">
                                <div className="flex gap-3 min-w-min">
                                  <div className="flex-shrink-0 text-center">
                                    <p className="text-muted-foreground text-xs">Neto</p>
                                    <p className="font-semibold text-xs">{formatCurrency(record.neto_gravado, record.currency)}</p>
                                  </div>
                                  <div className="flex-shrink-0 text-center">
                                    <p className="text-muted-foreground text-xs">27%</p>
                                    <p className="font-semibold text-xs">{formatCurrency(record.iva_27, record.currency)}</p>
                                  </div>
                                  <div className="flex-shrink-0 text-center">
                                    <p className="text-muted-foreground text-xs">21%</p>
                                    <p className="font-semibold text-xs">{formatCurrency(record.iva_21, record.currency)}</p>
                                  </div>
                                  <div className="flex-shrink-0 text-center">
                                    <p className="text-muted-foreground text-xs">10.5%</p>
                                    <p className="font-semibold text-xs">{formatCurrency(record.iva_105, record.currency)}</p>
                                  </div>
                                  <div className="flex-shrink-0 text-center">
                                    <p className="text-muted-foreground text-xs">5%</p>
                                    <p className="font-semibold text-xs">{formatCurrency(record.iva_5, record.currency)}</p>
                                  </div>
                                  <div className="flex-shrink-0 text-center">
                                    <p className="text-muted-foreground text-xs">2.5%</p>
                                    <p className="font-semibold text-xs">{formatCurrency(record.iva_25, record.currency)}</p>
                                  </div>
                                  <div className="flex-shrink-0 text-center">
                                    <p className="text-muted-foreground text-xs">Exento</p>
                                    <p className="font-semibold text-xs">{formatCurrency(record.exento, record.currency)}</p>
                                  </div>
                                  <div className="flex-shrink-0 text-center">
                                    <p className="text-muted-foreground text-xs">Percepc.</p>
                                    <p className="font-semibold text-xs">{formatCurrency(record.percepciones, record.currency)}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {salesBook?.totals && (
                      <Card className="bg-muted/50 border-gray-200 shadow-sm">
                        <CardContent className="p-3">
                          <p className="font-bold text-xs mb-2">TOTALES (ARS)</p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <p className="text-muted-foreground">Neto</p>
                              <p className="font-semibold">{formatCurrency(salesBook.totals.neto_gravado)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">IVA 21%</p>
                              <p className="font-semibold">{formatCurrency(salesBook.totals.iva_21)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Total</p>
                              <p className="font-bold">{formatCurrency(salesBook.totals.total)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchases" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Libro IVA Compras</CardTitle>
                    <CardDescription>
                      Facturas recibidas - {purchasesBook?.period?.month_name} {purchasesBook?.period?.year}
                    </CardDescription>
                  </div>
                  <AfipButton
                    companyId={companyId}
                    variant="outline" 
                    size="sm"
                    disabled={exportingPurchases}
                    errorMessage="Certificado AFIP requerido para exportar archivos oficiales de libro IVA"
                    loadingText="Verificando AFIP..."
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
                  </AfipButton>
                </div>
              </CardHeader>
              <CardContent>
                {purchasesBook?.warnings && purchasesBook.warnings.length > 0 && (
                  <div className="mb-4 p-3 rounded-lg border border-gray-200 bg-muted/30">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 mt-0.5" style={{ color: colors.accent }} />
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: colors.accent }}>Advertencias</p>
                        <ul className="text-sm text-muted-foreground mt-1 space-y-1">
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
                  <div className="space-y-2">
                    {purchasesBook?.records?.map((record: any, idx: number) => (
                      <Card key={idx} className="border-gray-200 shadow-sm">
                        <CardContent className="p-3 xl:p-2">
                          {/* Desktop: Horizontal layout */}
                          <div className="hidden xl:flex items-center gap-4 text-xs overflow-x-auto pb-2 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
                            <div className="flex-shrink-0 min-w-fit space-y-1">
                              <p className="font-semibold">{record.tipo} {record.punto_venta}-{record.numero}</p>
                              <p className="text-muted-foreground">{record.fecha}</p>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-muted-foreground text-xs">Proveedor</p>
                              <p>{record.proveedor}</p>
                            </div>
                            <div className="flex-shrink-0 min-w-fit text-center">
                              <p className="text-muted-foreground text-xs">{getDocumentLabel(record.cuit)}</p>
                              <p className="font-semibold text-xs">{record.cuit}</p>
                            </div>
                            <div className="flex-shrink-0 min-w-fit text-center">
                              <p className="text-muted-foreground text-xs">IVA</p>
                              <p className="font-semibold text-xs">{abbreviateIvaCondition(record.condicion_iva)}</p>
                            </div>
                            <div className="flex gap-3 flex-shrink-0">
                              <div className={`${getColumnWidth(record.neto_gravado)} text-center`}>
                                <p className="text-muted-foreground text-xs">Neto</p>
                                <p className="font-semibold text-xs">{formatCurrency(record.neto_gravado, record.currency)}</p>
                              </div>
                              <div className={`${getColumnWidth(record.iva_27)} text-center`}>
                                <p className="text-muted-foreground text-xs">27%</p>
                                <p className="font-semibold text-xs">{formatCurrency(record.iva_27, record.currency)}</p>
                              </div>
                              <div className={`${getColumnWidth(record.iva_21)} text-center`}>
                                <p className="text-muted-foreground text-xs">21%</p>
                                <p className="font-semibold text-xs">{formatCurrency(record.iva_21, record.currency)}</p>
                              </div>
                              <div className={`${getColumnWidth(record.iva_105)} text-center`}>
                                <p className="text-muted-foreground text-xs">10.5%</p>
                                <p className="font-semibold text-xs">{formatCurrency(record.iva_105, record.currency)}</p>
                              </div>
                              <div className={`${getColumnWidth(record.iva_5)} text-center`}>
                                <p className="text-muted-foreground text-xs">5%</p>
                                <p className="font-semibold text-xs">{formatCurrency(record.iva_5, record.currency)}</p>
                              </div>
                              <div className={`${getColumnWidth(record.iva_25)} text-center`}>
                                <p className="text-muted-foreground text-xs">2.5%</p>
                                <p className="font-semibold text-xs">{formatCurrency(record.iva_25, record.currency)}</p>
                              </div>
                              <div className={`${getColumnWidth(record.exento)} text-center`}>
                                <p className="text-muted-foreground text-xs">Exento</p>
                                <p className="font-semibold text-xs">{formatCurrency(record.exento, record.currency)}</p>
                              </div>
                              <div className={`${getColumnWidth(record.retenciones)} text-center`}>
                                <p className="text-muted-foreground text-xs">Ret.</p>
                                <p className="font-semibold text-xs">{formatCurrency(record.retenciones, record.currency)}</p>
                              </div>
                            </div>
                            <div className="flex-shrink-0 text-center min-w-fit">
                              <p className="text-muted-foreground text-xs">{record.currency || 'ARS'}</p>
                              <p className="font-bold text-sm">{formatCurrency(record.total, record.currency)}</p>
                            </div>
                          </div>

                          {/* Mobile: Vertical layout */}
                          <div className="xl:hidden space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold">{record.fecha} • {record.tipo} {record.punto_venta}-{record.numero}</p>
                                <p className="text-xs text-muted-foreground truncate">{record.proveedor}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-xs text-muted-foreground">{record.currency || 'ARS'}</p>
                                <p className="text-xs font-bold">{formatCurrency(record.total, record.currency)}</p>
                              </div>
                            </div>
                            <div className="text-xs space-y-2 border-t border-gray-100 pt-2">
                              <p><span className="text-muted-foreground">CUIT:</span> {record.cuit}</p>
                              <p><span className="text-muted-foreground">IVA:</span> {record.condicion_iva || 'Responsable No Inscripto'}</p>
                              <div className="overflow-x-auto pt-1">
                                <div className="flex gap-3 min-w-min">
                                  <div className="flex-shrink-0 text-center">
                                    <p className="text-muted-foreground text-xs">Neto</p>
                                    <p className="font-semibold text-xs">{formatCurrency(record.neto_gravado, record.currency)}</p>
                                  </div>
                                  <div className="flex-shrink-0 text-center">
                                    <p className="text-muted-foreground text-xs">27%</p>
                                    <p className="font-semibold text-xs">{formatCurrency(record.iva_27, record.currency)}</p>
                                  </div>
                                  <div className="flex-shrink-0 text-center">
                                    <p className="text-muted-foreground text-xs">21%</p>
                                    <p className="font-semibold text-xs">{formatCurrency(record.iva_21, record.currency)}</p>
                                  </div>
                                  <div className="flex-shrink-0 text-center">
                                    <p className="text-muted-foreground text-xs">10.5%</p>
                                    <p className="font-semibold text-xs">{formatCurrency(record.iva_105, record.currency)}</p>
                                  </div>
                                  <div className="flex-shrink-0 text-center">
                                    <p className="text-muted-foreground text-xs">5%</p>
                                    <p className="font-semibold text-xs">{formatCurrency(record.iva_5, record.currency)}</p>
                                  </div>
                                  <div className="flex-shrink-0 text-center">
                                    <p className="text-muted-foreground text-xs">2.5%</p>
                                    <p className="font-semibold text-xs">{formatCurrency(record.iva_25, record.currency)}</p>
                                  </div>
                                  <div className="flex-shrink-0 text-center">
                                    <p className="text-muted-foreground text-xs">Exento</p>
                                    <p className="font-semibold text-xs">{formatCurrency(record.exento, record.currency)}</p>
                                  </div>
                                  <div className="flex-shrink-0 text-center">
                                    <p className="text-muted-foreground text-xs">Retenc.</p>
                                    <p className="font-semibold text-xs">{formatCurrency(record.retenciones, record.currency)}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {purchasesBook?.totals && (
                      <Card className="bg-muted/50 border-gray-200 shadow-sm">
                        <CardContent className="p-3">
                          <p className="font-bold text-xs mb-2">TOTALES (ARS)</p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <p className="text-muted-foreground">Neto</p>
                              <p className="font-semibold">{formatCurrency(purchasesBook.totals.neto_gravado)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">IVA 21%</p>
                              <p className="font-semibold">{formatCurrency(purchasesBook.totals.iva_21)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Total</p>
                              <p className="font-bold">{formatCurrency(purchasesBook.totals.total)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
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
