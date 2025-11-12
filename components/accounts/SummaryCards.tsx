"use client"

import { DollarSign, AlertCircle, Calendar, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface SummaryCardsProps {
  summary: {
    total_pending: number
    overdue_count: number
    overdue_amount: number
    total_collected?: number
    total_paid?: number
    upcoming_count?: number
    upcoming_amount?: number
  }
  invoiceCount: number
  filters: { from_date: string; to_date: string }
  formatCurrency: (amount: number) => string
  type: 'receivable' | 'payable'
}

export function SummaryCards({ summary, invoiceCount, filters, formatCurrency, type }: SummaryCardsProps) {
  const hasFilters = filters.from_date || filters.to_date

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="pb-3">
          <CardDescription className="text-sm text-gray-500 font-light">
            {type === 'receivable' ? 'Pendiente de Cobro' : 'Pendiente de Pago'}
          </CardDescription>
          <CardTitle className="text-2xl font-medium-heading text-gray-900">
            {formatCurrency(summary.total_pending)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-sm font-light text-gray-600">
            <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
            <span>{hasFilters ? 'Del periodo filtrado' : 'Total pendiente'}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="pb-3">
          <CardDescription className="text-sm text-gray-500 font-light">Facturas Vencidas</CardDescription>
          <CardTitle className="text-2xl font-medium-heading text-red-600">
            {summary.overdue_count}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 mb-2">
            <div className="text-sm text-gray-600 font-medium-heading">
              {formatCurrency(summary.overdue_amount)}
            </div>
          </div>
          <div className="flex items-center text-sm font-light text-gray-600">
            <AlertCircle className="h-4 w-4 mr-2 text-gray-400" />
            <span>Requieren gestión</span>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="pb-3">
          <CardDescription className="text-sm text-gray-500 font-light">
            {type === 'receivable' ? 'Próx. Venc.' : 'Próximos Vencimientos'}
          </CardDescription>
          <CardTitle className="text-2xl font-medium-heading text-yellow-600">
            {type === 'receivable' ? summary.upcoming_count || 0 : summary.upcoming_count || 0}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 mb-2">
            <div className="text-sm text-gray-600 font-medium-heading">
              {formatCurrency(summary.upcoming_amount || 0)}
            </div>
          </div>
          <div className="flex items-center text-sm font-light text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            <span>7 días anteriores</span>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="pb-3">
          <CardDescription className="text-sm text-gray-500 font-light">
            {type === 'receivable' ? 'Cobrado' : 'Pagado'}
          </CardDescription>
          <CardTitle className="text-2xl font-medium-heading text-green-600">
            {formatCurrency(type === 'receivable' ? summary.total_collected || 0 : summary.total_paid || 0)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-sm font-light text-gray-600">
            <TrendingUp className="h-4 w-4 mr-2 text-gray-400" />
            <span>{hasFilters ? 'Del periodo filtrado' : 'Total histórico'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
