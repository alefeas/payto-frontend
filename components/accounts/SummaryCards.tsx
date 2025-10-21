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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {type === 'receivable' ? 'Pendiente de Cobro' : 'Pendiente de Pago'}
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.total_pending)}</div>
          <p className="text-xs text-muted-foreground">
            {hasFilters ? 'Del periodo filtrado' : 'Total pendiente'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Facturas Vencidas</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{summary.overdue_count}</div>
          <p className="text-xs text-muted-foreground">{formatCurrency(summary.overdue_amount)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {type === 'receivable' ? 'Facturas por Cobrar' : 'Próximos Vencimientos'}
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {type === 'receivable' ? invoiceCount : summary.upcoming_count || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {type === 'receivable' 
              ? 'Facturas emitidas' 
              : formatCurrency(summary.upcoming_amount || 0)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {type === 'receivable' ? 'Cobrado' : 'Pagado'}
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(type === 'receivable' ? summary.total_collected || 0 : summary.total_paid || 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            {hasFilters ? 'Del periodo filtrado' : 'Total histórico'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
