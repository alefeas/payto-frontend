"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator } from "lucide-react"

interface InvoiceTotalsCardProps {
  subtotal: number
  totalTaxes: number
  totalPerceptions: number
  total: number
  currency: string
  getCurrencySymbol: (currency: string) => string
  availableBalance?: number
}

export function InvoiceTotalsCard({
  subtotal,
  totalTaxes,
  totalPerceptions,
  total,
  currency,
  getCurrencySymbol,
  availableBalance
}: InvoiceTotalsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Resumen de Totales
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-medium">
              {getCurrencySymbol(currency)}{subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total Impuestos:</span>
            <span className="font-medium">
              {getCurrencySymbol(currency)}{totalTaxes.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          {totalPerceptions > 0 && (
            <div className="flex justify-between">
              <span>Total Percepciones:</span>
              <span className="font-medium text-orange-600">
                {getCurrencySymbol(currency)}{totalPerceptions.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total:</span>
            <span>
              {getCurrencySymbol(currency)}{total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          {availableBalance !== undefined && (
            <div className="flex justify-between text-sm text-muted-foreground border-t pt-2">
              <span>Saldo Disponible:</span>
              <span className={total > availableBalance ? 'text-red-600 font-bold' : 'text-green-600'}>
                {getCurrencySymbol(currency)}{availableBalance.toLocaleString('es-AR')}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
