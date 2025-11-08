"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, TrendingDown, TrendingUp, FileText } from "lucide-react"

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
  currency?: string
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
  formatCurrency: (amount: number, currency?: string) => string
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
  
  const summaryByCurrency = { ARS: { credits: 0, debits: 0 }, USD: { credits: 0, debits: 0 }, EUR: { credits: 0, debits: 0 } }
  filteredCreditNotes.forEach(nc => {
    const curr = nc.currency || 'ARS'
    summaryByCurrency[curr].credits += nc.pending_amount || 0
  })
  filteredDebitNotes.forEach(nd => {
    const curr = nd.currency || 'ARS'
    summaryByCurrency[curr].debits += nd.pending_amount || 0
  })
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Saldos de NC/ND</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {filteredCreditNotes.length + filteredDebitNotes.length} nota{(filteredCreditNotes.length + filteredDebitNotes.length) !== 1 ? 's' : ''} sin asociar
        </p>
      </div>
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
            <div className="text-2xl font-bold mb-2">$ {summaryByCurrency.ARS.credits.toLocaleString('es-AR', {minimumFractionDigits: 2})}</div>
            <div className="flex gap-3 text-xs text-muted-foreground mb-2">
              <span>USD $ {summaryByCurrency.USD.credits.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
              <span>EUR € {summaryByCurrency.EUR.credits.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
            </div>
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
            <div className="text-2xl font-bold mb-2">$ {summaryByCurrency.ARS.debits.toLocaleString('es-AR', {minimumFractionDigits: 2})}</div>
            <div className="flex gap-3 text-xs text-muted-foreground mb-2">
              <span>USD $ {summaryByCurrency.USD.debits.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
              <span>EUR € {summaryByCurrency.EUR.debits.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
            </div>
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
            <div className="text-2xl font-bold mb-2">$ {(summaryByCurrency.ARS.debits - summaryByCurrency.ARS.credits).toLocaleString('es-AR', {minimumFractionDigits: 2})}</div>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>USD $ {(summaryByCurrency.USD.debits - summaryByCurrency.USD.credits).toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
              <span>EUR € {(summaryByCurrency.EUR.debits - summaryByCurrency.EUR.credits).toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
            </div>
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
                      {formatCurrency(
                        type === 'receivable' && nc.pending_amount !== undefined ? nc.pending_amount : nc.total,
                        nc.currency
                      )}
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
                      {formatCurrency(
                        type === 'receivable' && nd.pending_amount !== undefined ? nd.pending_amount : nd.total,
                        nd.currency
                      )}
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
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>No hay notas de crédito o débito sin factura asociada</p>
          <p className="text-xs mt-2">Las NC/ND sin asociar aparecerán aquí</p>
        </div>
      )}
    </div>
  )
}


