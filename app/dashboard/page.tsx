"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveHeading, ResponsiveText } from "@/components/ui/responsive-heading"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CardCarousel } from "@/components/ui/card-carousel"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { colors, getResponsiveFontSize } from "@/styles"
import { useAuth } from "@/contexts/auth-context"
import { companyService, Company } from "@/services/company.service"
import { taskService, type Task } from "@/services/task.service"
import { invoiceService } from "@/services/invoice.service"
import { toast } from "sonner"
import { parseDateLocal } from "@/lib/utils"
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

// Función para formatear montos de manera compacta
const formatCompactAmount = (amount: number, currency: string = 'ARS') => {
  const absAmount = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  const symbol = currency === 'USD' ? 'US$' : currency === 'EUR' ? '€' : '$'
  
  if (absAmount >= 1000000000) {
    return `${sign}${symbol}${(absAmount / 1000000000).toFixed(1)}B`
  } else if (absAmount >= 1000000) {
    return `${sign}${symbol}${(absAmount / 1000000).toFixed(1)}M`
  } else if (absAmount >= 1000) {
    return `${sign}${symbol}${(absAmount / 1000).toFixed(1)}K`
  } else {
    return `${sign}${symbol}${absAmount.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
  }
}

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<TimeFilter>('28d')
  const [companies, setCompanies] = useState<Company[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [currentPageToPay, setCurrentPageToPay] = useState(0)
  const [currentPageToCollect, setCurrentPageToCollect] = useState(0)
  const [currentPageTasks, setCurrentPageTasks] = useState(0)
  const [selectedDashboardTasks, setSelectedDashboardTasks] = useState<Set<string>>(new Set())
  const [isCompletingDashboardTasks, setIsCompletingDashboardTasks] = useState(false)
  

  
  const itemsPerPage = 3
  const tasksPerPage = 5

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/log-in')
    } else if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated, authLoading])

  const loadData = async () => {
    try {
      setLoading(true)
      const [companiesData, tasksData] = await Promise.all([
        companyService.getCompanies(),
        taskService.getTasks()
      ])
      
      setCompanies(companiesData)
      setTasks(tasksData)
      
      // Load invoices from all companies
      const allInvoices: any[] = []
      for (const company of companiesData) {
        try {
          let page = 1
          let hasMore = true
          while (hasMore) {
            const response = await invoiceService.getInvoices(company.id, page)
            const pageData = response.data || []
            if (Array.isArray(pageData) && pageData.length > 0) {
              allInvoices.push(...pageData.map((inv: any) => ({ ...inv, companyId: company.id })))
              page++
            } else {
              hasMore = false
            }
          }
        } catch (error) {
          console.error(`Error loading invoices for company ${company.id}:`, error)
        }
      }
      
      setInvoices(allInvoices)
    } catch (error) {
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleTaskSelection = (taskId: string) => {
    const newSelected = new Set(selectedDashboardTasks)
    const task = tasks.find(t => t.id === taskId)
    
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId)
    } else {
      if (task) {
        const firstSelectedTask = selectedDashboardTasks.size > 0 ? tasks.find(t => t.id === Array.from(selectedDashboardTasks)[0]) : null
        if (firstSelectedTask && firstSelectedTask.is_completed !== task.is_completed) {
          toast.error('No puedes mezclar tareas completadas y pendientes')
          return
        }
      }
      newSelected.add(taskId)
    }
    setSelectedDashboardTasks(newSelected)
  }

  const handleCompleteSelectedDashboardTasks = async () => {
    if (selectedDashboardTasks.size === 0) return
    
    try {
      setIsCompletingDashboardTasks(true)
      const firstTask = tasks.find(t => t.id === Array.from(selectedDashboardTasks)[0])
      const newCompletedState = !firstTask?.is_completed
      
      await Promise.all(
        Array.from(selectedDashboardTasks).map(taskId => {
          return taskService.updateTask(taskId, { is_completed: newCompletedState })
        })
      )
      setSelectedDashboardTasks(new Set())
      loadData()
      const action = newCompletedState ? 'completada(s)' : 'descompletada(s)'
      toast.success(`${selectedDashboardTasks.size} tarea(s) ${action}`)
    } catch (error) {
      toast.error('Error al actualizar tareas')
    } finally {
      setIsCompletingDashboardTasks(false)
    }
  }

  // Funciones de paginación sin delay artificial
  const handleTasksPagination = (newPage: number) => {
    setCurrentPageTasks(newPage)
  }

  const handleToPayPagination = (newPage: number) => {
    setCurrentPageToPay(newPage)
  }

  const handleToCollectPagination = (newPage: number) => {
    setCurrentPageToCollect(newPage)
  }

  // Calculate real KPIs with period comparison
  const kpis = useMemo(() => {
    const now = new Date()
    let periodStart: Date
    let previousPeriodStart: Date
    let previousPeriodEnd: Date
    let periodLabel = ''

    switch (selectedTimeFilter) {
      case '24h':
        periodStart = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        previousPeriodStart = new Date(now.getTime() - 48 * 60 * 60 * 1000)
        previousPeriodEnd = periodStart
        periodLabel = 'vs 24h anteriores'
        break
      case '7d':
        periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        previousPeriodStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
        previousPeriodEnd = periodStart
        periodLabel = 'vs 7 días anteriores'
        break
      case '28d':
        periodStart = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000)
        previousPeriodStart = new Date(now.getTime() - 56 * 24 * 60 * 60 * 1000)
        previousPeriodEnd = periodStart
        periodLabel = 'vs 28 días anteriores'
        break
      case '3m':
        periodStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        previousPeriodStart = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
        previousPeriodEnd = periodStart
        periodLabel = 'vs 3 meses anteriores'
        break
      case '12m':
        periodStart = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        previousPeriodStart = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000)
        previousPeriodEnd = periodStart
        periodLabel = 'vs 12 meses anteriores'
        break
      default: // 'all'
        periodStart = new Date(0)
        previousPeriodStart = new Date(0)
        previousPeriodEnd = new Date(0)
        periodLabel = 'desde el inicio'
    }

    const filterByPeriod = (inv: any, start: Date, end: Date | null) => {
      if (selectedTimeFilter === 'all') return true
      const invDate = new Date(inv.created_at || inv.issue_date)
      return invDate >= start && (!end || invDate < end)
    }

    const baseReceivableFilter = (inv: any) => {
      const isIssuer = companies.some(c => c.id === inv.issuer_company_id)
      if (!isIssuer) return false
      if (inv.supplier_id) return false
      const isCreditNote = ['NCA', 'NCB', 'NCC', 'NCM', 'NCE'].includes(inv.type)
      const isDebitNote = ['NDA', 'NDB', 'NDC', 'NDM', 'NDE'].includes(inv.type)
      if (isCreditNote || isDebitNote) return false
      const status = inv.display_status || inv.status
      if (status === 'cancelled' || status === 'rejected') return false
      const companyStatus = inv.company_statuses?.[inv.companyId]
      if (companyStatus === 'collected' || companyStatus === 'paid' || status === 'collected') return false
      if (inv.payment_status === 'collected' || inv.payment_status === 'paid') return false
      return true
    }

    const basePayableFilter = (inv: any) => {
      const isReceiver = companies.some(c => c.id === inv.receiver_company_id)
      if (!isReceiver) return false
      const isCreditNote = ['NCA', 'NCB', 'NCC', 'NCM', 'NCE'].includes(inv.type)
      const isDebitNote = ['NDA', 'NDB', 'NDC', 'NDM', 'NDE'].includes(inv.type)
      if (isCreditNote || isDebitNote) return false
      const status = inv.display_status || inv.status
      if (status === 'cancelled' || status === 'rejected') return false
      const companyStatus = inv.company_statuses?.[inv.companyId]
      if (companyStatus === 'paid' || status === 'paid') return false
      if (inv.payment_status === 'paid' || inv.payment_status === 'collected') return false
      return true
    }

    const baseVatSalesFilter = (inv: any) => {
      const isIssuer = companies.some(c => c.id === inv.issuer_company_id)
      if (!isIssuer) return false
      if (inv.supplier_id) return false
      const status = inv.display_status || inv.status
      if (status === 'archived') return false
      return true
    }

    const baseVatPurchasesFilter = (inv: any) => {
      const isReceiver = companies.some(c => c.id === inv.receiver_company_id && c.id !== inv.issuer_company_id)
      const hasSupplier = inv.supplier_id && companies.some(c => c.id === inv.companyId)
      if (!isReceiver && !hasSupplier) return false
      const status = inv.display_status || inv.status
      if (status === 'archived') return false
      return true
    }

    // Group by currency
    const receivableInvoices = invoices.filter(inv => baseReceivableFilter(inv) && filterByPeriod(inv, periodStart, null))
    const receivableByCurrency = { ARS: 0, USD: 0, EUR: 0 }
    receivableInvoices.forEach(inv => {
      const currency = inv.currency || 'ARS'
      const amount = parseFloat((inv.balance_pending ?? inv.available_balance ?? inv.pending_amount ?? inv.total) || 0)
      receivableByCurrency[currency as keyof typeof receivableByCurrency] += amount
    })

    const previousReceivableInvoices = invoices.filter(inv => baseReceivableFilter(inv) && filterByPeriod(inv, previousPeriodStart, previousPeriodEnd))
    const previousReceivableByCurrency = { ARS: 0, USD: 0, EUR: 0 }
    previousReceivableInvoices.forEach(inv => {
      const currency = inv.currency || 'ARS'
      const amount = parseFloat((inv.balance_pending ?? inv.available_balance ?? inv.pending_amount ?? inv.total) || 0)
      previousReceivableByCurrency[currency as keyof typeof previousReceivableByCurrency] += amount
    })

    const payableInvoices = invoices.filter(inv => basePayableFilter(inv) && filterByPeriod(inv, periodStart, null))
    const payableByCurrency = { ARS: 0, USD: 0, EUR: 0 }
    payableInvoices.forEach(inv => {
      const currency = inv.currency || 'ARS'
      const amount = parseFloat((inv.balance_pending ?? inv.available_balance ?? inv.pending_amount ?? inv.total) || 0)
      payableByCurrency[currency as keyof typeof payableByCurrency] += amount
    })

    const previousPayableInvoices = invoices.filter(inv => basePayableFilter(inv) && filterByPeriod(inv, previousPeriodStart, previousPeriodEnd))
    const previousPayableByCurrency = { ARS: 0, USD: 0, EUR: 0 }
    previousPayableInvoices.forEach(inv => {
      const currency = inv.currency || 'ARS'
      const amount = parseFloat((inv.balance_pending ?? inv.available_balance ?? inv.pending_amount ?? inv.total) || 0)
      previousPayableByCurrency[currency as keyof typeof previousPayableByCurrency] += amount
    })

    const receivable = receivableByCurrency.ARS
    const previousReceivable = previousReceivableByCurrency.ARS
    const payable = payableByCurrency.ARS
    const previousPayable = previousPayableByCurrency.ARS

    // Calcular IVA según lógica del backend (solo ARS)
    const salesForVat = invoices.filter(inv => baseVatSalesFilter(inv) && filterByPeriod(inv, periodStart, null))
    const debitoFiscal = salesForVat.reduce((sum, inv) => {
      const items = inv.items || []
      const exchangeRate = inv.exchange_rate || 1
      const isCredit = inv.type?.startsWith('NC')
      const multiplier = isCredit ? -1 : 1
      return sum + items.reduce((itemSum: number, item: any) => {
        const taxAmount = (parseFloat(item.tax_amount || 0) * exchangeRate) * multiplier
        return itemSum + (item.tax_rate > 0 ? taxAmount : 0)
      }, 0)
    }, 0)

    const purchasesForVat = invoices.filter(inv => baseVatPurchasesFilter(inv) && filterByPeriod(inv, periodStart, null))
    const creditoFiscal = purchasesForVat.reduce((sum, inv) => {
      const items = inv.items || []
      const exchangeRate = inv.exchange_rate || 1
      const isCredit = inv.type?.startsWith('NC')
      const multiplier = isCredit ? 1 : (inv.type?.startsWith('ND') ? -1 : 1)
      return sum + items.reduce((itemSum: number, item: any) => {
        const taxAmount = (parseFloat(item.tax_amount || 0) * exchangeRate) * multiplier
        return itemSum + (item.tax_rate > 0 ? taxAmount : 0)
      }, 0)
    }, 0)

    const previousSalesForVat = invoices.filter(inv => baseVatSalesFilter(inv) && filterByPeriod(inv, previousPeriodStart, previousPeriodEnd))
    const previousDebitoFiscal = previousSalesForVat.reduce((sum, inv) => {
      const items = inv.items || []
      const exchangeRate = inv.exchange_rate || 1
      const isCredit = inv.type?.startsWith('NC')
      const multiplier = isCredit ? -1 : 1
      return sum + items.reduce((itemSum: number, item: any) => {
        const taxAmount = (parseFloat(item.tax_amount || 0) * exchangeRate) * multiplier
        return itemSum + (item.tax_rate > 0 ? taxAmount : 0)
      }, 0)
    }, 0)

    const previousPurchasesForVat = invoices.filter(inv => baseVatPurchasesFilter(inv) && filterByPeriod(inv, previousPeriodStart, previousPeriodEnd))
    const previousCreditoFiscal = previousPurchasesForVat.reduce((sum, inv) => {
      const items = inv.items || []
      const exchangeRate = inv.exchange_rate || 1
      const isCredit = inv.type?.startsWith('NC')
      const multiplier = isCredit ? 1 : (inv.type?.startsWith('ND') ? -1 : 1)
      return sum + items.reduce((itemSum: number, item: any) => {
        const taxAmount = (parseFloat(item.tax_amount || 0) * exchangeRate) * multiplier
        return itemSum + (item.tax_rate > 0 ? taxAmount : 0)
      }, 0)
    }, 0)

    const vatBalance = debitoFiscal - creditoFiscal
    const previousVatBalance = previousDebitoFiscal - previousCreditoFiscal

    const calcChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }

    return {
      receivable,
      payable,
      vatBalance,
      receivableChange: calcChange(receivable, previousReceivable),
      payableChange: calcChange(payable, previousPayable),
      vatBalanceChange: calcChange(vatBalance, previousVatBalance),
      periodLabel,
      receivableByCurrency,
      payableByCurrency
    }
  }, [invoices, companies, selectedTimeFilter])

  // All invoices to pay (for pagination calculation)
  const allInvoicesToPay = useMemo(() => {
    const filtered = invoices.filter(inv => {
      const isReceiver = companies.some(c => c.id === inv.receiver_company_id)
      if (!isReceiver) return false
      const isCreditNote = ['NCA', 'NCB', 'NCC', 'NCM', 'NCE'].includes(inv.type)
      const isDebitNote = ['NDA', 'NDB', 'NDC', 'NDM', 'NDE'].includes(inv.type)
      if (isCreditNote || isDebitNote) return false
      const status = inv.display_status || inv.status
      if (status === 'cancelled' || status === 'rejected' || status === 'pending_approval') return false
      const companyStatus = inv.company_statuses?.[inv.companyId]
      if (companyStatus === 'paid' || companyStatus === 'pending_approval') return false
      if (inv.payment_status === 'paid' || inv.payment_status === 'collected') return false
      const company = companies.find(c => c.id === inv.receiver_company_id)
      const requiredApprovals = company?.required_approvals ?? 0
      if (requiredApprovals > 0 && (inv.approvals_received ?? 0) < requiredApprovals) return false
      const pendingAmount = parseFloat(inv.pending_amount ?? 0)
      if (pendingAmount <= 0) return false
      return true
    })
    return filtered.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
  }, [invoices, companies])

  const invoicesToPay = useMemo(() => {
    return allInvoicesToPay.slice(currentPageToPay * itemsPerPage, (currentPageToPay + 1) * itemsPerPage)
  }, [allInvoicesToPay, currentPageToPay])

  const allInvoicesToCollect = useMemo(() => {
    return invoices
      .filter(inv => {
        const isIssuer = companies.some(c => c.id === inv.issuer_company_id)
        if (!isIssuer) return false
        if (inv.supplier_id) return false
        const isCreditNote = ['NCA', 'NCB', 'NCC', 'NCM', 'NCE'].includes(inv.type)
        const isDebitNote = ['NDA', 'NDB', 'NDC', 'NDM', 'NDE'].includes(inv.type)
        if (isCreditNote || isDebitNote) return false
        const status = inv.display_status || inv.status
        if (status === 'cancelled' || status === 'rejected') return false
        const companyStatus = inv.company_statuses?.[inv.companyId]
        if (companyStatus === 'collected' || companyStatus === 'paid' || status === 'collected') return false
        if (inv.payment_status === 'collected' || inv.payment_status === 'paid') return false
        const pendingAmount = parseFloat(inv.pending_amount ?? 0)
        if (pendingAmount <= 0) return false
        return true
      })
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
  }, [invoices, companies])

  const invoicesToCollect = useMemo(() => {
    return allInvoicesToCollect.slice(currentPageToCollect * itemsPerPage, (currentPageToCollect + 1) * itemsPerPage)
  }, [allInvoicesToCollect, currentPageToCollect])

  // Pending tasks sorted by priority and due date
  const pendingTasks = useMemo(() => {
    const priorityOrder: { [key: string]: number } = { high: 1, medium: 2, low: 3 }
    return tasks
      .filter(t => !t.is_completed)
      .sort((a, b) => {
        const aPriority = priorityOrder[a.priority || 'low']
        const bPriority = priorityOrder[b.priority || 'low']
        if (aPriority !== bPriority) return aPriority - bPriority
        if (a.due_date && b.due_date) {
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        }
        return 0
      })
  }, [tasks])

  const paginatedTasks = pendingTasks.slice(currentPageTasks * tasksPerPage, (currentPageTasks + 1) * tasksPerPage)

  // Generate chart data based on time filter with REAL data
  const chartData = useMemo(() => {
    const now = new Date()
    let dataPoints = 28
    let periodType: 'hours' | 'days' | 'months' = 'days'
    
    if (selectedTimeFilter === '24h') {
      dataPoints = 24
      periodType = 'hours'
    } else if (selectedTimeFilter === '7d') {
      dataPoints = 7
      periodType = 'days'
    } else if (selectedTimeFilter === '28d') {
      dataPoints = 28
      periodType = 'days'
    } else if (selectedTimeFilter === '3m') {
      dataPoints = 3
      periodType = 'months'
    } else if (selectedTimeFilter === '12m') {
      dataPoints = 12
      periodType = 'months'
    } else if (selectedTimeFilter === 'all') {
      dataPoints = 12
      periodType = 'months'
    }

    return Array.from({ length: dataPoints }, (_, i) => {
      let periodStart: Date
      let periodEnd: Date
      let label: string

      if (periodType === 'hours') {
        periodEnd = new Date(now.getTime() - i * 60 * 60 * 1000)
        periodStart = new Date(periodEnd.getTime() - 60 * 60 * 1000)
        label = `${periodEnd.getHours()}h`
      } else if (periodType === 'days') {
        periodEnd = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        periodStart = new Date(periodEnd.getTime() - 24 * 60 * 60 * 1000)
        label = `${periodEnd.getDate()}/${periodEnd.getMonth() + 1}`
      } else {
        periodEnd = new Date(now.getFullYear(), now.getMonth() - i, 1)
        periodStart = new Date(periodEnd.getFullYear(), periodEnd.getMonth() - 1, 1)
        label = periodEnd.toLocaleDateString('es-AR', { month: 'short' })
      }

      const facturacion = invoices
        .filter(inv => {
          const isIssuer = companies.some(c => c.id === inv.issuer_company_id)
          if (!isIssuer || inv.supplier_id) return false
          const isCreditNote = ['NCA', 'NCB', 'NCC', 'NCM', 'NCE'].includes(inv.type)
          const isDebitNote = ['NDA', 'NDB', 'NDC', 'NDM', 'NDE'].includes(inv.type)
          if (isCreditNote || isDebitNote) return false
          const invDate = new Date(inv.created_at || inv.issue_date)
          return invDate >= periodStart && invDate < periodEnd
        })
        .reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0)

      const facturasPagar = invoices
        .filter(inv => {
          const isReceiver = companies.some(c => c.id === inv.receiver_company_id)
          if (!isReceiver) return false
          const isCreditNote = ['NCA', 'NCB', 'NCC', 'NCM', 'NCE'].includes(inv.type)
          const isDebitNote = ['NDA', 'NDB', 'NDC', 'NDM', 'NDE'].includes(inv.type)
          if (isCreditNote || isDebitNote) return false
          const invDate = new Date(inv.created_at || inv.issue_date)
          return invDate >= periodStart && invDate < periodEnd
        })
        .reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0)

      return {
        label,
        facturacion: Math.round(facturacion),
        facturasPagar: Math.round(facturasPagar)
      }
    }).reverse()
  }, [selectedTimeFilter, invoices, companies])

  if (authLoading || loading) {
    return <DashboardSkeleton />
  }

  if (!isAuthenticated) return null

  const totalPagesToPay = Math.ceil(allInvoicesToPay.length / itemsPerPage)
  const totalPagesToCollect = Math.ceil(allInvoicesToCollect.length / itemsPerPage)
  const totalPagesTasks = Math.ceil(pendingTasks.length / tasksPerPage)

  return (
        <div className="min-h-screen bg-white overflow-x-hidden">
          <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 pb-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
              <div className="flex-1 min-w-0">
                <ResponsiveHeading level="h1">
                  Mi Dashboard
                </ResponsiveHeading>
                <ResponsiveText className="mt-1">
                  Bienvenido de vuelta. Aquí está tu resumen financiero.
                </ResponsiveText>
              </div>
              
              {/* Filtros - responsive: arriba a la derecha en desktop, abajo en mobile */}
              <div className="w-full lg:w-auto lg:flex-shrink-0 lg:mt-0">
                <Tabs 
                  value={selectedTimeFilter} 
                  onValueChange={(value) => setSelectedTimeFilter(value as TimeFilter)}
                >
                  <TabsList className="w-full lg:w-auto justify-start lg:justify-end gap-2">
                    <TabsTrigger value="7d">
                      7 días
                    </TabsTrigger>
                    <TabsTrigger value="28d">
                      28 días
                    </TabsTrigger>
                    <TabsTrigger value="3m">
                      3 meses
                    </TabsTrigger>
                    <TabsTrigger value="12m">
                      12 meses
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <div className="space-y-6">
            <CardCarousel desktopCols={3} mobileBreakpoint="md">
              <Card className="shadow-sm border border-gray-200">
                <CardHeader className="pb-3">
                  <CardDescription className="text-sm text-gray-500 font-light">Cuentas a cobrar</CardDescription>
                  <CardTitle className={`${getResponsiveFontSize('h2')} truncate`}>
                    {formatCompactAmount(kpis.receivable)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col h-full">
                    <div className="space-y-1 flex-1">
                      <div className="text-sm text-gray-600 font-medium-heading truncate">
                        {formatCompactAmount(kpis.receivableByCurrency.USD, 'USD')}
                      </div>
                      <div className="text-sm text-gray-600 font-medium-heading truncate">
                        {formatCompactAmount(kpis.receivableByCurrency.EUR, 'EUR')}
                      </div>
                    </div>
                    <div className={`flex items-center text-sm font-light mt-2 ${kpis.receivableChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {kpis.receivableChange >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                      <span>{kpis.receivableChange >= 0 ? '+' : ''}{kpis.receivableChange.toFixed(1)}% {kpis.periodLabel}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border border-gray-200">
                <CardHeader className="pb-3">
                  <CardDescription className="text-sm text-gray-500 font-light">Cuentas por pagar</CardDescription>
                  <CardTitle className={`${getResponsiveFontSize('h2')} truncate`}>
                    {formatCompactAmount(kpis.payable)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col h-full">
                    <div className="space-y-1 flex-1">
                      <div className="text-sm text-gray-600 font-medium-heading truncate">
                        {formatCompactAmount(kpis.payableByCurrency.USD, 'USD')}
                      </div>
                      <div className="text-sm text-gray-600 font-medium-heading truncate">
                        {formatCompactAmount(kpis.payableByCurrency.EUR, 'EUR')}
                      </div>
                    </div>
                    <div className={`flex items-center text-sm font-light mt-2 ${kpis.payableChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {kpis.payableChange >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                      <span>{kpis.payableChange >= 0 ? '+' : ''}{kpis.payableChange.toFixed(1)}% {kpis.periodLabel}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border border-gray-200">
                <CardHeader className="pb-3">
                  <CardDescription className="text-sm text-gray-500 font-light">Saldo IVA</CardDescription>
                  <CardTitle className={`${getResponsiveFontSize('h2')} truncate`}>
                    {formatCompactAmount(kpis.vatBalance)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col h-full">
                    <div className="space-y-1 flex-1 invisible">
                      <div className="text-sm text-gray-600 font-medium-heading">
                        US$ 0.00
                      </div>
                      <div className="text-sm text-gray-600 font-medium-heading">
                        € 0.00
                      </div>
                    </div>
                    <div className={`flex items-center text-sm font-light ${kpis.vatBalanceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {kpis.vatBalanceChange >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                      <span>{kpis.vatBalanceChange >= 0 ? '+' : ''}{kpis.vatBalanceChange.toFixed(1)}% {kpis.periodLabel}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardCarousel>

            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start min-h-0">
                <div className="flex flex-col gap-6 lg:col-span-2">
                  <Card className="shadow-sm border border-gray-200">
                    <CardHeader>
                      <ResponsiveHeading level="h3" as="h2" className="text-gray-900">
                        Tendencia de Flujo de Caja
                      </ResponsiveHeading>
                    </CardHeader>
                    <CardContent className="overflow-hidden">
                      <div className="w-full overflow-x-auto">
                        <div className="min-w-[300px]">
                          <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm border border-gray-200 min-w-0">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <ResponsiveHeading level="h3" as="h2" className="text-gray-900">
                          Tareas Pendientes
                        </ResponsiveHeading>
                        <CardDescription className="mt-1 font-light">
                          {pendingTasks.length} tareas por completar
                        </CardDescription>
                      </div>
                      <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
                        {selectedDashboardTasks.size > 0 && (
                          <Button 
                            variant="outline"
                            onClick={handleCompleteSelectedDashboardTasks}
                            disabled={isCompletingDashboardTasks}
                            size="sm"
                            className="flex-1 sm:flex-none"
                          >
                            {isCompletingDashboardTasks ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                <span className="hidden sm:inline">
                                  {tasks.find(t => t.id === Array.from(selectedDashboardTasks)[0])?.is_completed ? 'Desmarcando...' : 'Completando...'}
                                </span>
                                <span className="sm:hidden">
                                  {tasks.find(t => t.id === Array.from(selectedDashboardTasks)[0])?.is_completed ? 'Desm...' : 'Comp...'}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="hidden sm:inline">
                                  {tasks.find(t => t.id === Array.from(selectedDashboardTasks)[0])?.is_completed ? 'Desmarcar' : 'Completar'} ({selectedDashboardTasks.size})
                                </span>
                                <span className="sm:hidden">
                                  {tasks.find(t => t.id === Array.from(selectedDashboardTasks)[0])?.is_completed ? 'Desm.' : 'Comp.'} ({selectedDashboardTasks.size})
                                </span>
                              </>
                            )}
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => router.push('/tasks')} className="flex-1 sm:flex-none">
                          Ver tareas
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="min-w-0">
                      <div className="space-y-2">
                        {paginatedTasks.length === 0 ? (
                          <p className="text-center py-8 text-gray-500">No hay tareas pendientes</p>
                        ) : (
                          paginatedTasks.map((task) => (
                            <div 
                              key={task.id} 
                              className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                              onClick={() => handleToggleTaskSelection(task.id)}
                            >
                              <Checkbox
                                checked={selectedDashboardTasks.has(task.id)}
                                onCheckedChange={() => handleToggleTaskSelection(task.id)}
                              />
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium-heading text-sm truncate ${task.is_completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                  {task.title}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                  {task.due_date && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3 text-gray-400" />
                                      <span className="text-xs text-gray-500 font-light">
                                        {parseDateLocal(task.due_date)?.toLocaleDateString('es-AR')}
                                      </span>
                                    </div>
                                  )}
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
                          ))
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTasksPagination(Math.max(0, currentPageTasks - 1))}
                          disabled={currentPageTasks === 0}
                          className="h-9 px-3 transition-none"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-gray-500 font-light">
                          {currentPageTasks + 1} / {totalPagesTasks || 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTasksPagination(Math.min(totalPagesTasks - 1, currentPageTasks + 1))}
                          disabled={currentPageTasks === totalPagesTasks - 1 || totalPagesTasks <= 1}
                          className="h-9 px-3 transition-none"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex flex-col gap-6 lg:col-span-1 min-h-0 min-w-0">
                  <Card className="shadow-sm border border-gray-200 flex flex-col flex-1 min-w-0">
                    <CardHeader>
                      <ResponsiveHeading level="h3" as="h2" className="text-gray-900">
                        Facturas a Pagar
                      </ResponsiveHeading>
                    </CardHeader>
                    <CardContent className="min-w-0">
                      <div>
                        {invoicesToPay.length === 0 ? (
                          <p className="text-center py-8 text-gray-500">No hay facturas por pagar</p>
                        ) : (
                          invoicesToPay.map((invoice) => {
                            const balance = parseFloat(invoice.pending_amount ?? 0)
                            const originalTotal = parseFloat(invoice.total || 0)
                            const creditNotes = invoice.credit_notes_applied || []
                            const debitNotes = invoice.debit_notes_applied || []
                            const totalNC = creditNotes.reduce((sum: number, nc: any) => sum + parseFloat(nc.amount || 0), 0)
                            const totalND = debitNotes.reduce((sum: number, nd: any) => sum + parseFloat(nd.amount || 0), 0)
                            const hasAdjustments = creditNotes.length > 0 || debitNotes.length > 0
                            const currency = invoice.currency || 'ARS'
                            const currencySymbol = currency === 'USD' ? 'US$' : currency === 'EUR' ? '€' : '$'
                            return (
                            <Link key={invoice.id} href={`/company/${invoice.receiver_company_id}/invoices/${invoice.id}`}>
                              <div className="py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer rounded px-2 -mx-2">
                                <div className="space-y-1.5">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium-heading text-gray-900 text-sm truncate">
                                        {invoice.supplier?.business_name || 
                                         invoice.client?.business_name ||
                                         invoice.issuer_name || 
                                         (invoice.supplier?.first_name && invoice.supplier?.last_name ? `${invoice.supplier.first_name} ${invoice.supplier.last_name}` : null) ||
                                         (invoice.client?.first_name && invoice.client?.last_name ? `${invoice.client.first_name} ${invoice.client.last_name}` : null) ||
                                         invoice.issuerCompany?.business_name || 
                                         invoice.issuerCompany?.name ||
                                         invoice.issuer?.business_name ||
                                         invoice.issuer?.name ||
                                         'Proveedor'}
                                      </p>
                                      <p className="text-sm text-gray-500 font-light truncate">
                                        {invoice.type} {String(invoice.sales_point || 0).padStart(4, '0')}-{String(invoice.voucher_number || 0).padStart(8, '0')}
                                      </p>
                                      <p className="text-sm text-gray-400 font-light">
                                        Vence: {parseDateLocal(invoice.due_date)?.toLocaleDateString('es-AR')}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      {hasAdjustments ? (
                                        <div className="space-y-1">
                                          <p className="text-xs text-gray-500 font-light">Original: {currencySymbol}{originalTotal.toLocaleString('es-AR', {minimumFractionDigits: 2})}</p>
                                          {totalNC > 0 && (
                                            <p className="text-xs text-green-600 font-light">NC: -{currencySymbol}{totalNC.toLocaleString('es-AR', {minimumFractionDigits: 2})}</p>
                                          )}
                                          {totalND > 0 && (
                                            <p className="text-xs text-orange-600 font-light">ND: +{currencySymbol}{totalND.toLocaleString('es-AR', {minimumFractionDigits: 2})}</p>
                                          )}
                                          <div className="pt-1 border-t border-gray-200">
                                            <p className="font-medium-heading text-gray-900 text-sm">A pagar: {currencySymbol}{balance.toLocaleString('es-AR', {minimumFractionDigits: 2})}</p>
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="font-medium-heading text-gray-900 text-sm">
                                          {currencySymbol}{balance.toLocaleString('es-AR', {minimumFractionDigits: 2})}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          )})
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                        <Button variant="ghost" size="sm" onClick={() => handleToPayPagination(Math.max(0, currentPageToPay - 1))} disabled={currentPageToPay === 0} className="h-9 px-3 transition-none">
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-gray-500 font-light">{currentPageToPay + 1} / {totalPagesToPay || 1}</span>
                        <Button variant="ghost" size="sm" onClick={() => handleToPayPagination(Math.min(totalPagesToPay - 1, currentPageToPay + 1))} disabled={currentPageToPay === totalPagesToPay - 1 || totalPagesToPay <= 1} className="h-9 px-3 transition-none">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm border border-gray-200 min-w-0">
                    <CardHeader>
                      <ResponsiveHeading level="h3" as="h2" className="text-gray-900">
                        Facturas a Cobrar
                      </ResponsiveHeading>
                    </CardHeader>
                    <CardContent className="min-w-0">
                      <div>
                        {invoicesToCollect.length === 0 ? (
                          <p className="text-center py-8 text-gray-500">No hay facturas por cobrar</p>
                        ) : (
                          invoicesToCollect.map((invoice) => {
                            const balance = parseFloat(invoice.pending_amount ?? 0)
                            const originalTotal = parseFloat(invoice.total || 0)
                            const creditNotes = invoice.credit_notes_applied || []
                            const debitNotes = invoice.debit_notes_applied || []
                            const totalNC = creditNotes.reduce((sum: number, nc: any) => sum + parseFloat(nc.amount || 0), 0)
                            const totalND = debitNotes.reduce((sum: number, nd: any) => sum + parseFloat(nd.amount || 0), 0)
                            const hasAdjustments = creditNotes.length > 0 || debitNotes.length > 0
                            const currency = invoice.currency || 'ARS'
                            const currencySymbol = currency === 'USD' ? 'US$' : currency === 'EUR' ? '€' : '$'
                            return (
                            <Link key={invoice.id} href={`/company/${invoice.issuer_company_id}/invoices/${invoice.id}`}>
                              <div className="py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer rounded px-2 -mx-2">
                                <div className="space-y-1.5">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium-heading text-gray-900 text-sm truncate">
                                        {invoice.receiver_name || 
                                         invoice.client?.business_name || 
                                         (invoice.client?.first_name && invoice.client?.last_name ? `${invoice.client.first_name} ${invoice.client.last_name}` : null) || 
                                         invoice.receiverCompany?.name || 
                                         invoice.receiverCompany?.business_name ||
                                         invoice.receiver?.business_name ||
                                         invoice.receiver?.name ||
                                         'Cliente'}
                                      </p>
                                      <p className="text-sm text-gray-500 font-light truncate">
                                        {invoice.type} {String(invoice.sales_point || 0).padStart(4, '0')}-{String(invoice.voucher_number || 0).padStart(8, '0')}
                                      </p>
                                      <p className="text-sm text-gray-400 font-light">
                                        Vence: {parseDateLocal(invoice.due_date)?.toLocaleDateString('es-AR')}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      {hasAdjustments ? (
                                        <div className="space-y-1">
                                          <p className="text-xs text-gray-500 font-light">Original: {currencySymbol}{originalTotal.toLocaleString('es-AR', {minimumFractionDigits: 2})}</p>
                                          {totalNC > 0 && (
                                            <p className="text-xs text-green-600 font-light">NC: -{currencySymbol}{totalNC.toLocaleString('es-AR', {minimumFractionDigits: 2})}</p>
                                          )}
                                          {totalND > 0 && (
                                            <p className="text-xs text-orange-600 font-light">ND: +{currencySymbol}{totalND.toLocaleString('es-AR', {minimumFractionDigits: 2})}</p>
                                          )}
                                          <div className="pt-1 border-t border-gray-200">
                                            <p className="font-medium-heading text-gray-900 text-sm">A cobrar: {currencySymbol}{balance.toLocaleString('es-AR', {minimumFractionDigits: 2})}</p>
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="font-medium-heading text-gray-900 text-sm">
                                          {currencySymbol}{balance.toLocaleString('es-AR', {minimumFractionDigits: 2})}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          )})
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                        <Button variant="ghost" size="sm" onClick={() => handleToCollectPagination(Math.max(0, currentPageToCollect - 1))} disabled={currentPageToCollect === 0} className="h-9 px-3 transition-none">
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-gray-500 font-light">{currentPageToCollect + 1} / {totalPagesToCollect || 1}</span>
                        <Button variant="ghost" size="sm" onClick={() => handleToCollectPagination(Math.min(totalPagesToCollect - 1, currentPageToCollect + 1))} disabled={currentPageToCollect === totalPagesToCollect - 1 || totalPagesToCollect <= 1} className="h-9 px-3 transition-none">
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
        </div>
  )
}
