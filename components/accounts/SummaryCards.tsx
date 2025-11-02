"use client"

import { DollarSign, AlertCircle, Calendar, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="p-6 border border-gray-200 rounded-xl bg-white hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-muted-foreground">
            {type === 'receivable' ? 'Pendiente de Cobro' : 'Pendiente de Pago'}
          </p>
          <DollarSign className="h-5 w-5 text-blue-600" />
        </div>
        <div className="text-2xl font-bold">{formatCurrency(summary.total_pending)}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {hasFilters ? 'Del periodo filtrado' : 'Total pendiente'}
        </p>
      </div>

      <div className="p-6 border border-gray-200 rounded-xl bg-white hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-muted-foreground">Facturas Vencidas</p>
          <AlertCircle className="h-5 w-5 text-red-500" />
        </div>
        <div className="text-2xl font-bold text-red-600">{summary.overdue_count}</div>
        <p className="text-xs text-muted-foreground mt-1">{formatCurrency(summary.overdue_amount)}</p>
      </div>

      <div className="p-6 border border-gray-200 rounded-xl bg-white hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-muted-foreground">
            {type === 'receivable' ? 'Facturas por Cobrar' : 'Próximos Vencimientos'}
          </p>
          <Calendar className="h-5 w-5 text-yellow-600" />
        </div>
        <div className="text-2xl font-bold text-yellow-600">
          {type === 'receivable' ? invoiceCount : summary.upcoming_count || 0}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {type === 'receivable' 
            ? 'Facturas emitidas' 
            : formatCurrency(summary.upcoming_amount || 0)}
        </p>
      </div>

      <div className="p-6 border border-gray-200 rounded-xl bg-white hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-muted-foreground">
            {type === 'receivable' ? 'Cobrado' : 'Pagado'}
          </p>
          <TrendingUp className="h-5 w-5 text-green-600" />
        </div>
        <div className="text-2xl font-bold text-green-600">
          {formatCurrency(type === 'receivable' ? summary.total_collected || 0 : summary.total_paid || 0)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {hasFilters ? 'Del periodo filtrado' : 'Total histórico'}
        </p>
      </div>
    </div>
  )
}
