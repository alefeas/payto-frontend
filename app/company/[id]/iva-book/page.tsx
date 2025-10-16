"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, BookOpen, Download, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import apiClient from "@/lib/api-client"
import { companyService } from "@/services/company.service"

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

  const months = [
    { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' }, { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' }, { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' }, { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' },
  ]

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    } else if (isAuthenticated && companyId) {
      loadCompany()
    }
  }, [isAuthenticated, authLoading, router, companyId])

  useEffect(() => {
    if (company && company.taxCondition === 'registered_taxpayer') {
      loadData()
    }
  }, [selectedMonth, selectedYear, company])

  const loadCompany = async () => {
    try {
      const companyData = await companyService.getCompany(companyId)
      setCompany(companyData)
      
      if (companyData.taxCondition !== 'registered_taxpayer') {
        toast.error('Acceso denegado', {
          description: 'El Libro IVA solo está disponible para Responsables Inscriptos'
        })
        router.push(`/company/${companyId}`)
      }
    } catch (error) {
      toast.error('Error al cargar empresa')
      router.push('/dashboard')
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const [salesResponse, purchasesResponse, summaryResponse] = await Promise.all([
        apiClient.get(`/companies/${companyId}/iva-book/sales`, {
          params: { month: selectedMonth, year: selectedYear }
        }),
        apiClient.get(`/companies/${companyId}/iva-book/purchases`, {
          params: { month: selectedMonth, year: selectedYear }
        }),
        apiClient.get(`/companies/${companyId}/iva-book/summary`, {
          params: { month: selectedMonth, year: selectedYear }
        })
      ])

      setSalesBook(salesResponse.data.data)
      setPurchasesBook(purchasesResponse.data.data)
      setSummary(summaryResponse.data.data)
    } catch (error: any) {
      toast.error('Error al cargar datos', {
        description: error.response?.data?.message || 'Intente nuevamente'
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(value)
  }

  if (authLoading || !company) return null
  if (!isAuthenticated) return null
  if (company.taxCondition !== 'registered_taxpayer') return null

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push(`/company/${companyId}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <BookOpen className="h-8 w-8" />
                Libro IVA
              </h1>
              <p className="text-muted-foreground">Registro de operaciones con IVA</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Período</CardTitle>
            <CardDescription>Seleccione el mes y año a consultar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {months.map(m => (
                      <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {years.map(y => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Débito Fiscal (Ventas)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.debito_fiscal)}</div>
                <p className="text-xs text-muted-foreground mt-1">IVA de facturas emitidas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Crédito Fiscal (Compras)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(summary.credito_fiscal)}</div>
                <p className="text-xs text-muted-foreground mt-1">IVA de facturas recibidas</p>
              </CardContent>
            </Card>

            <Card className={summary.saldo >= 0 ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {summary.saldo >= 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-orange-600" />
                      <span className="text-orange-900">Saldo a Pagar</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4 text-green-600" />
                      <span className="text-green-900">Saldo a Favor</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${summary.saldo >= 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {formatCurrency(Math.abs(summary.saldo))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.saldo >= 0 ? 'A pagar a AFIP' : 'A favor del contribuyente'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="sales" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sales">Libro IVA Ventas</TabsTrigger>
            <TabsTrigger value="purchases">Libro IVA Compras</TabsTrigger>
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
                    onClick={async () => {
                      try {
                        const response = await apiClient.get(`/companies/${companyId}/iva-book/export/sales?month=${selectedMonth}&year=${selectedYear}`, {
                          responseType: 'blob'
                        })
                        const url = window.URL.createObjectURL(new Blob([response.data]))
                        const link = document.createElement('a')
                        link.href = url
                        link.setAttribute('download', `REGINFO_CV_VENTAS_${selectedYear}_${selectedMonth}.txt`)
                        document.body.appendChild(link)
                        link.click()
                        link.remove()
                        toast.success('Archivo descargado correctamente')
                      } catch (error) {
                        toast.error('Error al descargar archivo')
                      }
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar para AFIP
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Cargando...</div>
                ) : salesBook?.records?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay facturas emitidas en este período
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Comprobante</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>CUIT</TableHead>
                          <TableHead className="text-right">Neto</TableHead>
                          <TableHead className="text-right">21%</TableHead>
                          <TableHead className="text-right">10.5%</TableHead>
                          <TableHead className="text-right">27%</TableHead>
                          <TableHead className="text-right">5%</TableHead>
                          <TableHead className="text-right">2.5%</TableHead>
                          <TableHead className="text-right">Exento</TableHead>
                          <TableHead className="text-right">Percepc.</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {salesBook?.records?.map((record: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{record.fecha}</TableCell>
                            <TableCell>{record.tipo} {record.punto_venta}-{record.numero}</TableCell>
                            <TableCell className="max-w-[150px] truncate">{record.cliente}</TableCell>
                            <TableCell>{record.cuit}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.neto_gravado)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.iva_21)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.iva_105)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.iva_27)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.iva_5)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.iva_25)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.exento)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.percepciones)}</TableCell>
                            <TableCell className="text-right font-semibold">{formatCurrency(record.total)}</TableCell>
                          </TableRow>
                        ))}
                        {salesBook?.totals && (
                          <TableRow className="bg-muted/50 font-bold">
                            <TableCell colSpan={4}>TOTALES</TableCell>
                            <TableCell className="text-right">{formatCurrency(salesBook.totals.neto_gravado)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(salesBook.totals.iva_21)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(salesBook.totals.iva_105)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(salesBook.totals.iva_27)}</TableCell>
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
                    onClick={async () => {
                      try {
                        const response = await apiClient.get(`/companies/${companyId}/iva-book/export/purchases?month=${selectedMonth}&year=${selectedYear}`, {
                          responseType: 'blob'
                        })
                        const url = window.URL.createObjectURL(new Blob([response.data]))
                        const link = document.createElement('a')
                        link.href = url
                        link.setAttribute('download', `REGINFO_CV_COMPRAS_${selectedYear}_${selectedMonth}.txt`)
                        document.body.appendChild(link)
                        link.click()
                        link.remove()
                        toast.success('Archivo descargado correctamente')
                      } catch (error) {
                        toast.error('Error al descargar archivo')
                      }
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar para AFIP
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Cargando...</div>
                ) : purchasesBook?.records?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay facturas recibidas en este período
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Comprobante</TableHead>
                          <TableHead>Proveedor</TableHead>
                          <TableHead>CUIT</TableHead>
                          <TableHead className="text-right">Neto</TableHead>
                          <TableHead className="text-right">21%</TableHead>
                          <TableHead className="text-right">10.5%</TableHead>
                          <TableHead className="text-right">27%</TableHead>
                          <TableHead className="text-right">5%</TableHead>
                          <TableHead className="text-right">2.5%</TableHead>
                          <TableHead className="text-right">Exento</TableHead>
                          <TableHead className="text-right">Retenc.</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {purchasesBook?.records?.map((record: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{record.fecha}</TableCell>
                            <TableCell>{record.tipo} {record.punto_venta}-{record.numero}</TableCell>
                            <TableCell className="max-w-[150px] truncate">{record.proveedor}</TableCell>
                            <TableCell>{record.cuit}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.neto_gravado)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.iva_21)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.iva_105)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.iva_27)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.iva_5)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.iva_25)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.exento)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(record.retenciones)}</TableCell>
                            <TableCell className="text-right font-semibold">{formatCurrency(record.total)}</TableCell>
                          </TableRow>
                        ))}
                        {purchasesBook?.totals && (
                          <TableRow className="bg-muted/50 font-bold">
                            <TableCell colSpan={4}>TOTALES</TableCell>
                            <TableCell className="text-right">{formatCurrency(purchasesBook.totals.neto_gravado)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(purchasesBook.totals.iva_21)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(purchasesBook.totals.iva_105)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(purchasesBook.totals.iva_27)}</TableCell>
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
    </div>
  )
}
