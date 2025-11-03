"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, TrendingDown, TrendingUp } from "lucide-react"

interface BalanceItem {
  id: string
  type: string
  voucher_number: string
  issue_date: string
  due_date?: string
  supplier_name?: string
  client_name?: string
  total: number
  collected_amount?: number
  pending_amount?: number
  balance_type: 'credit' | 'debit'
  description: string
}

interface BalancesTabProps {
  creditNotes: BalanceItem[]
  debitNotes: BalanceItem[]
  summary: {
    total_credits: number
    total_debits: number
    net_balance: number
    net_balance_type: 'credit' | 'debit'
  }
  formatCurrency: (amount: number) => string
  onView?: (id: string) => void
  type: 'receivable' | 'payable'
  filters?: { search?: string }
}

export function BalancesTab({
  creditNotes,
  debitNotes,
  summary,
  formatCurrency,
  onView,
  type,
  filters
}: BalancesTabProps) {
  const entityNameField = type === 'receivable' ? 'client_name' : 'supplier_name'
  
  const filterNotes = (notes: BalanceItem[]) => {
    if (!filters?.search) return notes
    const searchLower = filters.search.toLowerCase().trim()
    const searchNumbers = filters.search.replace(/\D/g, '')
    
    return notes.filter((note) => {
      const entityName = (note[entityNameField] || '').toLowerCase()
      const voucherNumber = note.voucher_number.toLowerCase()
      const noteType = note.type.toLowerCase()
      
      return entityName.includes(searchLower) || 
             voucherNumber.includes(searchLower) ||
             noteType.includes(searchLower)
    })
  }
  
  const filteredCreditNotes = filterNotes(creditNotes)
  const filteredDebitNotes = filterNotes(debitNotes)
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {type === 'receivable' ? 'NC Sin Asociar' : 'NC Recibidas'}
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.total_credits)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredCreditNotes.length} {filteredCreditNotes.length === 1 ? 'nota' : 'notas'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {type === 'receivable' ? 'ND Sin Asociar' : 'ND Recibidas'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.total_debits)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredDebitNotes.length} {filteredDebitNotes.length === 1 ? 'nota' : 'notas'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Neto</CardTitle>
            {summary.net_balance_type === 'debit' ? (
              <TrendingUp className="h-4 w-4 text-red-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              summary.net_balance_type === 'debit' ? 'text-red-600' : 'text-green-600'
            }`}>
              {formatCurrency(Math.abs(summary.net_balance))}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.net_balance_type === 'debit' 
                ? (type === 'receivable' ? 'A cobrar adicional' : 'A pagar adicional')
                : (type === 'receivable' ? 'Crédito pendiente' : 'Crédito a favor')
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Credit Notes */}
      {filteredCreditNotes.length > 0 && (
        <div className="space-y-3">
          <div>
            <h3 className="text-base font-semibold mb-1">
              {type === 'receivable' ? 'Notas de Crédito Recibidas' : 'Notas de Crédito Recibidas'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {type === 'receivable' 
                ? 'NC recibidas sin factura asociada. Reducen el saldo a cobrar.'
                : 'NC recibidas sin factura asociada. Reducen el saldo a pagar.'
              }
            </p>
          </div>
          <div className="space-y-2">
            {filteredCreditNotes.map((nc) => (
              <div
                key={nc.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                      {nc.type}
                    </Badge>
                    <span className="font-medium">{nc.voucher_number}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {type === 'receivable' ? nc.client_name : nc.supplier_name}
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>Emisión: {new Date(nc.issue_date).toLocaleDateString('es-AR')}</span>
                    {nc.due_date && (
                      <span>Vencimiento: {new Date(nc.due_date).toLocaleDateString('es-AR')}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold text-lg text-blue-600">
                      {type === 'receivable' && nc.pending_amount !== undefined
                        ? formatCurrency(nc.pending_amount)
                        : formatCurrency(nc.total)
                      }
                    </div>
                    <div className="text-xs text-blue-600">
                      {nc.description}
                    </div>
                  </div>
                  {onView && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(nc.id)}
                      className="h-8 w-8"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debit Notes */}
      {filteredDebitNotes.length > 0 && (
        <div className="space-y-3">
          <div>
            <h3 className="text-base font-semibold mb-1">
              {type === 'receivable' ? 'Notas de Débito Recibidas' : 'Notas de Débito Recibidas'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {type === 'receivable' 
                ? 'ND recibidas sin factura asociada. Aumentan el saldo a pagar.'
                : 'ND recibidas sin factura asociada. Aumentan el saldo a pagar.'
              }
            </p>
          </div>
          <div className="space-y-2">
            {filteredDebitNotes.map((nd) => (
              <div
                key={nd.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                      {nd.type}
                    </Badge>
                    <span className="font-medium">{nd.voucher_number}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {type === 'receivable' ? nd.client_name : nd.supplier_name}
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>Emisión: {new Date(nd.issue_date).toLocaleDateString('es-AR')}</span>
                    {nd.due_date && (
                      <span>Vencimiento: {new Date(nd.due_date).toLocaleDateString('es-AR')}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold text-lg text-orange-600">
                      {type === 'receivable' && nd.pending_amount !== undefined
                        ? formatCurrency(nd.pending_amount)
                        : formatCurrency(nd.total)
                      }
                    </div>
                    <div className="text-xs text-orange-600">
                      {nd.description}
                    </div>
                  </div>
                  {onView && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(nd.id)}
                      className="h-8 w-8"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredCreditNotes.length === 0 && filteredDebitNotes.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No hay notas de crédito o débito sin factura asociada.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


